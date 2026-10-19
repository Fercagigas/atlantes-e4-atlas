"""Extract visual measurement diagnostics from verified definitive task outputs."""
from pathlib import Path
import hashlib
import json

ROOT=Path(__file__).resolve().parents[2]
SITE=ROOT/'GithubPages'
METHODS=['03_psicometria','04a_ave','04b_htmt','04e_omega_h','04f_efa','04g_unifactorial','04_validez_discriminante']

def main():
    manifest=json.loads((ROOT/'resultados/_procedencia/manifiesto.json').read_text(encoding='utf-8'))
    assert manifest['run_id']=='20261018_definitiva' and manifest['finalized']
    output={'run_id':manifest['run_id'],'diagnostics':{},'sources':{}}
    for unit in manifest['parametros']['unidades']:
        for sample in ['depurada','completa']:
            for family in ['GAC','EDINV','GOBCAP']:
                bundle={}
                for method in METHODS:
                    p=ROOT/'resultados'/unit/sample/method/family/'resultado.json'
                    if not p.exists():continue
                    raw=p.read_bytes();digest=hashlib.sha256(raw).hexdigest()
                    marker=json.loads((p.parent/'_tarea.json').read_text(encoding='utf-8'))
                    assert marker['salidas']['resultado.json']==digest,p
                    original=json.loads(raw);data=original.get('datos',{})
                    if method=='03_psicometria':
                        keys=['familia','n','m_imputaciones','fiabilidad','formativos','cfa','vif_compuestos','spearman_compuestos','por_casuistica']
                    elif method=='04e_omega_h':
                        keys=['n','omega_h','omega_general_score','apto_gate','interpretacion','estado_calculo','pct_general','pct_especificos','supuestos']
                    elif method=='04g_unifactorial':
                        keys=['n','apto_gate','delta_aic','delta_bic','modelo_efectivo','preferido_aic','preferido_bic','modelo_unifactorial','modelo_3_factores']
                    else:keys=list(data)
                    source=p.relative_to(ROOT).as_posix()
                    bundle[method]={'estado':original['estado'],'motivo':original.get('motivo',''),'avisos':original.get('avisos',[]),'datos':{k:data[k] for k in keys if k in data},'source':source}
                    output['sources'][source]=digest
                output['diagnostics']['/'.join([unit,sample,family])]=bundle
    def clean(x):
        import math
        if isinstance(x,float) and not math.isfinite(x):return None
        if isinstance(x,dict):return {k:clean(v) for k,v in x.items()}
        if isinstance(x,list):return [clean(v) for v in x]
        return x
    (SITE/'data/measurement.js').write_text('window.ATLAS_MEASUREMENT='+json.dumps(clean(output),ensure_ascii=False,separators=(',',':'),allow_nan=False)+';',encoding='utf-8')
    print('Verified measurement sources:',len(output['sources']))

if __name__=='__main__':main()
