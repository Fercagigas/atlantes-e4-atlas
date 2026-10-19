"""Build a portable, offline research atlas from archived study outputs.

No model is fitted. Original bytes are preserved in gzip payloads or assets.
Run from any directory: python GithubPages/tools/build_data.py
"""
from pathlib import Path
import ast, base64, collections, csv, gzip, hashlib, io, json, math, re, shutil, sys, tarfile
from datetime import datetime, timezone

SITE = Path(__file__).resolve().parents[1]
ROOT = SITE.parent
UNITS = {'mundo':'Mundo','asia_pacifico':'Asia-Pacífico (curada)', 'asia_pacifico_i8global':'Asia-Pacífico · I8 global','AFR':'África','AMR':'Américas','EMR':'Mediterráneo Oriental','EUR':'Europa','SEAR':'Asia Sudoriental','WPR':'Pacífico Occidental'}
def clean(v):
    if isinstance(v,float) and not math.isfinite(v): return None
    if isinstance(v,dict): return {k:clean(x) for k,x in v.items()}
    if isinstance(v,list): return [clean(x) for x in v]
    return v
def dumps(v): return json.dumps(clean(v),ensure_ascii=False,separators=(',',':'),allow_nan=False)
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def rows(p):
    out=[]
    for row in csv.DictReader(p.open(encoding='utf-8-sig',newline='')):
        for k,v in row.items():
            if v=='': row[k]=None
            elif v and re.fullmatch(r'[-+]?\d+(\.\d*)?([eE][-+]?\d+)?',v): row[k]=float(v) if '.' in v or 'e' in v.lower() else int(v)
        out.append(row)
    return out
def group(name):
    n=name.split('_')[0]
    if name.startswith('simulacion') or name.startswith('celda'): return 'Simulación'
    if n in ['00','01','02']: return 'Datos y descriptivos'
    if n in ['03','04','04a','04b','04c','04d','04e','04f','04g','05','06','07']: return 'Medición'
    if n in ['08a','08b','08c','08d','08e','08f','09','10a','10b','10c','11a','11b']: return 'Modelos estructurales'
    if n in ['12a','19a','19b','19c','19d','21']: return 'Mediación y moderación'
    if n in ['18a','18b','18c','18d','22','22b','22c','23','25']: return 'Robustez y sensibilidad'
    if n.startswith('24') or n in ['13b','28','28b','28c','33']: return 'Comparación regional'
    if n.startswith('26') or n=='27': return 'Síntesis y trazabilidad'
    if n.startswith('28v') or n in ['30','31','31b','41']: return 'Figuras y mapas'
    if n.startswith('40') or n=='34': return 'Contexto y validación externa'
    return 'Análisis complementarios'

if __name__ == '__main__':
    from build_definitive import main
    main()
