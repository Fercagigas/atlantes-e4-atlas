"""Verify that the atlas preserves the complete result archive and its bytes."""
from pathlib import Path
import base64,gzip,hashlib,json,re
SITE=Path(__file__).resolve().parents[1]
ROOT=SITE.parent
def jsdata(name,prefix):
    return json.loads((SITE/name).read_text(encoding='utf-8').removeprefix(prefix).removesuffix(';'))
def main():
    data=jsdata('data/study.js','window.ATLAS_DATA=')
    catalog=jsdata('data/catalog.js','window.ATLAS_CATALOG=')
    manifest=json.loads((SITE/'data/manifest.json').read_text(encoding='utf-8'))
    indexed={f['source']:f for f in manifest['files']}
    actual={}; errors=[]
    assert len({r['id'] for r in catalog})==len(catalog),'Duplicate result IDs'
    for r in catalog:
        p=SITE/'data/records'/f"{r['id']}.js"
        content=p.read_text(encoding='utf-8')
        rid,payload=json.loads('['+content.removeprefix('window.ATLAS_RECORD(').removesuffix(');')+']')
        assert rid==r['id']
        assert len(payload['files'])==r['count']
        for f in payload['files']:
            raw=(SITE/f['url']).read_bytes() if 'url' in f else gzip.decompress(base64.b64decode(f['gzip']))
            assert hashlib.sha256(raw).hexdigest()==f['sha256'],f['source']
            assert len(raw)==f['bytes']
            assert f['sha256']==indexed[f['source']]['sha256']
            if '::' not in f['source']:
                original=ROOT/f['source']
                assert original.is_file(),str(original)
                assert hashlib.sha256(original.read_bytes()).hexdigest()==f['sha256'],f['source']
            actual[f['source']]=f
        for fig in r['figures']:assert (SITE/fig['url']).is_file()
    assert set(actual)==set(indexed),'Manifest does not match payloads'
    all_results={p.relative_to(ROOT).as_posix() for p in (ROOT/'resultados').rglob('*') if p.is_file()}
    assert all_results.issubset(actual),'Missing result files: '+str(all_results-set(actual))
    assert len(catalog)==data['meta']['records']
    assert len(manifest['files'])==data['meta']['files']
    for doc in data['documents']:assert (SITE/doc['url']).is_file()
    for src in re.findall(r'(?:src|href)="([^"]+)"',(SITE/'index.html').read_text(encoding='utf-8')):
        if src.startswith(('http','#')):continue
        assert (SITE/src).is_file(),src
    assert len(data['countries']['mundo/depurada'])==184
    assert len(data['countries']['asia_pacifico/depurada'])==35
    assert len(data['countries']['EUR/depurada'])==51
    assert data['sem']['SEAR/depurada/C1']['estado']=='no_aplicable'
    assert len(data['tables']['primary_coefficients'])==672
    assert len(data['tables']['application'])==768
    # The presentation maps totals to each case's reference root. C8's second
    # root remains in the original CSV/JSON and is not pooled with governance.
    assert len(data['tables']['sensitivity_quantities'])==5696
    assert len(data['tables']['country_influence'])==30668
    assert len(data['tables']['joint_metrics'])==91
    assert len(data['tables']['coverage'])==144
    assert len(data['cases'])==8 and 'C9' in data['cases'] and 'C6' not in data['cases']
    assert len({r['k'] for r in data['tables']['simulation_metrics']})==72
    measurement=jsdata('data/measurement.js','window.ATLAS_MEASUREMENT=')
    assert measurement['run_id']==data['meta']['run_id']=='20261018_definitiva'
    assert len(measurement['diagnostics'])==54
    for path,digest in measurement['sources'].items():
        assert hashlib.sha256((ROOT/path).read_bytes()).hexdigest()==digest,path
    def finite_values(value):
        import math
        if isinstance(value,float) and not math.isfinite(value):return None
        if isinstance(value,dict):return {k:finite_values(v) for k,v in value.items()}
        if isinstance(value,list):return [finite_values(v) for v in value]
        return value
    for bundle in measurement['diagnostics'].values():
        for entry in bundle.values():
            original=finite_values(json.loads((ROOT/entry['source']).read_text(encoding='utf-8')))
            assert entry['estado']==original['estado'],entry['source']
            for field,value in entry['datos'].items():
                assert value==original.get('datos',{})[field],(entry['source'],field)
    context=jsdata('data/context.js','window.ATLAS_CONTEXT=')
    assert context['run_id']==data['meta']['run_id']
    assert len(context['analyses'])==18
    for path,digest in context['sources'].items():
        assert hashlib.sha256((ROOT/path).read_bytes()).hexdigest()==digest,path
    for bundle in context['analyses'].values():
        for scopes in bundle.values():
            for entry in scopes.values():
                original=finite_values(json.loads((ROOT/entry['source']).read_text(encoding='utf-8')))
                assert {k:v for k,v in entry.items() if k!='source'}==original,entry['source']
    claims=json.loads((ROOT/'publicacion/definitiva/paper/reproducibility/claims.json').read_text(encoding='utf-8'))
    for key,value in context['paper_values'].items():assert claims['values'][key]==value,key
    size=sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file())
    assert size<1_000_000_000,'Site exceeds GitHub Pages 1 GB size'
    report={'result':'PASS','catalog_entries':len(catalog),'original_files':len(actual),'result_files_covered':len(all_results),'bytes_verified':sum(f['bytes'] for f in actual.values()),'site_bytes':size,'data_tables':{k:len(v) for k,v in data['tables'].items()},'measurement_sources_verified':len(measurement['sources']),'context_and_paper_sources_verified':len(context['sources']),'browser_visual_review':'Not executed: no browser available through the session UI tool.'}
    (SITE/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))
if __name__=='__main__':main()
