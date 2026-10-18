(() => {
  'use strict';
  history.scrollRestoration='manual';
  const {articles, months} = window.RESEARCH_DATA;
  const byId = new Map(articles.map(a => [a.id,a]));
  const monthById = new Map(months.map(m => [m.id,m]));
  const app = document.getElementById('app'), workspace = document.getElementById('workspace');
  const track = document.getElementById('scroll-track'), rail = document.getElementById('month-rail');
  const crumbs = document.getElementById('breadcrumbs'), announcement = document.getElementById('announcement');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const monthNodes = new Map(), articleNodes = new Map(), readPositions = new Map();
  const pendingPoses=new Map();
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp = (n,a=0,b=1) => Math.max(a,Math.min(b,n));
  const ease = n => n*n*(3-2*n);
  const date = value => value.replaceAll('-','.');
  const monthLabel = id => `${id.slice(0,4)}年${Number(id.slice(5))}月`;
  let state = {mode:'timeline',month:months[0].id,article:articles[0].id,chapter:0,origin:null,progress:0,toc:false,depth:0};
  let step=480, frame=0, ignoreScroll=false, configuredY=0, switchTimer, saveTimer, announced='', lastRail='';

  function relation(a,b) {
    if(a.category===b.category)return '同じテーマ';
    if(a.date===b.date)return '同じ調査日';
    const tag=a.tags.find(t=>b.tags.includes(t));
    return tag ? `共通のタグ · ${tag}` : '近い調査対象日';
  }
  function relatedTo(id) {
    const a=byId.get(id);
    return articles.filter(b=>b.id!==id).map(b=>({b,score:(a.category===b.category?16:0)+(a.date===b.date?8:0)+a.tags.filter(t=>b.tags.includes(t)).length*3-Math.abs(Date.parse(a.date)-Date.parse(b.date))/86400000/150}))
      .sort((x,y)=>y.score-x.score).slice(0,3).map(x=>x.b.id);
  }
  function ids() {
    return state.mode==='timeline'?months.map(m=>m.id):state.mode==='month'?monthById.get(state.month).articles:state.mode==='related'?relatedTo(state.origin):[state.article];
  }
  function focusIndex() { return clamp(Math.round(state.progress),0,ids().length-1); }
  function focusId() { return ids()[focusIndex()]; }
  function snapshot() { return {...state}; }
  function hash() {
    if(state.mode==='timeline')return `#timeline/${focusId()}`;
    if(state.mode==='month')return `#month/${state.month}/${focusIndex()}`;
    if(state.mode==='related')return `#related/${state.origin}/${focusIndex()}`;
    return `#read/${state.article}/${state.chapter}`;
  }
  function remember() { history.replaceState({spatial:snapshot()},'',hash()); }

  for(const m of months) {
    const node=document.createElement('article');node.className='paper month-paper';node.dataset.month=m.id;
    node.innerHTML=`<div class="month-inner"><h2 class="month-heading"><span class="month-year">${m.id.slice(0,4)}</span><span class="month-number">${m.id.slice(5)}</span><span class="month-count">${m.articles.length} 記事</span></h2><p class="month-description">${m.categories.map(esc).join(' · ')}</p><button class="month-open" data-open-month="${m.id}">記事を見る <span aria-hidden="true">↗</span></button></div>`;
    document.getElementById('month-space').append(node);monthNodes.set(m.id,node);
    const button=document.createElement('button');button.className='rail-month';button.dataset.openMonth=m.id;
    button.setAttribute('aria-label',monthLabel(m.id));button.innerHTML=`<span class="rail-year">${m.id.slice(0,4)}</span><span>${m.id.slice(5)}月</span>`;
    rail.append(button);
  }
  for(const a of articles) {
    const node=document.createElement('article');node.className='paper article-paper';node.dataset.article=a.id;
    node.innerHTML=`<header class="paper-head"><div class="paper-meta"><span class="paper-category">${esc(a.category)}</span><span class="relation-label"></span><time datetime="${a.date}">${date(a.date)}</time></div><h2 class="article-title"><button class="title-open" data-read="${a.id}">${esc(a.title)}</button></h2></header><div class="paper-preview"><p class="preview-copy">${esc(a.teaser)}</p><div class="paper-tags">${a.tags.slice(0,4).map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="preview-actions"><span>根拠 ${a.sources.length}件</span><button class="read-button" data-read="${a.id}">本文を読む <span aria-hidden="true">↗</span></button></div></div><div class="read-pane"></div>`;
    document.getElementById('article-space').append(node);articleNodes.set(a.id,node);
  }

  function buildReader(id) {
    const node=articleNodes.get(id),pane=node.querySelector('.read-pane');
    if(pane.dataset.built)return;
    const a=byId.get(id),doc=new DOMParser().parseFromString(a.body,'text/html');
    const sections=[...doc.body.children].filter(el=>el.matches('section'));
    pane.innerHTML=`<div class="reader-toolbar"><button data-action="toc" aria-pressed="false">目次</button><button data-action="related">関連記事 <span aria-hidden="true">↗</span></button></div><div class="chapter-list"></div>`;
    const list=pane.querySelector('.chapter-list');
    sections.forEach((source,i)=>{
      const heading=source.querySelector('h2'),name=heading?.textContent.trim()??`${i+1}`;heading?.remove();
      const section=document.createElement('section');section.className='chapter';section.dataset.chapter=i;
      section.innerHTML=`<h3><button class="chapter-toggle" data-chapter="${i}" aria-expanded="false"><span class="chapter-number">${String(i+1).padStart(2,'0')}</span><span class="chapter-name">${esc(name)}</span></button></h3><div class="chapter-body" tabindex="0" role="region" aria-label="${esc(name)}">${source.innerHTML}</div>`;
      list.append(section);
    });
    const source=document.createElement('section');source.className='chapter';source.dataset.chapter=sections.length;
    source.innerHTML=`<h3><button class="chapter-toggle" data-chapter="${sections.length}" aria-expanded="false"><span class="chapter-number">${String(sections.length+1).padStart(2,'0')}</span><span class="chapter-name">出典</span></button></h3><div class="chapter-body"><ul class="sources-list">${a.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a></li>`).join('')}</ul><p><a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">公開版の記事を開く ↗</a></p></div>`;
    list.append(source);
    pane.querySelectorAll('a[href]').forEach(a=>{a.target='_blank';a.rel='noopener noreferrer';});
    // Article-local anchor names must not collide with a different article.
    pane.querySelectorAll('[id]').forEach(el=>el.id=`${id}--${el.id}`);
    pane.querySelectorAll('a[href^="#"]').forEach(a=>a.setAttribute('href',`#${id}--${a.getAttribute('href').slice(1)}`));
    pane.dataset.built='true';
  }
  function chapters() {
    const node=articleNodes.get(state.article);buildReader(state.article);
    const all=[...node.querySelectorAll('.chapter')],short=workspace.clientHeight<620;
    state.chapter=clamp(state.chapter,0,all.length-1);
    all.forEach((el,i)=>{
      el.classList.toggle('active',i===state.chapter);
      el.classList.toggle('previous',i===state.chapter-1&&!short);
      el.classList.toggle('next',i===state.chapter+1);
      el.querySelector('button').setAttribute('aria-expanded',String(i===state.chapter&&!state.toc));
    });
    node.classList.toggle('toc-open',state.toc);
    node.querySelector('[data-action=toc]').setAttribute('aria-pressed',String(state.toc));
    const list=node.querySelector('.chapter-list');
    list.style.setProperty('--prev-height',state.chapter>0&&!short?'48px':'0px');
    list.style.setProperty('--next-height',state.chapter<all.length-1?'48px':'0px');
  }

  function crumb(text,action,extra='') {return `<button data-action="${action}" ${extra}>${esc(text)}</button>`;}
  function updateChrome() {
    const a=state.mode==='read'?byId.get(state.article):state.mode==='related'?byId.get(state.origin):null;
    let html=crumb('タイムライン','timeline');
    if(state.mode!=='timeline')html+=`<span class="crumb-separator" aria-hidden="true">›</span>${crumb(monthLabel(a?a.date.slice(0,7):state.month),'month')}`;
    if(state.mode==='read')html+='<span class="crumb-separator" aria-hidden="true">›</span><span aria-current="page">本文</span>';
    if(state.mode==='related')html+='<span class="crumb-separator" aria-hidden="true">›</span><span aria-current="page">関連記事</span>';
    if(crumbs.innerHTML!==html)crumbs.innerHTML=html;
    document.querySelector('.back-button').hidden=state.mode==='timeline';
    const current=state.mode==='timeline'?focusId():(a?a.date.slice(0,7):state.month);
    for(const button of rail.children) {
      if(button.dataset.openMonth===current)button.setAttribute('aria-current','date');else button.removeAttribute('aria-current');
    }
    if(current!==lastRail){
      const active=rail.querySelector('[aria-current]');
      if(active){if(innerWidth<760)rail.scrollTo({left:active.offsetLeft-rail.clientWidth/2+active.clientWidth/2,behavior:'instant'});else if(active.offsetTop<rail.scrollTop||active.offsetTop>rail.scrollTop+rail.clientHeight-30)rail.scrollTop=active.offsetTop-rail.clientHeight/2;}
      lastRail=current;
    }
    const label=state.mode==='timeline'?monthLabel(focusId()):state.mode==='month'?byId.get(focusId()).title:state.mode==='related'?`${relation(a,byId.get(focusId()))}。${byId.get(focusId()).title}`:byId.get(state.article).title;
    if(label!==announced){announcement.textContent=label;announced=label;}
  }

  // Resolve the complete frame before touching the DOM. A visible surface must
  // never become inert and visible again merely because its pose is recalculated.
  function pose(node,p) {pendingPoses.set(node,p);}
  function applyPose(node,p) {
    const visible=p.opacity>.025;
    if(!visible&&node.inert)return;
    node.style.width=`${p.w}px`;node.style.height=`${p.h}px`;
    node.style.transform=`translate3d(${p.x.toFixed(3)}px,${p.y.toFixed(3)}px,0) scale(${p.scale??1}) rotateX(${reduced.matches?0:p.rx??0}deg)`;
    node.style.opacity=String(p.opacity);node.style.zIndex=String(p.z??1);
    node.style.setProperty('--fold',String(p.fold??0));
    node.dataset.front=String(!!p.front);node.dataset.folded=String((p.fold??0)>.8);node.inert=!visible;
    node.querySelectorAll('.paper-preview,.month-description,.month-open').forEach(el=>el.inert=!visible||(p.fold??0)>.8);
    node.setAttribute('aria-hidden',String(!visible));
    node.style.pointerEvents=visible?'auto':'none';
  }
  const mix=(a,b,t)=>Object.fromEntries(Object.keys(a).map(k=>[k,typeof a[k]==='number'?a[k]+(b[k]-a[k])*t:t>.5?b[k]:a[k]]));

  function draw() {
    frame=0;
    pendingPoses.clear();
    const w=workspace.clientWidth,h=workspace.clientHeight,mobile=innerWidth<760;
    const mw=Math.min(mobile?w-32:650,w-40), mx=(w-mw)/2;
    const ay=mobile?72:72, aw=Math.min(mobile?w-32:740,w-40), ax=(w-aw)/2;
    const ah=Math.min(mobile?440:420,h-160), mh=Math.min(mobile?250:270,h-230), my=mobile?76:76;
    const p=reduced.matches?Math.round(state.progress):state.progress,index=Math.floor(p),q=ease(clamp((p-index-.15)/.7));
    const activeIndex=clamp(Math.round(p),0,ids().length-1);
    const foldedTop={x:ax+12,y:2,w:aw-24,h:64,scale:.95,rx:9,fold:1,opacity:.76};
    const foldedBottom={x:ax+12,y:h-68,w:aw-24,h:64,scale:.95,rx:-9,fold:1,opacity:.82};
    const front={x:ax,y:ay,w:aw,h:Math.max(260,ah),scale:1,rx:0,fold:0,opacity:1};
    for(const node of monthNodes.values())pose(node,{x:mx,y:my,w:mw,h:Math.max(180,mh),opacity:0,fold:1});
    for(const node of articleNodes.values()){
      node.classList.remove('reading');node.removeAttribute('data-relation');
      pose(node,{x:ax,y:h+70,w:aw,h:64,opacity:0,fold:1});
    }
    document.getElementById('relations').innerHTML='';
    if(state.mode==='timeline') {
      const monthFront={x:mx,y:my,w:mw,h:Math.max(180,mh),scale:1,rx:0,fold:0,opacity:1};
      const mt={x:mx+14,y:2,w:mw-28,h:58,scale:.95,rx:12,fold:1,opacity:.7};
      const mb={x:mx+14,y:h-62,w:mw-28,h:58,scale:.95,rx:-12,fold:1,opacity:.76};
      for(let i=Math.max(0,index-1);i<=Math.min(months.length-1,index+1);i++){
        let pos=i===index?mix(monthFront,mt,q):i===index+1?mix(mb,monthFront,q):{...mt,opacity:mt.opacity*(1-q)**4};
        pose(monthNodes.get(months[i].id),{...pos,z:i===activeIndex?100:30-i,front:i===activeIndex});
      }
      const previewCount=Math.max(0,Math.min(mobile?2:3,Math.floor((h-78-my-monthFront.h-14)/64)));
      for(const [mi,phase] of [[index,0],[index+1,1]]) {
        if(!months[mi])continue;
        const visibility=phase?clamp((q-.6)/.4):clamp(1-q/.4);
        months[mi].articles.slice(0,previewCount).forEach((id,i)=>pose(articleNodes.get(id),{
          x:mx+18+i*9,y:my+monthFront.h+14+i*64+(phase?(1-q)*110:-q*110),w:mw-36-i*10,h:62,scale:1,rx:-3,fold:1,opacity:(i===0?.94:.76)*visibility,z:150-i
        }));
      }
    } else if(state.mode==='month') {
      const list=monthById.get(state.month).articles;
      for(let i=Math.max(0,index-1);i<=Math.min(list.length-1,index+1);i++){
        let pos=i===index?mix(front,foldedTop,q):i===index+1?mix(foldedBottom,front,q):{...foldedTop,opacity:foldedTop.opacity*(1-q)**4};
        pose(articleNodes.get(list[i]),{...pos,z:i===activeIndex?100:40-i,front:i===activeIndex});
      }
    } else if(state.mode==='read') {
      const node=articleNodes.get(state.article);node.classList.add('reading');chapters();
      const rw=mobile?w-32:Math.min(780,w-310),rx=mobile?16:Math.max(0,(w-rw-260)/2);
      const rh=mobile?h-78:h-32;
      pose(node,{x:rx,y:mobile?6:12,w:rw,h:rh,opacity:1,scale:1,fold:0,z:120,front:true});
      const related=relatedTo(state.article);
      related.slice(0,mobile?1:3).forEach((id,i)=>{
        const other=articleNodes.get(id);other.dataset.relation=relation(byId.get(state.article),byId.get(id));other.querySelector('.relation-label').textContent=other.dataset.relation;
        pose(other,{x:mobile?24:rx+rw+28+i*5,y:mobile?h-64:82+i*94,w:mobile?w-48:Math.max(225,w-rx-rw-48),h:mobile?60:82,scale:1,rx:mobile?-3:0,fold:1,opacity:.9-i*.08,z:80-i});
      });
    } else {
      const list=relatedTo(state.origin),source=articleNodes.get(state.origin),cx=mobile?16:Math.max(360,w*.4),cw=mobile?w-32:Math.min(640,w-cx-20);
      const rf={...front,x:cx,w:cw,y:mobile?90:86,h:Math.max(260,Math.min(420,h-175))};
      const rt={...foldedTop,x:cx+12,w:cw-24,y:mobile?82:12};
      const rb={...foldedBottom,x:cx+12,w:cw-24};
      pose(source,{x:mobile?16:20,y:mobile?0:76,w:mobile?w-32:Math.min(310,cx-40),h:mobile?68:108,scale:1,fold:1,opacity:.75,z:40});
      for(let i=Math.max(0,index-1);i<=Math.min(list.length-1,index+1);i++){
        const node=articleNodes.get(list[i]);node.dataset.relation=relation(byId.get(state.origin),byId.get(list[i]));node.querySelector('.relation-label').textContent=node.dataset.relation;
        const pos=i===index?mix(rf,rt,q):i===index+1?mix(rb,rf,q):{...rt,opacity:rt.opacity*(1-q)**4};
        pose(node,{...pos,z:i===activeIndex?110:50-i,front:i===activeIndex});
      }
      const sx=mobile?30:Math.min(330,cx-20),sy=mobile?70:150,ex=mobile?30:cx-8,ey=mobile?90:180;
      document.getElementById('relations').innerHTML=`<path d="M${sx} ${sy} C${sx} ${sy+25},${ex} ${ey-25},${ex} ${ey}"/>`;
    }
    for(const [node,pos] of pendingPoses)applyPose(node,pos);
    app.dataset.mode=state.mode;app.dataset.progress=String(state.progress);app.dataset.focus=focusId();
    updateChrome();
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
  function configureScroll(p=state.progress) {
    step=innerWidth<760?460:540;
    const distance=state.mode==='read'?0:Math.max(0,ids().length-1)*step;
    document.body.classList.toggle('read-mode',state.mode==='read');
    track.style.height=`${innerHeight+distance}px`;
    ignoreScroll=true;configuredY=clamp(p,0,ids().length-1)*step;scrollTo({top:configuredY,behavior:'instant'});
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ignoreScroll=false;}));
  }
  function navigate(next,{push=true,animate=true}={}) {
    remember();state={...state,...next,toc:false};state.depth+=push?1:0;
    state.progress=clamp(state.progress,0,ids().length-1);
    if(animate&&!reduced.matches){app.classList.add('switching');clearTimeout(switchTimer);switchTimer=setTimeout(()=>app.classList.remove('switching'),720);}
    configureScroll();draw();
    history[push?'pushState':'replaceState']({spatial:snapshot()},'',hash());
  }
  function openMonth(id) {navigate({mode:'month',month:id,progress:0,origin:null});}
  function openRead(id) {
    if(state.mode==='read'&&id===state.article)return;
    if(state.mode==='read'&&id!==state.article){navigate({mode:'related',origin:state.article,progress:relatedTo(state.article).indexOf(id)});return;}
    const saved=readPositions.get(id);navigate({mode:'read',article:id,month:byId.get(id).date.slice(0,7),chapter:saved?.chapter??0,progress:0});
  }
  function back() {if(state.toc){state.toc=false;draw();return;}if(state.depth>0){history.back();return;}navigate({mode:'timeline',progress:months.findIndex(m=>m.id===state.month)},{push:false});}
  function seek(index) {scrollTo({top:clamp(index,0,ids().length-1)*step,behavior:reduced.matches?'instant':'smooth'});}

  app.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.openMonth){openMonth(button.dataset.openMonth);return;}
    if(button.dataset.read){openRead(button.dataset.read);return;}
    if(button.dataset.chapter!==undefined){
      state.chapter=Number(button.dataset.chapter);state.toc=false;readPositions.set(state.article,{chapter:state.chapter});
      const node=articleNodes.get(state.article);node.querySelector('.chapter-list').animate([{opacity:.25,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:reduced.matches?0:280,easing:'ease-out'});
      draw();remember();return;
    }
    switch(button.dataset.action){
      case'timeline':navigate({mode:'timeline',progress:months.findIndex(m=>m.id===(state.mode==='timeline'?focusId():state.month))});break;
      case'month':openMonth(state.mode==='related'?byId.get(state.origin).date.slice(0,7):state.month);break;
      case'back':back();break;
      case'toc':state.toc=!state.toc;draw();break;
      case'related':navigate({mode:'related',origin:state.article,progress:0});break;
    }
  });
  addEventListener('scroll',()=>{
    if(state.mode==='read'||(ignoreScroll&&Math.abs(scrollY-configuredY)<1))return;
    ignoreScroll=false;
    app.classList.remove('switching');state.progress=clamp(scrollY/step,0,ids().length-1);schedule();
    clearTimeout(saveTimer);saveTimer=setTimeout(remember,160);
  },{passive:true});
  addEventListener('wheel',()=>app.classList.remove('switching'),{passive:true});
  addEventListener('touchstart',()=>app.classList.remove('switching'),{passive:true});
  addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();back();return;}
    if(state.mode==='read')return;
    if(event.key==='ArrowDown'||event.key==='ArrowRight'){event.preventDefault();seek(focusIndex()+1);}
    if(event.key==='ArrowUp'||event.key==='ArrowLeft'){event.preventDefault();seek(focusIndex()-1);}
    if(event.key==='Enter'&&event.target===document.body){if(state.mode==='timeline')openMonth(focusId());else openRead(focusId());}
  });
  addEventListener('popstate',event=>{
    if(event.state?.spatial){state={...event.state.spatial};configureScroll();app.classList.add('switching');draw();clearTimeout(switchTimer);switchTimer=setTimeout(()=>app.classList.remove('switching'),720);}
  });
  let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{configureScroll();draw();},80);});
  reduced.addEventListener('change',()=>{app.classList.remove('switching');draw();});

  const route=decodeURIComponent(location.hash.slice(1)).split('/');
  if(route[0]==='read'&&byId.has(route[1]))state={...state,mode:'read',article:route[1],month:byId.get(route[1]).date.slice(0,7),chapter:Number(route[2])||0};
  else if(route[0]==='month'&&monthById.has(route[1]))state={...state,mode:'month',month:route[1],progress:Number(route[2])||0};
  else if(route[0]==='related'&&byId.has(route[1]))state={...state,mode:'related',origin:route[1],progress:Number(route[2])||0};
  else if(route[0]==='timeline'&&monthById.has(route[1]))state.progress=months.findIndex(m=>m.id===route[1]);
  configureScroll();draw();remember();
  document.fonts.ready.then(()=>{configureScroll();draw();});
  window.spatialPrototype={getState:()=>({...snapshot(),focus:focusId(),step,months:months.length,articles:articles.length,reduced:reduced.matches})};
})();
