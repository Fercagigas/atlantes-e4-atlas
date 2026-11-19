'use strict';

// The reader works with the same results and selections as the detailed panels.
const studyBlocks = {G:'Gobernanza', A:'Acceso', C:'Capacidad', I13:'Servicios'};
const unitLabels = {mundo:'Mundo', AFR:'África', AMR:'Américas', EMR:'Mediterráneo Oriental', EUR:'Europa', SEAR:'Asia Sudoriental', WPR:'Pacífico Occidental'};
const blockCode = {Gobernanza:'G', Acceso:'A', Capacidad_Operativa:'C', I13:'I13'};
const readerColors = {G:'#495e9b', A:'#ab513a', C:'#087d76', I13:'#193d52'};
const countText = value => Number(value).toLocaleString('es-ES');
const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
let disposeReader = () => {};
let selectedQcaRule;
document.addEventListener('atlas-qca-rule', event => {
  selectedQcaRule = event.detail;
});

function diagramRow(labels, active, directed = true) {
  return '<div class="sequence">' + labels.map((text, i) =>
    (i ? '<span class="direction" aria-hidden="true">'+(directed?'→':'·')+'</span>' : '') +
    '<span class="sequence-item '+(i===active?'is-current':'')+'">'+esc(text)+'</span>'
  ).join('') + '</div>';
}

function bars(items, max) {
  return '<div class="reader-bars">'+items.map(([label,value,display]) =>
    '<div><span>'+esc(label)+'</span><i><b style="width:'+Math.min(100,100*value/max)+'%"></b></i><strong>'+esc(display??countText(value))+'</strong></div>'
  ).join('')+'</div>';
}

function dotBoard(num, denominator) {
  return '<div class="country-dots" role="img" aria-label="'+num+' de '+denominator+' países">'+
    Array.from({length:denominator},(_,i)=>'<i class="'+(i<num?'included':'')+'"></i>').join('')+'</div>';
}

function treeFigure(level) {
  const rows=window.TUTOR_TREE.filter(r=>+r.nivel<=level);
  const point = id => {
    const depth=Math.floor(Math.log2(id));
    return [(id-2**depth+.5)*760/(2**depth),32+depth*67];
  };
  const lines=rows.filter(r=>+r.nodo>1).map(r=>{
    const [x,y]=point(+r.nodo),[px,py]=point(Math.floor(+r.nodo/2));
    return '<path class="tree-edge" d="M'+px+' '+(py+15)+' L'+x+' '+(y-15)+'"/>';
  });
  const nodes=rows.map(r=>{
    const [x,y]=point(+r.nodo), leaf=!r.indicador;
    const label=leaf?fmt(+r.prediccion,2):r.indicador+' ≤ '+fmt(+r.umbral,2)+'?';
    return '<g transform="translate('+x+' '+y+')" class="'+(+r.nivel===level?'node-enter':'')+'"><title>'+esc(label)+' · '+r.n_train_distintos+' países de entrenamiento</title><rect x="-43" y="-16" width="86" height="32" rx="12" fill="'+readerColors[r.constructo||'I13']+'"/><text text-anchor="middle" y="5" fill="white">'+esc(label)+'</text></g>';
  });
  return '<svg class="tree-lesson" viewBox="0 0 760 '+(65+level*67)+'" role="img" aria-label="Árbol ordenado hasta el nivel '+(level+1)+'">'+lines.join('')+nodes.join('')+'</svg>';
}

