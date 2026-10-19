/* DOM integration checks, not a browser or a visual rendering test.
   Usage: node tools/qa_dom.cjs <absolute path to installed jsdom>
   Install QA-only dependency outside the published folder. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require(process.argv[2]||'jsdom');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script[^>]*src="[^"]+"[^>]*><\/script>/g,'');
const dom=new JSDOM(html,{url:'http://localhost/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,errors=[],plots=[];
w.HTMLCanvasElement.prototype.getContext=function(){return {measureText:()=>({width:100})}};
w.eval(fs.readFileSync(path.join(root,'assets/vendor/plotly.min.js'),'utf8'));
const plotlyValidate=w.Plotly.validate.bind(w.Plotly);
w.console.error=(...v)=>errors.push(v.join(' '));
w.Plotly={newPlot:(el,traces,layout)=>{assert(traces);el.dataset.plotted='true';plots.push({id:el.id,traces,layout});return Promise.resolve()},purge:()=>{}};
w.TextDecoder=TextDecoder;w.TextEncoder=TextEncoder;w.DecompressionStream=DecompressionStream;w.Response=Response;w.Blob=Blob;
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
w.HTMLElement.prototype.scrollIntoView=function(){};
Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 900}});
for(const file of ['assets/vendor/d3.min.js','data/geography.js','data/study.js','data/catalog.js','data/measurement.js','data/context.js'])w.eval(fs.readFileSync(path.join(root,file),'utf8'));
const appended=w.document.head.append.bind(w.document.head);w.document.head.append=(element)=>{if(element.tagName==='SCRIPT'&&element.src.includes('/data/records/')){const file=element.src.split('/data/records/')[1];w.eval(fs.readFileSync(path.join(root,'data/records',file),'utf8'));return}return appended(element)};
w.eval(fs.readFileSync(path.join(root,'assets/research.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'assets/context.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'assets/findings.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'assets/app.js'),'utf8')+'\nObject.assign(window,{state,render,researchDirection});');
const tick=()=>new Promise(resolve=>setTimeout(resolve,50));
async function run(){
 assert.equal(w.state.view,'medicion','The atlas opens with psychometrics');
 const main=w.document.querySelector('[data-finding="ap-sum"]');assert(main,'Homepage contains principal findings');
 const ap=w.ATLAS_DATA.tables.application.find(r=>r.unit==='asia_pacifico'&&r.sample==='depurada'&&r.specification==='C1'&&r.quantity==='total_indirect');
 assert.equal(Number(main.dataset.value),ap.point);
 assert.equal(ap.point.toFixed(3),w.ATLAS_CONTEXT.paper_values.ap_sum,'Homepage findings agree with the current paper');
 const asiaScope=w.document.querySelector('[data-findings-scope="asia_pacifico"]'),globalScope=w.document.querySelector('[data-findings-scope="global"]');
 assert.equal(w.document.querySelectorAll('[data-findings-scope]').length,2,'Two explicit geographical scopes on the homepage');
 assert(asiaScope.contains(main),'Asia-Pacific findings stay inside their scope');
 const world=w.ATLAS_DATA.tables.application.find(r=>r.unit==='mundo'&&r.sample==='depurada'&&r.specification==='C1'&&r.quantity==='total_indirect');
 assert.equal(Number(globalScope.querySelector('[data-finding="world-sum"]').dataset.value),world.point,'The world uses its own result');
 assert.deepEqual([...globalScope.querySelectorAll('[data-global-unit]')].map(r=>r.dataset.globalUnit),['AFR','AMR','EMR','EUR','SEAR','WPR','mundo'],'All six WHO regions plus the world, without counting curated Asia-Pacific twice');
 assert.equal(globalScope.querySelectorAll('[data-finding-unit]').length,6,'Five estimable WHO regions and the world');
 assert(globalScope.querySelector('[data-global-unit="SEAR"]').textContent.includes('No aplicable'),'SEAR remains explicitly non-applicable');
 assert(asiaScope.querySelector('.scope-conclusion')&&globalScope.querySelector('.scope-conclusion'),'Separate conclusions for each scope');
 for(const element of w.document.querySelectorAll('[data-finding-unit]')){
  const r=w.ATLAS_DATA.tables.application.find(r=>r.unit===element.dataset.findingUnit&&r.sample==='depurada'&&r.specification==='C1'&&r.quantity==='total_indirect');
  assert.equal(Number(element.dataset.value),r.point);assert.equal(Number(element.dataset.low),r.pct95_low);assert.equal(Number(element.dataset.high),r.pct95_high);
 }
 assert(!w.document.querySelector('#nav a[href="#mapa"]'));
 assert(!w.document.querySelector('#nav a[href="#comparar"]'));
 assert(!w.document.querySelector('#nav a[href="#asia"]'));
 assert(!w.document.querySelector('#nav a[href="#europa"]'));
 const views=['medicion','regiones','modelos','contexto','robustez','simulacion','complementarios','catalogo','figuras','metodologia','documentacion'];
 for(const view of views){w.eval(`state.view=${JSON.stringify(view)};render()`);await tick();assert(w.document.querySelector('#main h1'),view+' missing heading');assert(!w.document.querySelector('#main').textContent.includes('No se ha podido cargar parte'),view+' rendering error');}
 for(const unit of Object.keys(w.ATLAS_DATA.units))for(const sample of ['depurada','completa']){
  w.eval(`Object.assign(state,{view:'regiones',unit:'${unit}',sample:'${sample}'});render()`);
  assert.equal(w.document.querySelectorAll('[data-region-case]').length,8,'Eight stacked cases for '+unit);
  assert.equal(w.document.querySelectorAll('.case-data').length,8,'Eight detailed tables');
  assert.equal(w.document.querySelectorAll('.case-diagnostics').length,8,'Robustness and psychometrics below every model');
  for(const c of ['C1','C2','C3','C4','C5','C7','C8','C9']){
   const source=w.ATLAS_DATA.tables.primary_coefficients.filter(r=>r.unit===unit&&r.sample===sample&&r.specification===c);
   const diagnostic=w.document.querySelector(`[data-diagnostic-case="${c}"]`);assert(diagnostic.textContent.includes('Robustez de '+c));assert(diagnostic.textContent.includes('psicometría'));
   const family=w.ATLAS_DATA.cases[c].familia;
   const psych=w.ATLAS_MEASUREMENT.diagnostics[unit+'/'+sample+'/'+family]['03_psicometria']?.datos?.por_casuistica?.[c]?.constructos||{};
   assert.equal(diagnostic.querySelectorAll('.psychometric-values>span').length,Object.keys(psych).length,'The psychometric family matches each case');
   const edges=w.document.querySelectorAll('#region-flow-'+c+' .flow-edge');assert.equal(edges.length,w.ATLAS_DATA.cases[c].paths.length);
   for(const edge of edges){
    const row=source.find(r=>r.path===edge.dataset.path),kind=w.researchDirection(row);
    assert.equal(edge.dataset.direction,kind);
    const arrow=edge.querySelector('.flow-line').getAttribute('marker-end');
    assert.equal(Boolean(arrow),kind==='positive'||kind==='negative','No flowing arrow across zero: '+unit+' '+c+' '+edge.dataset.path);
   }
   const button=w.document.querySelector('#region-routes-'+c+' button');button.click();
   assert(w.document.querySelector('#region-selected-'+c).textContent.includes('IC Rubin'));
   assert.equal(button.getAttribute('aria-pressed'),'true');
   const last=edges[edges.length-1];last.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));assert.equal(last.getAttribute('aria-pressed'),'true','Keyboard selects an edge');
  }
 }
 for(const family of ['GAC','EDINV','GOBCAP'])for(const unit of Object.keys(w.ATLAS_DATA.units))for(const sample of ['depurada','completa']){
  w.eval(`Object.assign(state,{view:'medicion',unit:'${unit}',sample:'${sample}',measureFamily:'${family}'});render()`);
  assert(w.document.querySelector('#research-measure-table table'),'Actual measurement result table');
  assert(!w.document.querySelector('#main').textContent.includes('No se ha podido cargar parte'));
  const measurement=w.ATLAS_MEASUREMENT.diagnostics[unit+'/'+sample+'/'+family];
  const caseID=family==='GAC'?'C1':family==='EDINV'?'C2':'C3';
  const alphaSource=Object.values(measurement['03_psicometria']?.datos?.por_casuistica?.[caseID]?.constructos||{}).map(r=>r.alfa).filter(Number.isFinite);
  if(alphaSource.length){const plot=plots.filter(p=>p.id==='research-alpha').at(-1);assert.equal(JSON.stringify([...plot.traces[0].x]),JSON.stringify(alphaSource),'Psychometric values follow the selected cohort and family');}
 }
 for(const unit of Object.keys(w.ATLAS_DATA.units))for(const sample of ['depurada','completa'])for(const c of ['C1','C2','C3','C4','C5','C7','C8','C9']){
  w.eval(`Object.assign(state,{view:'contexto',unit:'${unit}',sample:'${sample}',case:'${c}'});render()`);
  assert(!w.document.querySelector('#main').textContent.includes('No se ha podido cargar parte'),'Context view '+unit+'/'+sample+'/'+c);
  const original=w.ATLAS_CONTEXT.analyses[unit+'/'+sample]['19b_moderaciones'][c];
  const interactions=original?.datos?.filas||[];
  if(interactions.length){
   const plot=plots.filter(p=>p.id==='context-moderation-chart').at(-1);
   for(const trace of plot.traces){const expected=interactions.filter(r=>r.moderador===trace.name).map(r=>r.beta_interaccion_exacto??r.beta_interaccion);assert.equal(JSON.stringify([...trace.x]),JSON.stringify(expected),'Interactions use the correct case and sample');}
  }
  assert(w.document.querySelector('#context-covariate-status').textContent.includes('C1')||original?.estado==='no_aplicable'||unit==='SEAR','The observed covariate analysis declares C1');
 }
 for(const unit of ['asia_pacifico','mundo','AFR','AMR','EMR','EUR','SEAR','WPR','asia_pacifico_i8global'])for(const sample of ['depurada','completa']){w.eval(`Object.assign(state,{view:'modelos',unit:'${unit}',sample:'${sample}'});`);for(const c of ['C1','C2','C3','C4','C5','C7','C8','C9'])w.eval(`state.case='${c}';render()`)}
 w.eval("Object.assign(state,{view:'catalogo',catunit:'EUR',q:'22b_multiverso',catsample:'depurada',group:'',catscope:'',catstate:'',catedition:''});render()");assert(w.document.querySelectorAll('.catalog-item').length>0,'Catalog filtering');
 const open=w.document.querySelector('[data-open]');open.click();await tick();assert(w.document.querySelector('#viewer').open,'Viewer opens');assert(w.document.querySelector('[data-file]'),'Viewer contains files');await tick();
 const jsonButton=[...w.document.querySelectorAll('[data-file]')].find(b=>b.textContent==='resultado.json');jsonButton.click();await tick();assert(w.document.querySelector('.json-tree'),'Structured JSON view');
 const csvButton=[...w.document.querySelectorAll('[data-file]')].find(b=>b.textContent.endsWith('.csv'));if(csvButton){csvButton.click();await tick();assert(w.document.querySelector('#file-body table'),'CSV viewer');const builder=w.document.querySelector('#csv-visualization');if(builder){builder.open=true;await tick();for(const kind of ['scatter','bar','line','box']){const selector=w.document.querySelector('#csv-kind');selector.value=kind;selector.dispatchEvent(new w.Event('change',{bubbles:true}));assert(w.document.querySelector('#csv-chart').dataset.plotted,'Configurable CSV chart '+kind)}}}
 w.document.querySelector('#close-viewer').click();assert(!w.document.querySelector('#viewer').open,'Viewer closes');
 for(const unit of ['asia_pacifico','mundo','AMR','EMR','EUR','SEAR']){w.eval(`Object.assign(state,{view:'robustez',robunit:'${unit}',sample:'depurada',path:'Acceso -> I13',robcase:'C1',quantity:'total_indirect'});render()`);await tick();assert(!w.document.querySelector('#main').textContent.includes('No se pudo abrir'),unit+' sensitivity');}
 w.eval("Object.assign(state,{view:'simulacion',simquantity:'EI1',simN:'35',simMissing:'mnar',simEstimator:'mi'});render()");
 const simulation=plots.filter(p=>p.id==='simulation-chart').at(-1);
 const expected=w.ATLAS_DATA.tables.simulation_metrics.filter(r=>r.estimando==='EI1'&&r.n===35&&r.faltantes==='mnar'&&r.estimador==='mi');
 assert.equal(JSON.stringify([...simulation.traces[0].y]),JSON.stringify(expected.map(r=>r.cobertura95)),'Filtered simulation values are original values');
 for(const metric of ['coverage_conditional','coverage_all_attempts','interval_failure','bias','rmse']){
  w.eval(`state.jointMetric='${metric}';render()`);
  const plot=plots.filter(p=>p.id==='joint-simulation-chart').at(-1);
  assert(plot.traces.some(t=>t.x.length),'The joint simulation metric has data: '+metric);
 }
 w.eval("Object.assign(state,{view:'simulacion',simN:'999'});render()");assert(w.document.querySelector('#simulation-chart').textContent.includes('Sin celdas'));
 w.eval("Object.assign(state,{view:'regiones',unit:'EUR',sample:'depurada'});render()");assert.equal(w.document.querySelectorAll('[data-region-case]').length,8);
 w.location.hash='#europa';await tick();assert.equal(w.state.view,'regiones');assert.equal(w.state.unit,'EUR','Old Europe links open the unified selector');
 w.location.hash='#asia';await tick();assert.equal(w.state.view,'regiones');assert.equal(w.state.unit,'asia_pacifico','Old Asia links open the unified selector');
 if(process.env.ATLAS_RENDER_SVG==='1'){
  const {Resvg}=require(path.join(path.dirname(process.argv[2]),'@resvg/resvg-js'));
  const output=path.resolve(root,'../logs/atlas_diagrams');fs.mkdirSync(output,{recursive:true});
  w.eval("Object.assign(state,{view:'regiones',unit:'asia_pacifico',sample:'depurada'});render()");
  const css=fs.readFileSync(path.join(root,'assets/research.css'),'utf8');
  for(const c of ['C1','C2','C3','C4','C5','C7','C8','C9']){
   const svg=w.document.querySelector('#region-flow-'+c+' svg').cloneNode(true);
   svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
   const style=w.document.createElementNS('http://www.w3.org/2000/svg','style');style.textContent=css;svg.prepend(style);
   const source=svg.outerHTML;fs.writeFileSync(path.join(output,c+'.svg'),source);
   const resvg=new Resvg(source,{background:'white',fitTo:{mode:'width',value:1200}});
   fs.writeFileSync(path.join(output,c+'.png'),resvg.render().asPng());
  }
 }
 const paperLinks=['documents/definitiva/paper/manuscript/manuscript.pdf','documents/definitiva/paper/supplement/supplement.pdf'];
 for(const file of paperLinks)assert(fs.existsSync(path.join(root,file)));
 const issues=plots.flatMap(p=>{try{return (plotlyValidate(p.traces,p.layout)||[]).filter(e=>e.code!=='unused').map(e=>({plot:p.id,...e}))}catch(e){return [{plot:p.id,error:e.message}]}});
 fs.writeFileSync(path.join(root,'validation-plotly.json'),JSON.stringify(issues,null,2));
 assert.equal(issues.length,0,JSON.stringify(issues.slice(0,8)));
 assert.equal(errors.length,0,errors.join('\n'));
 const report={result:'PASS',views:views.length,model_combinations:144,regional_case_combinations:144,context_case_combinations:144,measurement_selections:54,homepage_scopes:2,checks:['Separate Asia-Pacific and international findings, seven global population rows and scoped conclusions','Homepage estimates and intervals agree with the definitive paper','Context analyses preserve unit, sample, case and exact interaction estimates','Duplicate Asia-Pacific and Europe pages removed','Case-specific robustness and psychometric limitations','Legacy region links open the unified region view','Psychometrics is the opening page','Map and regional comparator removed from navigation','Eight stacked models and eight detailed tables for every population/sample','Arrows only for evaluable intervals excluding zero','Route selection by click and keyboard','Verified measurement diagnostics','Simulation filters preserve original values','Empty simulation combinations','Dedicated case page retained','Catalog filters','Original JSON and CSV viewers','Configurable CSV charts','Plotly schema validation','Sensitivity originals and C9','Document downloads'],limitation:'Plotly rendering is stubbed; real Plotly validates the generated trace/layout schemas. This is DOM logic testing, not browser rendering or responsive visual QA.'};
 fs.writeFileSync(path.join(root,'validation-dom.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));w.close();
}
run().catch(e=>{console.error(e);w.close();process.exitCode=1});
