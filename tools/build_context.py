"""Package existing contextual analyses without estimating additional models."""
from pathlib import Path
import hashlib
import json
import math

ROOT=Path(__file__).resolve().parents[2]
SITE=ROOT/'GithubPages'

def clean(value):
    if isinstance(value,float) and not math.isfinite(value):return None
    if isinstance(value,dict):return {k:clean(v) for k,v in value.items()}
    if isinstance(value,list):return [clean(v) for v in value]
    return value

def main():
    manifest=json.loads((ROOT/'resultados/_procedencia/manifiesto.json').read_text(encoding='utf-8'))
    assert manifest['run_id']=='20261018_definitiva' and manifest['finalized']
    output={'run_id':manifest['run_id'],'analyses':{},'sources':{}}
    for unit in manifest['parametros']['unidades']:
        for sample in ['depurada','completa']:
            bundle={}
            for method in ['21_indicador1','40a_covariables_sociologicas','18d_cinelli_hazlett','19b_moderaciones']:
                results={}
                for p in sorted((ROOT/'resultados'/unit/sample/method).glob('*/resultado.json')):
                    raw=p.read_bytes();digest=hashlib.sha256(raw).hexdigest()
                    marker=json.loads((p.parent/'_tarea.json').read_text(encoding='utf-8'))
                    assert marker['salidas']['resultado.json']==digest,p
                    original=json.loads(raw);source=p.relative_to(ROOT).as_posix()
                    results[p.parent.name]={**original,'source':source}
                    output['sources'][source]=digest
                bundle[method]=results
            output['analyses'][unit+'/'+sample]=bundle
    paper=ROOT/'publicacion/definitiva/paper/reproducibility/claims.json'
    claims=json.loads(paper.read_text(encoding='utf-8'));assert claims['run_id']==manifest['run_id']
    output['paper_values']={k:v for k,v in claims['values'].items() if not isinstance(v,(list,dict)) and len(str(v))<150}
    output['sources'][paper.relative_to(ROOT).as_posix()]=hashlib.sha256(paper.read_bytes()).hexdigest()
    manuscript=ROOT/'publicacion/definitiva/paper/manuscript/manuscript.md'
    output['sources'][manuscript.relative_to(ROOT).as_posix()]=hashlib.sha256(manuscript.read_bytes()).hexdigest()
    (SITE/'data/context.js').write_text('window.ATLAS_CONTEXT='+json.dumps(clean(output),ensure_ascii=False,separators=(',',':'),allow_nan=False)+';',encoding='utf-8')
    print('Verified context and paper sources:',len(output['sources']))

if __name__=='__main__':main()