function networkGraphic(edges, directional=false, highlight=-1) {
  const pos={G:[75,95],A:[315,25],C:[315,165],I13:[552,95]};
  const lines=edges.map(([a,b,v],i)=>{
    const [x,y]=pos[a],[xx,yy]=pos[b];
    const part=(t)=>[x+(xx-x)*t,y+(yy-y)*t].join(' ');
    const emph=highlight===-1||highlight===i;
    // Trim the segment to the rectangular nodes so each arrowhead stays visible.
    const endGap=Math.min(56/(Math.abs(xx-x)||1),19/(Math.abs(yy-y)||1));
    const line='<path d="M'+part(endGap)+' L'+part(1-endGap)+'" class="network-line '+(emph?'lit':'')+'" '+(directional?'marker-end="url(#net-tip)"':'')+'/>';
    const labelPos=(a==='G'&&b==='I13')?.36:.5;
    return line+(emph?'<path d="M'+part(.15)+' L'+part(.85)+'" class="network-pulse '+(directional?'forward':'both')+'"/>':'')+(v==null?'':'<text x="'+(x+(xx-x)*labelPos)+'" y="'+(y+(yy-y)*labelPos-6)+'" class="edge-number">'+fmt(v,2)+'</text>');
  });
  const nodes=Object.entries(pos).map(([key,[x,y]])=>'<g transform="translate('+x+' '+y+')"><rect x="-51" y="-15" width="102" height="30" rx="12" fill="'+readerColors[key]+'"/><text y="5" text-anchor="middle" fill="white">'+studyBlocks[key]+'</text></g>');
  return '<svg viewBox="0 0 625 192" class="network-canvas" role="img" aria-label="'+(directional?'Rutas del modelo':'Red de asociaciones parciales')+'"><defs><marker id="net-tip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#187b76"/></marker></defs>'+lines.join('')+nodes.join('')+'</svg>';
}

function regionalNetworkPanel() {
  return panel('¿Qué conexiones aparecen en cada región?',
    '<div class="network-regions" role="group" aria-label="Región de la red">'+Object.entries(unitLabels).map(([id,name])=>'<button type="button" data-network-region="'+id+'">'+name+'</button>').join('')+'</div><div id="regional-network-result" aria-live="polite"></div>');
}

