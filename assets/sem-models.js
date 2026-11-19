'use strict';

const c10Fits = {
  'mundo/C10M': 'C10-M · Mundo · muestra completa',
  'asia_pacifico/C10M': 'C10-M · Asia-Pacífico · muestra depurada',
  'asia_pacifico/C10R1': 'C10-R1 · Asia-Pacífico · muestra depurada'
};

function modelCaseTabs() {
  return '<div class="case-tabs" aria-label="Casuísticas">'+[...Object.keys(D.cases),'C10'].map(id=>
    '<button data-case="'+id+'" aria-pressed="'+(state.case===id)+'">'+id+'</button>'
  ).join('')+'</div>';
}

function selectedC10Fit() {
  return Object.hasOwn(c10Fits,state.c10Fit)?state.c10Fit:'mundo/C10M';
}

function c10ModelPage() {
  const key=selectedC10Fit(), fit=window.ATLAS_C10[key];
  const rows=fit.rows.map(row=>[researchPath(row.path),fmt(row.b),researchInterval(row.ic_lo,row.ic_hi)]);
  return heading('Casuísticas y modelos','C10 compara el papel de capacidad, gobernanza y acceso en la organización de los servicios.')+
    modelCaseTabs()+panel(c10Fits[key],
      '<div class="controls">'+select('c10Fit','Modelo y población',c10Fits)+'</div>'+
      '<p>'+fit.n+' países · '+fit.m+' imputaciones. '+(fit.case==='C10R1'?
        'El modelo regional conecta capacidad y acceso directamente con servicios.':
        'El modelo especifica una ruta desde cada una de las tres funciones hacia servicios.')+'</p>'+
      semSummaryDiagram(fit.case,fit.rows)+semMotionKey()+
      lvTable(['Ruta','Coeficiente','Intervalo del 95 %'],rows)
    );
}

function semMotionKey(){
  return '<p class="metric-note">La flecha avanza del predictor al resultado cuando el intervalo del 95 % excluye cero. La línea discontinua indica una dirección incierta.</p>';
}

function semModelLessons(){
  return ['C1','C7','C9','C10'].map(model=>{
    if(model==='C10'){
      const key=state.case==='C10'?selectedC10Fit():'mundo/C10M', fit=window.ATLAS_C10[key];
      return [c10Fits[key],fit.n+' países. Capacidad se relaciona con gobernanza y con acceso. El movimiento señala rutas cuyo intervalo del 95 % excluye cero.',semSummaryDiagram(fit.case,fit.rows)];
    }
    const rows=L.sem[model].map(row=>{
      const [to,from]=row.ruta.split(' ~ ');
      return {path:from+' -> '+to,b:row.estimate_pooled,ic_lo:row.ci_lower,ic_hi:row.ci_upper};
    });
    const reading={C1:'Gobernanza abre dos vías paralelas.',C7:'La cadena pasa primero por capacidad y después por acceso.',C9:'La cadena pasa primero por acceso y después por capacidad.'};
    return [model+' · mundo',reading[model]+' En los 201 países, las flechas en movimiento indican rutas cuyo intervalo del 95 % excluye cero.',semSummaryDiagram(model,rows)];
  });
}

function semSummaryDiagram(model,rows){
  const serial=model==='C7'||model==='C9';
  const order=model==='C7'?['G','C','A','I13']:['G','A','C','I13'];
  const splitOrder=model==='C1'?['G','A','C','I13']:['C','G','A','I13'];
  const positions=Object.fromEntries((serial?order:splitOrder).map((key,i)=>[
    key,serial?[60+164*i,100]:[[60,105],[306,38],[306,173],[552,105]][i]
  ]));
  const lines=rows.map(row=>{
    const [from,to]=row.path.split(' -> ').map(name=>blockCode[name]);
    const [x,y]=positions[from],[xx,yy]=positions[to];
    const gap=serial?order.indexOf(to)-order.indexOf(from):1;
    let d,labelX=(x+xx)/2,labelY=(y+yy)/2-7;
    if(gap>1){
      const above=from==='G';
      const sign=above?-1:1;
      const anchor=y+sign*17,bend=gap===3?8:gap===2&&above?49:152;
      const offset=gap===3?0:24;
      const start=x+offset,end=xx-offset;
      d='M'+start+' '+anchor+' Q'+((start+end)/2)+' '+(2*bend-anchor)+' '+end+' '+anchor;
      labelY=bend+(above?-5:16);
    } else {
      d='M'+(x+53)+' '+y+' L'+(xx-54)+' '+yy;
    }
    const kind=researchDirection(row), supported=kind==='positive'||kind==='negative';
    const color=kind==='negative'?'#a43b43':supported?'#167c80':'#8295a0';
    // The path runs from predictor to outcome, including on the curved shortcuts.
    const arrow = className => '<path class="'+className+'" d="M-5 -4L2 0L-5 4" style="offset-path:path(\''+d+'\');stroke:'+color+'"/>';
    return '<g class="sem-link '+kind+'" data-route="'+esc(row.path)+'"><title>'+esc(researchPath(row.path))+' · '+fmt(row.b)+' · IC 95 % '+researchInterval(row.ic_lo,row.ic_hi)+'</title>'+
      '<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="2.5" '+(supported?'':'stroke-dasharray="5 5"')+'/>'+
      (supported?arrow('sem-tip')+arrow('sem-traveller'):'')+

      '<text class="edge-number" x="'+labelX+'" y="'+labelY+'">'+fmt(row.b,2)+'</text></g>';
  });
  const nodes=Object.entries(positions).map(([key,[x,y]])=>
    '<g transform="translate('+x+' '+y+')"><rect x="-50" y="-15" width="100" height="30" rx="11" fill="'+readerColors[key]+'"/><text text-anchor="middle" y="5" fill="white">'+studyBlocks[key]+'</text></g>'
  );
  return '<svg class="network-canvas sem-summary" viewBox="0 -16 612 220" role="img" aria-label="'+esc(model)+' · '+(serial?order.map(k=>studyBlocks[k]).join(' → '):'Rutas del modelo')+'">'+lines.join('')+nodes.join('')+'</svg>';
}
