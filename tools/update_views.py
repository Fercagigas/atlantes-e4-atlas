"""Prepare the definitive UI, leaving the published app intact until promotion."""
from pathlib import Path
import re

site = Path(__file__).resolve().parents[1]
src = (site/'assets/app.js').read_text(encoding='utf-8')
replacements = (site/'tools/definitive_views.js').read_text(encoding='utf-8')
for part in replacements.split('// replace:')[1:]:
    name, code = part.split('\n', 1)
    code = code.split('// append:')[0].strip()
    src, count = re.subn(r'^(?:async )?function '+re.escape(name)+r'\(.*$', lambda _: code,
                         src, count=1, flags=re.M)
    assert count == 1, name
helpers = replacements.split('// append:helpers\n')[1]
src = src.replace('// Original artifacts are loaded only when requested.', helpers+'\n// Original artifacts are loaded only when requested.')
src = re.sub(r'^const REGION_TEXT=.*\n', '', src, flags=re.M)
src = re.sub(r'^const SIMNAMES=.*\n', '', src, flags=re.M)
src = src.replace("Q.indirect_to_total_ratio='Cociente indirecto / total';", "Q.indirect_to_total_ratio='Cociente indirecto / total';")
src = src.replace("bootstrap_2026101301:'Bootstrap · semilla 2026101301',bootstrap_2026101302:'Bootstrap · semilla 2026101302',", "bootstrap_seed1:'Bootstrap · corriente 1',bootstrap_seed2:'Bootstrap · corriente 2',MI_seed43:'MI · semilla raíz 43',")
src = src.replace('C7–C8','C7–C9')
src = src.replace('C1 es la especificación primaria retrospectiva.', 'C1 es la especificación primaria retrospectiva.')
src = src.replace('Los diagnósticos históricos no garantizan equivalencia de escala.', 'Los diagnósticos no garantizan equivalencia de escala.')
src = src.replace("'Hipótesis archivadas','Conserva la lectura original. Los veredictos históricos y el conteo de métodos no sustituyen la revisión R2 por estimando.'", "'Hipótesis y estimandos','Reúne los resultados por hipótesis. El conteo de métodos relacionados no equivale a replicaciones independientes.'")
src = src.replace('La revisión actual no convierte métodos relacionados en votos independientes ni valida automáticamente todas las conclusiones históricas.', 'Métodos relacionados no aportan votos independientes; cada procedimiento conserva sus propios supuestos y límites.')
src = src.replace('La receta R2 identifica sus grados de libertad.', 'Cada receta identifica sus grados de libertad.')
src = src.replace('la receta R2 identifica sus grados de libertad.', 'cada receta identifica sus grados de libertad.')
src = src.replace('El mínimo para el SEM histórico', 'El mínimo para el SEM')
start = src.index("+panel('Procedencia y vigencia'")
end = src.index("+panel('Preguntas que conviene", start)
src = src[:start]+"+panel('Procedencia y vigencia',`<p>Todos los resultados proceden de la ejecución <strong>${esc(D.meta.run_id)}</strong>, con nueve unidades, ambas muestras y las ocho casuísticas activas. C6 sigue retirada. C1 es primaria retrospectiva; C2–C5 y C7–C9 son familias exploratorias.</p><p>La nueva C9 invierte el orden serial de C7. Las rutas directas se conservan. Compartir ecuación final o ajuste no permite elegir una secuencia causal.</p><p>Las sensibilidades abarcan semillas bootstrap, número y semilla de imputaciones, casos completos, desplazamientos delta, muestra e influencia de países. La simulación tiene su propio diseño para C1; no valida automáticamente todas las casuísticas.</p>` )"+src[end:]
# Descriptions retain methodological limitations, without referring to retired results.
src = src.replace('En el legado, el bootstrap de primera imputación', 'El bootstrap de primera imputación')
src = src.replace('El alias histórico requiere cautela:', 'Este alias requiere cautela:')
src = src.replace('El legado sobre promedios de imputaciones', 'El modelo sobre promedios de imputaciones')
src = src.replace('la receta archivada', 'la receta documentada')
src = src.replace('El catálogo conserva el estado original; disponibilidad no implica validación inferencial actual.', 'El catálogo conserva estados y motivos; disponibilidad no implica validación inferencial.')
src = src.replace("C8:'C8',GAC:", "C8:'C8',C9:'C9',GAC:")
src = src.replace("ok:'OK archivado',no_aplicable:'No aplicable',documento:", "ok:'OK',no_aplicable:'No aplicable',no_convergio:'No convergió',documento:")
src = src.replace('los nombres y veredictos históricos permanecen sin reescritura.', 'los estados de cada cálculo se muestran junto a sus motivos.')
src = src.replace("source('simulation_metrics.csv · campaña R2')", "source('Simulaciones de la colección definitiva')")
# Both simulation designs remain distinct, with separate denominators.
src = src.replace("${panel('Interpretar la evaluación',", "${panel('Evaluación conjunta de intervalos',`<div class=\"controls\">${select('simspec','Cantidad conjunta',Object.fromEntries(unique(D.tables.joint_metrics.map(r=>r.quantity)).map(q=>[q,q])))}</div><div id=\"joint-simulation-chart\" class=\"chart tall\"></div><p class=\"metric-note\">Siete escenarios × 400 repeticiones. Intervalos percentil, BCa y Rubin según la cantidad. La tabla conserva cobertura sobre todos los intentos y condicionada a intervalos válidos.</p><div id=\"joint-simulation-table\"></div>`)}${panel('Interpretar la evaluación',")
src = src.replace("function mountSimulation(){const rs=", "function mountSimulation(){mountJointSimulation();const rs=")
joint = """
function mountJointSimulation(){const all=D.tables.joint_metrics;if(!all.some(r=>r.quantity===state.simspec))state.simspec='total_indirect';const sel=document.querySelector('[data-state=\"simspec\"]');if(sel)sel.value=state.simspec;const rs=all.filter(r=>r.quantity===state.simspec);chart('joint-simulation-chart',unique(rs.map(r=>r.method)).map(m=>{const a=rs.filter(r=>r.method===m);return {type:'scatter',mode:'markers',name:m,x:a.map(r=>r.coverage_conditional_value),y:a.map(r=>r.cell),customdata:a.map(r=>[r.attempts,r.valid_intervals,r.coverage_all_attempts_value]),hovertemplate:'%{y}<br>Cobertura condicionada: %{x:.3f}<br>Intentos: %{customdata[0]} · válidos: %{customdata[1]}<br>Cobertura sobre intentos: %{customdata[2]:.3f}<extra>%{fullData.name}</extra>',marker:{size:9}}}),{margin:{l:140,r:20,t:15,b:65},xaxis:{title:'Cobertura condicionada a intervalos válidos',range:[0,1.02]},yaxis:{autorange:'reversed'},shapes:[{type:'line',yref:'paper',y0:0,y1:1,x0:.95,x1:.95,line:{color:'#bc4b3c',dash:'dash'}}]});table('joint-simulation-table',rs,{columns:['cell','quantity','method','truth','attempts','valid_intervals','coverage_conditional_value','coverage_conditional_mcse','coverage_all_attempts_value','interval_failure_value','bias','rmse']})}
"""
src = src.replace('// Original artifacts are loaded only when requested.', joint+'\n// Original artifacts are loaded only when requested.')
(site/'assets/app.definitive.js').write_text(src, encoding='utf-8')
print('Prepared assets/app.definitive.js')