function drawRegion(unit) {
  const record=window.REGIONAL_NETWORKS[unit];
  const edges=record.edges.map(([a,b,v])=>[blockCode[a],blockCode[b],v]);
  document.querySelectorAll('[data-network-region]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.networkRegion===unit)));
  const note=record.state!=='ok'?'La muestra quedó por debajo del mínimo de países para estimar la red.':edges.length?'Selecciona una región para comparar sus conexiones. Cada cifra resume la asociación entre dos funciones teniendo en cuenta las demás.':'La estimación regional quedó sin conexiones por encima del corte.';
  document.querySelector('#regional-network-result').innerHTML='<h3>'+unitLabels[unit]+' · '+record.n+' países</h3>'+(record.state==='ok'?networkGraphic(edges):'')+'<p>'+note+'</p><small>Muestra depurada · campaña del 4 de noviembre · mediana de cinco imputaciones · |parcial| &gt; 0,01.</small>';
}

function qcaLesson() {
  const r=selectedQcaRule;
  if(!r) return [];
  const hit=+r.n_interseccion,outcome=+r.n_I13,condition=+r.n_configuracion;
  const percent=(x)=>x?fmt(100*hit/x,1)+' %':'Sin denominador';
  const verdict=(d)=>d?(hit/d>=.9?'alcanza':'queda por debajo de')+' el 90 %':'sin estimación';
  return [
    ['Elige a quién contar',r.configuracion.replace('Capacidad_Operativa','Capacidad')+' · servicios '+r.nivel_I13+'. Cada punto de las siguientes escenas representa un país del grupo elegido.',diagramRow(['Condición','Países que cumplen ambas','Nivel de servicios'],1,false)],
    ['¿Es necesaria?', 'Entre los '+outcome+' países de este nivel de servicios, '+hit+' cumplen la condición. '+hit+' ÷ '+outcome+' = '+percent(outcome)+'.',dotBoard(hit,outcome)],
    ['¿Es suficiente?', 'Ahora partimos de los '+condition+' países con la condición. '+hit+' tienen ese nivel de servicios. '+hit+' ÷ '+condition+' = '+percent(condition)+'.',dotBoard(hit,condition)],
    ['Compara con el umbral', 'La necesidad '+verdict(outcome)+'. La suficiencia '+verdict(condition)+'. El criterio se aplica a esta muestra.',bars([['Necesidad',outcome?100*hit/outcome:0,percent(outcome)],['Suficiencia',condition?100*hit/condition:0,percent(condition)]],100)]
  ];
}

function treeLesson(){
  const labels=['Gobernanza','Acceso','Capacidad','Servicios'];
  return [
    ['Gobernanza abre el árbol','El modelo impone gobernanza → acceso → capacidad. Para la primera pregunta solo permite I3, I4 e I5. El árbol elige el plan nacional (I3) y pregunta si su puntuación es 3,5 o menor.'],
    ['Acceso divide cada grupo','En el segundo nivel solo compiten I8, I9 e I10. El árbol elige I9 en las dos ramas y aprende un umbral distinto en cada grupo.'],
    ['Capacidad completa las ramas','Ahora compiten I6, I7, I11 e I12. Una rama pregunta por congresos (I6) y las otras tres por publicaciones (I7).'],
    ['Ocho hojas predicen los servicios','Cada hoja muestra la media de I13 de sus países de entrenamiento. En cada pregunta, la respuesta «sí» lleva a la izquierda y «no» a la derecha. El bosque promedia muchos árboles.']
  ].map(([t,d],i)=>[t,d,diagramRow(labels,i)+treeFigure(i)]);
}

function lessonFor(view) {
  const scope=state.unit+'/'+state.sample;
  const cohort=D.countries[scope]||[];
  const scopeLabel=D.units[state.unit]+' · muestra '+state.sample;
  const sequence=(labels,notes,directed=true)=>notes.map(([title,body],i)=>[title,body,diagramRow(labels,i,directed)]);
  const archives=Object.entries(D.meta.states);
  switch(view){
    case 'qca':return qcaLesson();
    case 'bosques':return treeLesson();
    case 'dependencias':return [
      ['La red une funciones','Mundo · 201 países. Cinco conexiones superaron el filtro de estabilidad en 1.000 remuestras. Los vínculos de la red se leen en ambos sentidos.',networkGraphic([['G','C',.421],['C','A',.235],['G','I13',.279],['C','I13',.326],['A','I13',.433]])],
      ['El orden añade una hipótesis','Cuatro órdenes fueron compatibles con la red. Capacidad → Gobernanza → Acceso obtuvo los valores más bajos en los tres criterios al corte 2,50.',diagramRow(['Capacidad','Gobernanza','Acceso'],1)],
      ['C10-M pone esa idea a prueba','Capacidad se relaciona con gobernanza y con acceso. Las tres funciones se incluyen en la ecuación de servicios. Las flechas expresan la dirección propuesta en el modelo.',semSummaryDiagram('C10M',window.ATLAS_C10['mundo/C10M'].rows)]
    ];
    case 'medicion':return Object.entries({G:['I3','I4','I5'],C:['I6','I7','I11','I12'],A:['I8','I9','I10']}).map(([key,items])=>[studyBlocks[key],items.map(i=>IND[i]).join(' · ')+'. Estos indicadores forman la puntuación del bloque.',diagramRow(items.concat(studyBlocks[key]),items.length)]);
    case 'regiones':case 'metodologia':{
      const paths=D.tables.primary_coefficients.filter(r=>r.unit===state.unit&&r.sample===state.sample&&r.specification==='C1'&&r.path.endsWith(' -> I13'));
      if(!paths.length)return [['Muestra regional',scopeLabel+'. Consulta el motivo de aplicabilidad en los modelos.',diagramRow(['Países','Muestra','Estimación'],1)]];
      return paths.map(r=>[researchPath(r.path),scopeLabel+' · C1 · '+r.n+' países. El punto es el cambio estimado en servicios por unidad del predictor. El intervalo muestra su precisión.',intervalGraphic(r.b,r.ic_lo,r.ic_hi)]);
    }
    case 'modelos':return semModelLessons();
    case 'contexto':return contextLessons();
    case 'moderacion':return ['I1','I2'].map(m=>[m+' · '+IND[m],'Mundo · 201 países. Número de rutas cuya asociación varía con el indicador según el criterio exploratorio del informe (BH < 0,10).',bars(['C1','C7','C9','C10M'].map(c=>[c,L.moderation.filter(r=>r.unidad==='mundo'&&r.muestra==='completa'&&r.casuistica===c&&r.moderador===m&&r.significativo_fdr==='True').length]),4)]);
    case 'robustez':{
      const rows=D.tables.country_influence.filter(r=>r.unit===state.robunit&&r.sample===state.sample&&r.specification===state.robcase&&r.quantity===state.quantity&&Number.isFinite(r.change)).sort((a,b)=>Math.abs(b.change)-Math.abs(a.change));
      if(rows.length)return rows.slice(0,3).map(r=>['Al omitir '+r.iso3,D.units[r.unit]+' · '+state.sample+' · '+r.specification+' · '+(Q[r.quantity]||r.quantity)+'. Se compara la estimación en la muestra con la obtenida al retirar un país.',diagramRow(['Muestra: '+fmt(r.reference),'Sin '+r.iso3+': '+fmt(r.point),'Cambio: '+fmt(r.change)],2)]);
      return [['Sensibilidad por país','No hay estimaciones de omisión para la selección actual.',diagramRow(['Muestra','Omitir un país','Comparar'],1)]];
    }
    case 'simulacion':{
      const initial=D.tables.simulation_metrics[0];
      return D.tables.simulation_metrics.filter(r=>r.k===initial.k&&r.estimando===initial.estimando).slice(0,3).map(r=>[RESEARCH_ESTIMATORS[r.estimador]||r.estimador,'Ejemplo simulado de C1 · N = '+r.n+' · '+researchPath(r.estimando)+'. La cobertura indica cuántos intervalos incluyen el valor usado para generar los datos.',bars([['Cobertura observada',100*r.cobertura95,fmt(100*r.cobertura95,1)+' %'],['Referencia',95,'95 %']],100)]);
    }
    case 'complementarios':return sequence(['Perfiles','Redes','Predicción'],[['¿Qué países se parecen?','Los perfiles agrupan países con combinaciones parecidas de puntuaciones.'],['¿Qué funciones se relacionan?','La red recoge asociaciones entre dos funciones al tener en cuenta las demás.'],['¿Se sostiene en otros países?','La validación compara las predicciones con los servicios observados en los países reservados.']],false);
    case 'figuras':{
      const eligible=CAT.filter(r=>r.figures.length&&(!state.figunit||state.figunit===r.unit)&&(r.sample===state.sample||r.sample==='todas'));
      const groups=[...new Set(eligible.map(r=>r.group))].slice(0,4);
      return groups.length?groups.map(g=>{const r=eligible.find(item=>item.group===g),f=r.figures[0];return [g,(UL[r.unit]||r.unit)+' · '+titleMethod(r.method),'<img class="reader-original" src="'+esc(f.url)+'" alt="'+esc(f.name)+'">']}):[['Galería','Selecciona otra población para consultar figuras.',diagramRow(['Población','Muestra','Figura'],2)]];
    }
    case 'catalogo':return archives.map(([key,num])=>[({ok:'Resultados disponibles',no_aplicable:'Análisis no aplicables',documento:'Documentación'})[key]||key,'Colección de octubre · '+countText(num)+' de '+countText(D.meta.records)+' entradas del archivo.',bars([[key,num]],D.meta.records)]);
    case 'documentacion':return sequence(['World Map 2025','Análisis ATLANTES','Atlas de resultados'],[['Fuente de los indicadores','World Map 2025 reúne las puntuaciones nacionales de cuidados paliativos.'],['De las puntuaciones a las estimaciones','La colección de octubre conserva modelos, intervalos y sensibilidades. Los análisis de noviembre amplían el estudio de combinaciones y órdenes.'],['Autoría y procedencia','Fernando Cagigas y Laura Monzón · Proyecto ATLANTES, Universidad de Navarra. Cada colección identifica la población y el método que produjo la cifra.']]);
  }
}
function intervalGraphic(point,low,high){
  const lo=Math.min(-.1,low),hi=Math.max(.85,high),x=v=>10+80*(v-lo)/(hi-lo);
  return '<div class="reader-interval"><strong>'+fmt(point)+'</strong><svg viewBox="0 0 100 10" aria-hidden="true"><path d="M'+x(0)+' 0v10" stroke="#8cacae" stroke-dasharray="1 1"/><path d="M'+x(low)+' 5H'+x(high)+'" stroke="#187b76" stroke-width="1.2"/><circle cx="'+x(point)+'" cy="5" r="2.3" fill="#193d52"/></svg><span>Intervalo del 95 % · '+fmt(low)+' a '+fmt(high)+'</span></div>';
}
const readerQuestions={
  medicion:'¿Cómo se mide el desarrollo de los cuidados paliativos?',
  regiones:'¿Cómo se relacionan las funciones con los servicios en esta población?',
  modelos:'¿Qué cambia al reorganizar los mismos tres bloques?',
  contexto:'¿Por qué dos países con equipos similares pueden tener servicios distintos?',
  moderacion:'¿Dónde varía la relación con los servicios?',
  qca:'¿Cuándo una condición es necesaria o suficiente?',
  bosques:'¿Cómo aprende un árbol cuando se le exige usar los tres bloques?',
  dependencias:'¿Cómo pasamos de una red de asociaciones a un orden posible?',
  robustez:'¿Cuánto cambia el resultado al retirar un país?',
  simulacion:'¿Con qué frecuencia acierta el intervalo en una simulación?',
  complementarios:'¿Qué pregunta responde cada análisis?',
  metodologia:'¿Cómo se lee una estimación con su intervalo?',
  figuras:'¿Qué muestran las figuras de esta población?',
  catalogo:'¿Qué resultados contiene el archivo?',
  documentacion:'¿De dónde proceden las cifras?'
};
const shelves=[
  ['El estudio',['medicion','regiones','modelos']],
  ['Cómo se relacionan las funciones',['contexto','moderacion','qca','bosques','dependencias']],
  ['Cómo se comprueban los resultados',['robustez','simulacion','complementarios','metodologia']],
  ['Archivo del estudio',['figuras','catalogo','documentacion']]
];

function mountAtlasReader(view) {
  disposeReader();
  const main=document.querySelector('#main'), nav=document.querySelector('#nav');
  for (const [title,ids] of shelves){
    const first=nav.querySelector('a[href="#'+ids[0]+'"]');
    if(first){const label=document.createElement('small');label.className='shelf-name';label.textContent=title;first.before(label)}
  }
  if(view==='dependencias'){
    drawRegion('mundo');
    main.querySelectorAll('[data-network-region]').forEach(button=>button.onclick=()=>drawRegion(button.dataset.networkRegion));
  }
  const stopOrder=mountOrderComparison();
  const hero=document.createElement('section');
  hero.className='atlas-reader';
  const originalHeading=main.querySelector('h1');
  // Keep the original heading for assistive navigation and retain its surrounding controls.
  originalHeading?.setAttribute('hidden','');
  const headings=[...main.querySelectorAll('h2')].filter(h=>h.textContent.trim());
  const label=NAV.find(row=>row[0]===view)[2];
  hero.innerHTML='<div class="reader-head"><span>'+esc(label)+'</span><h1>'+readerQuestions[view]+'</h1></div>'+
    '<div class="reader-content"><div class="reader-measure"></div><div class="reader-caption"><div class="reader-progress"></div><h2></h2><p></p><div class="reader-transport"><button type="button" data-action="previous" aria-label="Escena anterior">←</button><button type="button" data-action="play">Reproducir</button><button type="button" data-action="next" aria-label="Escena siguiente">→</button></div></div></div>';
  main.prepend(hero);
  const releaseChapters=mountChapterNavigator(main, hero, headings, view);
  // Keep quantitative context and figure captions visible. Secondary method paragraphs expand in place.
  for(const section of main.querySelectorAll('.panel,.guide-chapter,.analysis-explanation')){
    const paragraphs=[...section.children].filter(el=>el.tagName==='P'&&!el.className&&!el.id);
    for(const paragraph of paragraphs.slice(1)){
      if(paragraph.textContent.length<210||paragraph.querySelector('button,a,select'))continue;
      const disclosure=document.createElement('details');disclosure.className='reader-detail';
      disclosure.innerHTML='<summary>Cómo interpretar este resultado</summary>';paragraph.before(disclosure);disclosure.append(paragraph);
    }
  }
  let frames=lessonFor(view),index=view==='modelos'?Math.max(0,['C1','C7','C9','C10'].indexOf(state.case)):0,timer=null,inView=false,manual=false;
  if(!frames?.length){hero.remove();return}
  const visual=hero.querySelector('.reader-measure'),caption=hero.querySelector('.reader-caption'),play=hero.querySelector('[data-action="play"]');
  const stop=()=>{clearTimeout(timer);timer=null};
  const repaint=()=>{
    const [title,description,figure]=frames[index];
    visual.innerHTML=figure;caption.querySelector('h2').textContent=title;caption.querySelector('p').textContent=description;
    caption.querySelector('.reader-progress').textContent=(index+1)+' / '+frames.length;
    play.textContent=timer!==null?'Pausar':index===frames.length-1?'Repetir':'Reproducir';
    hero.querySelector('[data-action="previous"]').disabled=index===0;
    hero.querySelector('[data-action="next"]').disabled=index===frames.length-1;
    hero.classList.toggle('is-paused',timer===null);
  };
  function schedule(){
    stop();
    if(inView&&!document.hidden&&index<frames.length-1&&!manual)timer=setTimeout(()=>{index++;schedule()},6800);
    repaint();
  }
  hero.addEventListener('click',event=>{
    const action=event.target.closest('button')?.dataset.action;
    if(!action)return;
    if(action==='play'){
      manual=timer!==null;
      hero.classList.toggle('pause-sem-motion',manual);
      if(!manual&&index===frames.length-1)index=0;
    }else{manual=true;index+=action==='next'?1:-1}
    schedule();
  });
  const observer=typeof IntersectionObserver==='undefined'?{observe(){},disconnect(){}}:new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule()},{threshold:.22});
  manual=Boolean(motionQuery?.matches);observer.observe(hero);
  function ruleChanged(){if(view==='qca'){frames=qcaLesson();if(frames.length){index=0;schedule()}}}
  document.addEventListener('atlas-qca-rule',ruleChanged);
  document.addEventListener('visibilitychange',schedule);
  const replay=main.querySelector('[data-replay-calculation]');
  if(replay)replay.onclick=()=>{index=0;manual=false;hero.scrollIntoView({block:'start'});schedule()};
  disposeReader=()=>{releaseChapters?.();stopOrder();stop();observer.disconnect();document.removeEventListener('atlas-qca-rule',ruleChanged);document.removeEventListener('visibilitychange',schedule)};
  repaint();
}
function mountOrderComparison(){
  const host=document.querySelector('#order-player');
  if(!host)return ()=>{};
  const orders=[
    ['CGA',.116,.222,-.116],['GCA',.153,.269,-.062],
    ['ACG',.236,.396,.062],['CAG',.159,.287,-.095]
  ];
  let index=0,timer=null,playing=!motionQuery?.matches,visible=false;
  host.innerHTML='<div class="order-toolbar"><label>Orden de lectura <select>'+orders.map(([code],i)=>'<option value="'+i+'">'+[...code].map(k=>studyBlocks[k]).join(' → ')+'</option>').join('')+'</select></label><button type="button"></button></div><div class="order-scene"></div>';
  const select=host.querySelector('select'),button=host.querySelector('button');
  function draw(){
    clearTimeout(timer);
    const [code,first,second,asymmetry]=orders[index];
    select.value=String(index);
    button.textContent=playing?'Pausar recorrido':'Reproducir órdenes';
    host.querySelector('.order-scene').innerHTML=diagramRow([...code].map(k=>studyBlocks[k]),0)+bars([
      ['Posterior alto entre anteriores bajos',first,fmt(100*first,1)+' %'],
      ['Anterior bajo entre posteriores altos',second,fmt(100*second,1)+' %']
    ],1)+'<p class="metric-note">Excepciones medias al corte 2,50 · asimetría de necesidad '+fmt(asymmetry)+'.</p>';
    host.classList.toggle('is-paused',!playing||!visible);
    if(playing&&visible&&!document.hidden)timer=setTimeout(()=>{if(index===3)playing=false;else index++;draw()},5600);
  }
  select.onchange=()=>{index=Number(select.value);playing=false;draw()};
  button.onclick=()=>{if(!playing&&index===3)index=0;playing=!playing;draw()};
  const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;draw()},{threshold:.3});
  observer?.observe(host);document.addEventListener('visibilitychange',draw);draw();
  return ()=>{clearTimeout(timer);observer?.disconnect();document.removeEventListener('visibilitychange',draw)};
}
const chapterMemory=new Map();

