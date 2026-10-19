"""Package the single verified definitive collection as a portable static atlas."""
from pathlib import Path
import ast
import base64
import collections
import gzip
import hashlib
import json
import shutil
from datetime import datetime, timezone

from build_data import ROOT, SITE, UNITS, clean, dumps, group, read, rows


def main():
    from build_measurement import main as build_measurement
    build_measurement()
    from build_context import main as build_context
    build_context()
    result_root = ROOT / 'resultados'
    provenance = read(result_root / '_procedencia/manifiesto.json')
    assert provenance['finalized'] and provenance['input_integrity'] == 'stable'
    assert not any(provenance['resumen_estados'].get(k, 0) for k in ['error', 'bloqueado'])
    for sub in ['data/records', 'assets/files', 'assets/figures']:
        target = (SITE/sub).resolve()
        assert target.is_relative_to(SITE.resolve())
        # Removal of obsolete generated files is performed by the PowerShell promotion.
        target.mkdir(parents=True, exist_ok=True)
        assert not any(target.iterdir()), f'Clean generated directory before rebuilding: {target}'
    data = {'meta': {'edition': 'Resultados definitivos · '+provenance['run_id'],
                    'run_id': provenance['run_id'], 'generated': datetime.now(timezone.utc).isoformat(),
                    'authors': ['Fernando Cagigas', 'Laura Monzón'], 'parameters': provenance['parametros']},
            'units': UNITS, 'countries': {}, 'cohorts': {}, 'sem': {}, 'descriptives': {},
            'tables': {k: [] for k in ['primary_coefficients', 'application', 'sensitivity_quantities',
                                     'sensitivity_coefficients', 'country_influence', 'simulation_metrics', 'joint_metrics', 'coverage']},
            'cases': {}, 'documents': []}
    tree = ast.parse((ROOT/'pipeline/core/casuisticas.py').read_text(encoding='utf-8'))
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == '_def':
            c = {}
            for kw in node.keywords:
                try:
                    c[kw.arg] = ast.literal_eval(kw.value)
                except (ValueError, TypeError):
                    pass
            data['cases'][c['id']] = c
    for u in UNITS:
        for sample in ['depurada', 'completa']:
            key = u+'/'+sample
            base = result_root/u/sample
            data['countries'][key] = rows(base/'00_datos/unidad/tablas/tabla_analitica.csv')
            data['cohorts'][key] = read(base/'00_datos/unidad/resultado.json')
            data['descriptives'][key] = read(base/'02_descriptivos/unidad/resultado.json').get('datos', {})
            for cid, case in data['cases'].items():
                meta = {'unit': u, 'sample': sample, 'specification': cid, 'root': case['raiz']}
                p = base/'08a_sem_ml'/cid/'resultado.json'
                v = read(p)
                d = v.get('datos', {})
                data['sem'][key+'/'+cid] = {**v, 'n': d.get('n'), 'm': d.get('m'),
                    **{k: d.get(k, {}) for k in ['completo', 'restringido', 'comparacion']},
                    'source': p.relative_to(ROOT).as_posix()}
                for path, coef in d.get('completo', {}).get('coeficientes', {}).items():
                    data['tables']['primary_coefficients'].append({**meta, 'n': d.get('n'), 'path': path, **coef})
                boot = read(base/'12a_ind_bootstrap'/cid/'resultado.json')
                b = boot.get('datos', {})
                bm = {**meta, **{k: b.get(k) for k in ['n', 'm', 'B', 'bootstrap_attempts', 'bootstrap_valid_joint']}}
                quantities = dict(b.get('conjuntos', {}).get('estimands', {}))
                quantities.update(b.get('efectos', {}))
                for q, e in quantities.items():
                    data['tables']['application'].append({**bm, 'quantity': q,
                        'label': e.get('label', q+' · raíz '+case['raiz']), 'point': e.get('obs'), 'state': e.get('state', 'ok'),
                        'pct95_low': e.get('pct95', [None, None])[0], 'pct95_high': e.get('pct95', [None, None])[1],
                        'bca95_low': e.get('bca95', [None, None])[0], 'bca95_high': e.get('bca95', [None, None])[1],
                        'p_boot': e.get('p_boot')})
                sens_dir = base/'22c_sensibilidad_integral'/cid
                sens = read(sens_dir/'resultado.json')
                data['tables']['coverage'].append({**meta, 'n': len(data['countries'][key]),
                    'SEM': v['estado'], 'SEM_reason': v.get('motivo', ''), 'bootstrap': boot['estado'],
                    'sensitivity': sens['estado'], 'scenarios': {k: val['state'] for k, val in sens.get('datos', {}).get('scenarios', {}).items()}})
                for label, scenario in sens.get('datos', {}).get('scenarios', {}).items():
                    sr = scenario.get('bootstrap', {})
                    sm = {**meta, **scenario.get('metadata', {}), 'scenario': label, 'scenario_state': scenario['state']}
                    eq = dict(sr.get('conjuntos', {}).get('estimands', {}))
                    eq.update(sr.get('efectos', {}))
                    for q, e in eq.items():
                        data['tables']['sensitivity_quantities'].append({**sm, 'quantity': q, 'point': e.get('obs'),
                            'pct95_low': e.get('pct95', [None,None])[0], 'pct95_high': e.get('pct95', [None,None])[1],
                            'bca95_low': e.get('bca95', [None,None])[0], 'bca95_high': e.get('bca95', [None,None])[1],
                            'state': e.get('state','ok'), 'p_boot': e.get('p_boot'), 'valid_joint': sr.get('bootstrap_valid_joint'),
                            'bootstrap_failures': len(sr.get('bootstrap_failures', []))})
                    for q, val in scenario.get('points', {}).items():
                        # Only the reference root is mapped to unqualified total quantities.
                        if ':' in q:
                            qname, root = q.split(':', 1)
                            if root != case['raiz']:
                                continue
                            q = qname
                        data['tables']['sensitivity_quantities'].append({**sm, 'quantity': q, 'point': val, 'point_only': True})
                for filename, table_name in [('country_influence', 'country_influence'), ('coefficients', 'sensitivity_coefficients')]:
                    p = sens_dir/'tablas'/(filename+'.csv')
                    if p.exists():
                        for row in rows(p):
                            q = row.get('quantity', '')
                            if ':' in q:
                                qname, root = q.split(':', 1)
                                if root != case['raiz']:
                                    continue
                                row['quantity'] = qname
                            data['tables'][table_name].append({**meta, **row})
    sim = result_root/'simulacion/resumen/todas/tablas/metricas.csv'
    data['tables']['simulation_metrics'] = rows(sim)
    for r in read(result_root/'simulacion/conjunta/summary.json'):
        data['tables']['joint_metrics'].append({**{k:r.get(k) for k in ['cell','quantity','method','truth','attempts','valid_intervals','bias','bias_mcse','rmse']},
            **{key+'_'+part: value for key in ['coverage_conditional','coverage_all_attempts','interval_failure']
               for part,value in r[key].items()}})
    data['centroids'] = rows(ROOT/'datos_origen/referencia/centroides_paises.csv')
    records, inventory, assets, assigned = [], [], {}, set()

    def pack(p):
        raw = p.read_bytes()
        sha = hashlib.sha256(raw).hexdigest()
        src = p.relative_to(ROOT).as_posix()
        item = {'name': p.name, 'source': src, 'sha256': sha, 'bytes': len(raw), 'ext': p.suffix.lower()}
        inventory.append({'source': src, 'sha256': sha, 'bytes': len(raw)})
        if p.is_relative_to(ROOT/'publicacion/definitiva'):
            dest = 'documents/definitiva/'+p.relative_to(ROOT/'publicacion/definitiva').as_posix()
            (SITE/dest).parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(p, SITE/dest)
            # CSVs still use their compressed wrapper in the raw-data viewer.
            if p.suffix.lower() in ['.html','.pdf','.docx','.zip','.png']:
                item['url'] = dest
            else:
                item['gzip'] = base64.b64encode(gzip.compress(raw, compresslevel=6, mtime=0)).decode()
        elif p.suffix.lower() in ['.png', '.jpg', '.svg', '.pdf', '.docx', '.html']:
            dest = 'assets/'+('figures' if p.suffix.lower() in ['.png', '.jpg', '.svg'] else 'files')+'/'+sha[:24]+p.suffix.lower()
            if sha not in assets:
                shutil.copyfile(p, SITE/dest)
                assets[sha] = dest
            item['url'] = assets[sha]
        else:
            item['gzip'] = base64.b64encode(gzip.compress(raw, compresslevel=6, mtime=0)).decode()
        return item

    def record(parent, files, unit, sample, method, scope, state='documento', reason='', kind=None):
        src = parent.relative_to(ROOT).as_posix()
        rid = hashlib.sha256(src.encode()).hexdigest()[:16]
        payload = [pack(p) for p in files]
        assigned.update(p.resolve() for p in files)
        (SITE/'data/records'/f'{rid}.js').write_text('window.ATLAS_RECORD('+dumps(rid)+','+dumps({'files': payload})+');', encoding='utf-8')
        records.append({'id': rid, 'unit': unit, 'sample': sample, 'method': method, 'scope': scope,
            'group': kind or group(method), 'edition': 'Definitiva', 'state': state, 'reason': reason, 'source': src,
            'filenames': [f['name'] for f in payload], 'count': len(files), 'bytes': sum(f['bytes'] for f in payload),
            'figures': [{'url': f['url'], 'name': f['name']} for f in payload if f['ext'] in ['.png','.jpg','.svg']]})
        for f in payload:
            if f['ext'] in ['.pdf', '.docx', '.html', '.zip']:
                data['documents'].append({'name': Path(f['name']).stem, 'source': f['source'], 'unit': unit, 'url': f['url'], 'edition': 'Definitiva'})

    for index, p in enumerate(sorted(result_root.rglob('resultado.json'))):
        parts = p.relative_to(result_root).parts
        if parts[0] in UNITS:
            u, sample, method, scope = parts[:4]
        elif parts[0] == 'simulacion':
            u, sample, method, scope = 'simulacion', 'todas', 'simulacion_'+parts[1], '/'.join(parts[2:-1])
        else:
            u, sample, method, scope = 'comparativa', parts[1], parts[0], 'unidad'
        v = read(p)
        record(p.parent, sorted(f for f in p.parent.rglob('*') if f.is_file()), u, sample, method, scope,
               v.get('estado','desconocido'), v.get('motivo',''))
        if index % 500 == 0:
            print('Packed', index, flush=True)
    extra = [p for p in result_root.rglob('*') if p.is_file() and p.resolve() not in assigned]
    for parent in sorted({p.parent for p in extra}):
        record(parent, [p for p in extra if p.parent == parent], 'archivo', 'todas', parent.name, 'unidad', kind='Procedencia')
    for folder in ['publicacion/definitiva', 'memoria_trabajo/decisiones']:
        files = [p for p in (ROOT/folder).rglob('*') if p.is_file() and p.suffix in ['.md','.html','.csv','.json','.pdf','.docx','.zip','.png']
                 and (folder == 'publicacion/definitiva' or p.name.startswith('ADR-0021'))]
        for parent in sorted({p.parent for p in files}):
            record(parent, [p for p in files if p.parent == parent], 'documentacion', 'todas', parent.name, 'unidad', kind='Documentación')
    for report in read(ROOT/'publicacion/definitiva/informes.json'):
        parent=(ROOT/report['source']).parent
        files=[ROOT/report[k] for k in ['source','html','pdf']]
        record(parent,files,report['unit'],'ambas','informe_definitivo',parent.name,kind='Documentación')
    method_files=[ROOT/'metodologia'/('metodologia.'+ext) for ext in ['tex','pdf']]
    record(ROOT/'metodologia',method_files,'documentacion','todas','metodologia','unidad',kind='Documentación')
    counts = dict(collections.Counter(r['state'] for r in records))
    data['meta'].update(records=len(records), files=len(inventory), original_bytes=sum(f['bytes'] for f in inventory),
                        states=counts, figure_count=sum(len(r['figures']) for r in records))
    (SITE/'data/study.js').write_text('window.ATLAS_DATA='+dumps(data)+';', encoding='utf-8')
    (SITE/'data/catalog.js').write_text('window.ATLAS_CATALOG='+dumps(records)+';', encoding='utf-8')
    (SITE/'data/manifest.json').write_text(dumps({'meta': data['meta'], 'files': inventory}), encoding='utf-8')
    (SITE/'data/geography.js').write_text('window.ATLAS_GEO='+dumps(read(ROOT/'datos_origen/referencia/geo/paises_ne50m.geojson'))+';', encoding='utf-8')
    print(dumps(data['meta']))


if __name__ == '__main__':
    main()