function mountChapterNavigator(main, hero, headings, view){
  const sections=headings.filter(h=>!h.closest('details')).map(heading=>{
    const container=heading.closest('.panel,.analysis-story,.guide-chapter,.sem-case,section')||heading.parentElement;
    return {heading,container};
  }).filter((entry,i,list)=>list.findIndex(e=>e.container===entry.container)===i);
  if(!sections.length)return;
  const toolbar=document.createElement('div');
  toolbar.className='reader-index';
  toolbar.innerHTML='<label>Explorar resultados <select aria-label="Apartado de resultados"><option value="-1">Todos los apartados</option>'+
    sections.map(({heading},i)=>'<option value="'+i+'">'+esc(heading.textContent.trim())+'</option>').join('')+'</select></label>'+
    '<div class="chapter-arrows"><button type="button" aria-label="Apartado anterior">←</button><button type="button" aria-label="Apartado siguiente">→</button></div>';
  hero.after(toolbar);
  const select=toolbar.querySelector('select');
  const [back,next]=toolbar.querySelectorAll('button');
  let selected=-1;
  function show(index,scroll){
    selected=index;
    select.value=String(index);chapterMemory.set(view,index);
    back.disabled=index<0;next.disabled=index===sections.length-1;
    const current=sections[index]?.container;
    for(const {container} of sections){
      container.classList.toggle('chapter-aside',Boolean(current&&current!==container&&!current.contains(container)&&!container.contains(current)));
    }
    if(current){
      requestAnimationFrame(()=>{
        current.querySelectorAll('.js-plotly-plot').forEach(plot=>{if(window.Plotly?.Plots)Plotly.Plots.resize(plot).catch(()=>{})});
        if(scroll)current.scrollIntoView({block:'start',behavior:motionQuery?.matches?'instant':'smooth'});
      });
    }
  }
  select.onchange=()=>show(Number(select.value),true);
  back.onclick=()=>show(Math.max(-1,selected-1),true);
  next.onclick=()=>show(Math.min(sections.length-1,selected+1),true);
  // Show a target hidden by focus mode before the original in-page jumps run.
  const revealJump=event=>{
    if(selected!==-1&&event.target.closest('[data-scroll-case],[data-scroll-table]'))show(-1,false);
  };
  main.addEventListener('click',revealJump,true);
  show(Math.min(chapterMemory.get(view)??-1,sections.length-1),false);
  return ()=>main.removeEventListener('click',revealJump,true);
}
