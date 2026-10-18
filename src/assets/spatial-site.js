import {spatialCopy} from './spatial-copy.js';

const configNode=document.getElementById('spatial-config');
if(configNode) {
  const entryUrl=new URL(location.href);
  if(entryUrl.searchParams.get('view')==='static'){entryUrl.searchParams.delete('view');history.replaceState(history.state,'',entryUrl);}
  start(JSON.parse(configNode.textContent)).catch(error=>{
    document.getElementById('spatial-app')?.remove();
    document.getElementById('scroll-track')?.remove();
    document.body.classList.remove('spatial-active','read-mode');
    document.documentElement.classList.remove('spatial-active');
    dispatchEvent(new Event('spatial-unavailable'));
    console.error('Spatial workspace unavailable.',error);
  });
}

async function start(config) {
  'use strict';
  const copy=spatialCopy[config.locale];
  async function request(url) {
    const response=await fetch(url,{signal:AbortSignal.timeout(12000),cache:'no-cache'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    return response;
  }
  const catalog=await (await request(config.catalog)).json();
  if(catalog.version!==1||catalog.locale!==config.locale||!Array.isArray(catalog.articles)||!catalog.articles.length)throw new Error('Invalid article catalog');
  const {articles,months,topics,paths}=catalog;
  const fallback=document.querySelector('.page-shell'),fallbackMain=fallback.querySelector('#main');
  const headSelector='meta[name="description"],meta[property^="og:"],meta[name^="twitter:"],meta[property^="article:"],link[rel="canonical"],link[hreflang],script[type="application/ld+json"]';
  const headSnapshot=(doc=document)=>({title:doc.title,nodes:[...doc.head.querySelectorAll(headSelector)].map(n=>n.outerHTML).join('')});
  const initialRecord={...headSnapshot(),main:fallbackMain.innerHTML};
  const records=new Map([[config.path,initialRecord]]),payloads=new Map(),requests=new Map();
  const canonicalOrigin=new URL(document.querySelector('link[rel=canonical]').href).origin;
  function setHead(record) {
    document.title=record.title;
    const template=document.createElement('template');template.innerHTML=record.nodes;
    document.head.querySelectorAll(headSelector).forEach(n=>n.remove());document.head.append(template.content);
    if(record.main!==undefined)fallbackMain.innerHTML=record.main;
    const alternate=document.head.querySelector(`link[hreflang="${config.locale==='ja'?'en':'ja'}"]`);
    if(alternate&&document.getElementById('spatial-language'))document.getElementById('spatial-language').href=new URL(alternate.href).pathname;
  }
  if(config.mode==='read') {
    const original=fallback.querySelector('.reading-article');
    if(original)payloads.set(config.article,{id:config.article,locale:config.locale,
      body:original.querySelector('.article-body').innerHTML,html:original.outerHTML,head:initialRecord});
  }
  async function ensureArticle(id) {
    if(payloads.has(id))return payloads.get(id);
    if(requests.has(id))return requests.get(id);
    const promise=(async()=>{
      const a=articles.find(a=>a.id===id);if(!a)throw new Error('Unknown article');
      const data=await(await request(a.payload)).json();
      if(data.id!==id||data.locale!==config.locale||typeof data.body!=='string'||typeof data.html!=='string'||typeof data.head?.nodes!=='string'||typeof data.head?.title!=='string')throw new Error('Invalid article payload');
      payloads.set(id,data);return data;
    })();
    requests.set(id,promise);try{return await promise;}finally{requests.delete(id);}
  }
  async function pageRecord(path) {
    if(records.has(path))return records.get(path);
    const text=await(await request(path)).text(),doc=new DOMParser().parseFromString(text,'text/html');
    if(!doc.querySelector('#main')||!doc.querySelector('link[rel=canonical]'))throw new Error('Invalid page');
    const record={...headSnapshot(doc),main:doc.querySelector('#main').innerHTML};records.set(path,record);return record;
  }
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const documentSections=[...fallbackMain.querySelectorAll('.content-stack section')].filter(s=>!s.parentElement.closest('.content-stack section')).map(s=>s.cloneNode(true));
  const intro=fallbackMain.querySelector('.hero-copy');
  if(intro&&documentSections[0]&&!documentSections[0].textContent.includes(intro.textContent.trim()))documentSections[0].prepend(intro.cloneNode(true));
  const documentBody=documentSections.length?documentSections.map(s=>s.outerHTML).join(''):`<section><h2>${esc(config.title)}</h2>${fallbackMain.querySelector('.content-stack')?.innerHTML??''}</section>`;
  const app=document.createElement('div');app.id='spatial-app';app.style.visibility='hidden';
  const track=document.createElement('div');track.id='scroll-track';track.setAttribute('aria-hidden','true');
  const menuLinks=[...new Map([...catalog.navigation,...catalog.footer].map(n=>[n.url,n])).values()].map(n=>`<a href="${esc(n.url)}">${esc(n.label)}</a>`).join('');
  app.innerHTML=`<a class="spatial-skip" href="#workspace">${copy.skip}</a><header class="app-header">
    <a class="brand" href="${paths.home}"><img class="brand-logo" src="${new URL('../favicon.svg',new URL(config.catalog,location.href))}" width="28" height="28" alt="" aria-hidden="true">AUTO RESEARCH DIGEST</a>
    <div class="header-actions"><button class="back-button" data-action="back">${copy.back}</button><a id="spatial-language" class="language-link" href="${fallback.querySelector('.lang-switch').getAttribute('href')}">${copy.language}</a><button data-action="menu" aria-haspopup="dialog">${copy.menu}</button></div></header>
    <nav id="breadcrumbs" class="breadcrumbs" aria-label="${copy.workspace}"></nav>
    <main id="workspace" aria-label="${copy.workspace}" tabindex="-1"><h1 id="workspace-heading" class="sr-only">${esc(config.title)}</h1><div class="time-line" aria-hidden="true"></div><svg id="relations" aria-hidden="true"></svg><div id="month-space"></div><div id="article-space"></div></main>
    <nav id="month-rail" class="month-rail" aria-label="${copy.months}"></nav><div id="announcement" class="sr-only" role="status" aria-live="polite"></div>
    <div class="workspace-status" role="status" hidden></div>
    <dialog class="spatial-menu" aria-label="${copy.menu}"><button data-action="close-menu">${copy.close}</button><nav>${menuLinks}</nav></dialog>`;
  document.body.append(track,app);
  history.scrollRestoration='manual';
  const byId = new Map(articles.map(a => [a.id,a]));
  const monthById = new Map(months.map(m => [m.id,m]));
  const workspace = document.getElementById('workspace'), rail = document.getElementById('month-rail');
  const crumbs = document.getElementById('breadcrumbs'), announcement = document.getElementById('announcement');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const monthNodes = new Map(), articleNodes = new Map(), readPositions = new Map();
  const pendingPoses=new Map();
  const readerObservers=new WeakMap();let readerLayoutFrame=0;
  const bodyRestores=new WeakMap();let inputRevision=0;
  const clamp = (n,a=0,b=1) => Math.max(a,Math.min(b,n));
  const ease = n => n*n*(3-2*n);
  const date = value => value.replaceAll('-','.');
  const monthLabel = copy.month;
  const monthStart=id=>articles.findIndex(a=>a.date.startsWith(id));
  let state = {mode:config.mode,path:config.path,list:(config.mode==='timeline'||config.mode==='feed'&&!config.topic&&config.page===1)?articles.map(a=>a.id):(config.list??articles.map(a=>a.id)),topic:config.topic??null,
    month:months[0].id,article:config.article??articles[0].id,chapter:0,fragment:'',origin:null,progress:0,toc:false,depth:0,timelineVersion:2};
  let generation=0;
  let step=480, frame=0, ignoreScroll=false, configuredY=0, switchTimer, saveTimer, announced='', lastRail='';

  function relation(a,b) {
    if(a.category===b.category)return copy.sameTopic;
    if(a.date===b.date)return copy.sameDate;
    const tag=a.tags.find(t=>b.tags.includes(t));
    return tag ? copy.tag(tag) : copy.nearDate;
  }
  function relatedTo(id) {
    const a=byId.get(id);
    return articles.filter(b=>b.id!==id).map(b=>({b,score:(a.category===b.category?16:0)+(a.date===b.date?8:0)+a.tags.filter(t=>b.tags.includes(t)).length*3-Math.abs(Date.parse(a.date)-Date.parse(b.date))/86400000/150}))
      .sort((x,y)=>y.score-x.score).slice(0,3).map(x=>x.b.id);
  }
  function ids() {
    return state.mode==='timeline'?articles.map(a=>a.id):state.mode==='month'?monthById.get(state.month).articles:state.mode==='related'?relatedTo(state.origin):state.mode==='feed'?state.list:state.mode==='topics'?topics.map(t=>t.id):[state.mode==='document'?'__document':state.article];
  }
  function focusIndex() { return clamp(Math.round(state.progress),0,ids().length-1); }
  function focusId() { return ids()[focusIndex()]; }
  function snapshot() {
    const body=articleNodes.get(state.mode==='document'?'__document':state.article)?.querySelector('.chapter.active .chapter-body'),restore=body&&bodyRestores.get(body);
    return {...state,bodyScroll:restore?.token===generation&&restore.revision===inputRevision?restore.top:body?.scrollTop??0};
  }
  function hash() {
    if(state.mode==='timeline')return paths.timeline+(state.progress>0?`?month=${byId.get(focusId()).date.slice(0,7)}&item=${focusId()}`:'');
    if(state.mode==='month')return `${paths.timeline}?month=${state.month}&item=${focusId()}`;
    if(state.mode==='related')return `${byId.get(state.origin).url}?related=${focusId()}`;
    if(state.mode==='feed')return state.path+(state.progress>0?`?item=${focusId()}`:'');
    if(state.mode==='topics')return paths.topics+(state.progress>0?`?topic=${focusId()}`:'');
    return (state.mode==='document'?(state.documentPath??config.path):byId.get(state.article).url)+(state.fragment?`#${encodeURIComponent(state.fragment)}`:'');
  }
  function remember() { history.replaceState({spatial:snapshot()},'',hash()); }

  for(const m of months) {
    const node=document.createElement('article');node.className='paper month-paper';node.dataset.month=m.id;
    node.innerHTML=`<div class="month-inner"><h2 class="month-heading"><span class="month-year">${m.id.slice(0,4)}</span><span class="month-number">${config.locale==='ja'?`${Number(m.id.slice(5))}月`:monthLabel(m.id).split(' ')[0]}</span><span class="month-count">${copy.articles(m.articles.length)}</span></h2></div>`;
    document.getElementById('month-space').append(node);monthNodes.set(m.id,node);
    const button=document.createElement('button');button.className='rail-month';button.dataset.openMonth=m.id;
    button.setAttribute('aria-label',monthLabel(m.id));button.innerHTML=config.locale==='ja'?`<span class="rail-year">${m.id.slice(0,4)}</span><span>${m.id.slice(5)}月</span>`:esc(monthLabel(m.id));
    rail.append(button);
  }
  for(const a of articles) {
    const node=document.createElement('article');node.className='paper article-paper';node.dataset.article=a.id;
    node.innerHTML=`<header class="paper-head"><div class="paper-meta"><span class="paper-category">${esc(a.category)}</span><span class="relation-label"></span><time datetime="${a.date}" title="${copy.research}">${date(a.date)}</time></div><h2 class="article-title"><a class="title-open" data-read="${a.id}" href="${a.url}">${esc(a.title)}</a></h2></header><div class="paper-preview"><p class="preview-copy">${esc(a.teaser)}</p><div class="paper-tags">${a.tags.slice(0,4).map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="preview-actions"><span>${copy.sources(a.sourceCount)}</span><a class="read-button" data-read="${a.id}" href="${a.url}">${copy.read} <span aria-hidden="true">↗</span></a></div></div><div class="read-pane"></div>`;
    document.getElementById('article-space').append(node);articleNodes.set(a.id,node);
  }
  const topicOverview=document.createElement('section');topicOverview.className='topics-overview';topicOverview.hidden=true;
  topicOverview.innerHTML=`<h2 class="topics-heading">${copy.topics}</h2><div class="topics-layout"><nav class="topic-selector" aria-label="${copy.topics}">${topics.map(t=>`<button data-select-topic="${t.id}" aria-pressed="false"><span class="topic-symbol" aria-hidden="true">${{'ai-agents':'◈','ai-strategy':'▥','ai-workflows':'⌘','on-device-ai':'▣','agentic-commerce':'◇','ai-security':'⬡','ai-research':'◫'}[t.id]??'◈'}</span><span>${esc(t.title)}</span></button>`).join('')}</nav><section class="topic-results" aria-label="${copy.topics}"></section></div>`;
  workspace.append(topicOverview);let shownTopic='';
  function drawTopics(){
    const t=topics[focusIndex()],results=topicOverview.querySelector('.topic-results');
    topicOverview.querySelectorAll('[data-select-topic]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.selectTopic===t.id)));
    if(shownTopic===t.id)return;shownTopic=t.id;
    const recent=t.articles.map(id=>byId.get(id)).filter(Boolean).sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id)).slice(0,4);
    results.setAttribute('aria-label',t.title);
    const imageUrl=new URL('../topic-flow.webp',new URL(config.catalog,location.href));
    results.innerHTML=`<div class="topic-results-heading"><h2>${esc(t.title)}</h2><a data-open-topic="${t.id}" href="${t.url}">${copy.theme} ↗</a></div><div class="topic-articles">${recent.map((a,i)=>`<article class="topic-article ${i===0?'is-featured':''}" style="--peek:${i}"><a data-read="${a.id}" href="${a.url}" class="topic-article-link"><img src="${/workflows|crm|security|commerce/.test(a.id)?new URL('topic-execution.webp',imageUrl):imageUrl}" alt="" width="480" height="320" style="object-position:${i%2?'80%':'25%'} center"/><div class="topic-article-copy"><time datetime="${a.date}">${date(a.date)}</time><h3>${esc(a.title)}</h3>${i===0?`<p>${esc(a.teaser)}</p><span class="topic-read">${copy.read} ↗</span>`:''}</div></a></article>`).join('')}</div>`;
    if(!reduced.matches)results.querySelectorAll('.topic-article').forEach((node,i)=>node.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,delay:i*35,easing:'ease-out'}));
  }
  let documentKey='';
  function installDocument(body,title,key) {
    if(documentKey===key)return;
    documentKey=key;byId.set('__document',{id:'__document',title,body});
    let node=articleNodes.get('__document');
    if(!node){node=document.createElement('article');node.className='paper article-paper document-paper';document.getElementById('article-space').append(node);articleNodes.set('__document',node);}
    node.innerHTML=`<header class="paper-head"><h1 class="article-title">${esc(title)}</h1></header><div class="read-pane"></div>`;
  }
  if(config.mode==='document')installDocument(documentBody,config.title,config.path);
  function installGuide(record,path) {
    const doc=new DOMParser().parseFromString(record.main,'text/html'),guide=doc.querySelector('.topic-guide');
    if(!guide)throw new Error('Missing topic guide');
    const title=guide.querySelector('h2').textContent;
    let body=`<section id="topic-guide"><h2>${esc(guide.querySelector('.section-kicker').textContent)}</h2>${guide.querySelector('.panel-copy').outerHTML}</section>`;
    guide.querySelectorAll('.comparison-card').forEach((card,i)=>{const heading=card.querySelector('h3');const title=heading.textContent;heading.remove();body+=`<section id="topic-guide-${i+2}"><h2>${esc(title)}</h2>${card.innerHTML}</section>`;});
    installDocument(body,title,path+'#topic-guide');
  }

  function buildReader(id) {
    const node=articleNodes.get(id),pane=node.querySelector('.read-pane');
    if(pane.dataset.built)return;
    const a=byId.get(id),payload=payloads.get(id),doc=new DOMParser().parseFromString(id==='__document'?a.body:payload.body,'text/html');
    const sections=[...doc.body.children].filter(el=>el.matches('section'));
    pane.innerHTML=`<div class="reader-toolbar"><button data-action="toc" aria-pressed="false">${copy.toc}</button>${id==='__document'?'':`<button data-action="copy" aria-label="${copy.copy}" title="${copy.copy}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 5H5v12"/></svg></button><button data-action="share" ${typeof navigator.share==='function'?'':'hidden'}>${copy.share}</button><button data-action="related">${copy.related} <span aria-hidden="true">↗</span></button>`}</div><div class="chapter-list" aria-label="${copy.chapter}"></div>`;
    const list=pane.querySelector('.chapter-list');
    sections.forEach((source,i)=>{
      const heading=source.querySelector('h2')??source.querySelector('h3,.section-kicker'),name=heading?.textContent.trim()??config.title;
      const fragment=heading?.id||source.id||`section-${i+1}`;heading?.remove();
      const section=document.createElement('section');section.className='chapter';section.dataset.chapter=i;
      section.dataset.fragment=fragment;section.id=fragment;
      section.innerHTML=`<h3><button class="chapter-toggle" data-chapter="${i}" aria-expanded="false"><span class="chapter-number">${String(i+1).padStart(2,'0')}</span><span class="chapter-name">${esc(name)}</span></button></h3><div class="chapter-body" tabindex="0" role="region" aria-label="${esc(name)}">${source.innerHTML}</div>`;
      list.append(section);
    });
    if(id!=='__document') {
      const full=new DOMParser().parseFromString(payload.html,'text/html'),evidence=full.querySelector('.reading-evidence');
      const source=document.createElement('section');source.className='chapter evidence-chapter';source.dataset.chapter=sections.length;source.dataset.fragment='sources';source.id='sources';
      source.innerHTML=`<h3><button class="chapter-toggle" data-chapter="${sections.length}" aria-expanded="false"><span class="chapter-number">${String(sections.length+1).padStart(2,'0')}</span><span class="chapter-name">${copy.evidence}</span></button></h3><div class="chapter-body" tabindex="0" role="region" aria-label="${copy.evidence}">${full.querySelector('.reading-header .meta-row')?.outerHTML??''}${full.querySelector('.reading-duration')?.outerHTML??''}${[...evidence?.children??[]].filter(el=>el.tagName!=='SUMMARY').map(el=>el.outerHTML).join('')}</div>`;
      list.append(source);
    }
    pane.querySelectorAll('.evidence-chapter .panel-block > div:first-child').forEach(el=>el.className='evidence-heading');
    pane.querySelectorAll('.chapter-body').forEach(body=>{
      const content=document.createElement('div');content.className='chapter-content';content.append(...body.childNodes);body.append(content);
      const preview=document.createElement('p');preview.className='chapter-preview';preview.setAttribute('aria-hidden','true');
      preview.textContent=(content.querySelector('p')?.textContent??'').trim().slice(0,180);body.before(preview);
    });
    const names=new Map();pane.querySelectorAll('[id]').forEach(el=>{names.set(el.id,`${id}--${el.id}`);el.id=names.get(el.id);});
    pane.querySelectorAll('*').forEach(el=>{
      for(const attr of ['href','xlink:href','aria-labelledby','aria-describedby','aria-controls','for','fill','stroke','filter','clip-path','mask','style']) {
        const value=el.getAttribute(attr);if(!value)continue;
        const next=attr.startsWith('aria-')||attr==='for'?value.split(/\s+/).map(id=>names.get(id)??id).join(' '):value.startsWith('#')&&names.has(value.slice(1))?`#${names.get(value.slice(1))}`:value.replace(/url\(#([^)]*)\)/g,(m,id)=>names.has(id)?`url(#${names.get(id)})`:m);
        el.setAttribute(attr,next);
      }
    });
    pane.dataset.built='true';
    readerObservers.get(node)?.disconnect();
    const observer=new ResizeObserver(queueReaderLayout);observer.observe(list);readerObservers.set(node,observer);
  }
  function chapters() {
    const id=state.mode==='document'?'__document':state.article,node=articleNodes.get(id);buildReader(id);
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
    const foldHeight=innerHeight<540?'36px':'48px';
    list.style.setProperty('--prev-height',state.chapter>0&&!short?foldHeight:'0px');
    list.style.setProperty('--next-height',state.chapter<all.length-1?foldHeight:'0px');
    queueReaderLayout();
  }

  function queueReaderLayout(){
    if(readerLayoutFrame)return;
    readerLayoutFrame=requestAnimationFrame(()=>{
      readerLayoutFrame=0;
      const node=app.querySelector('.reading');if(!node||state.toc)return;
      const list=node.querySelector('.chapter-list'),active=list.querySelector('.chapter.active'),body=active.querySelector('.chapter-body');
      const heading=active.querySelector('h3').offsetHeight,fold=innerHeight<540?36:48;
      const previous=active.previousElementSibling&&workspace.clientHeight>=620?fold:0;
      const next=active.nextElementSibling?(list.clientHeight-previous-heading>=200?104:fold):0;
      const natural=body.querySelector('.chapter-content').offsetHeight+parseFloat(getComputedStyle(body).paddingTop)+parseFloat(getComputedStyle(body).paddingBottom);
      list.style.setProperty('--prev-height',`${previous}px`);list.style.setProperty('--next-height',`${next}px`);
      list.style.setProperty('--active-height',`${Math.min(heading+Math.max(96,natural),Math.max(heading,list.clientHeight-previous-next))}px`);
      list.dataset.preview=String(next>fold);
    });
  }

  const chapterPull={energy:0,direction:0,target:null,body:null,list:null,timer:0,release:0,locked:false,lastWheel:0,lockUntil:0};
  let chapterTouch=null;
  function resetChapterPull(animate=false){
    clearTimeout(chapterPull.timer);clearTimeout(chapterPull.release);
    const {target,body}=chapterPull;
    if(target){
      const transform=target.style.transform;
      if(animate&&!reduced.matches&&transform)target.animate([{transform},{transform:'translateY(0)'}],{duration:110,easing:'ease-out'});
      target.style.transform='';
      if(animate)chapterPull.release=setTimeout(()=>target.classList.remove('pull-previous'),110);else target.classList.remove('pull-previous');
    }
    if(body){
      const transform=body.style.transform;
      if(animate&&!reduced.matches&&transform)body.animate([{transform},{transform:'translateY(0)'}],{duration:110,easing:'ease-out'});
      body.style.transform='';
    }
    chapterPull.energy=0;chapterPull.direction=0;chapterPull.target=null;chapterPull.body=null;chapterPull.list=null;
  }
  function readerInput(event){
    if(!['read','document'].includes(state.mode)||state.toc||menu.open)return null;
    const list=event.target.closest?.('.chapter-list');if(!list||!list.closest('.reading'))return null;
    const body=list.querySelector('.chapter.active .chapter-body');
    return {list,body,max:Math.max(0,body.scrollHeight-body.clientHeight)};
  }
  function canReadScroll(body,max,direction){return direction>0?body.scrollTop<max-2:body.scrollTop>2;}
  function nestedScroll(event,body,direction){
    for(let el=event.target;el&&el!==body&&body.contains(el);el=el.parentElement){
      if(el.scrollHeight>el.clientHeight+2&&/auto|scroll/.test(getComputedStyle(el).overflowY)&&canReadScroll(el,el.scrollHeight-el.clientHeight,direction))return true;
    }
    return false;
  }
  function paintChapterPull(input,delta,kind,eligible=true){
    const direction=Math.sign(delta),active=input.list.querySelector('.chapter.active');
    const target=direction>0?active.nextElementSibling:active.previousElementSibling;
    if(!target){resetChapterPull(true);return;}
    if(chapterPull.direction&&chapterPull.direction!==direction)resetChapterPull();
    clearTimeout(chapterPull.timer);clearTimeout(chapterPull.release);
    app.querySelectorAll('.pull-previous').forEach(el=>el.classList.remove('pull-previous'));
    chapterPull.direction=direction;chapterPull.target=target;chapterPull.body=input.body;chapterPull.list=input.list;
    chapterPull.energy+=Math.min(Math.abs(delta),kind==='wheel'?48:60);
    const threshold=kind==='wheel'?90:60;
    const progress=clamp(chapterPull.energy/threshold);
    if(!reduced.matches){
      if(direction<0)target.classList.add('pull-previous');
      const distance=16*(1-Math.exp(-progress*1.6));
      target.style.transform=`translateY(${-direction*distance}px)`;
      input.body.style.transform=`translateY(${-direction*distance*.18}px)`;
    }
    if(eligible&&progress>=1){
      resetChapterPull();
      selectChapter(state.chapter+direction,undefined,{direction});
      chapterPull.locked=true;chapterPull.lastWheel=performance.now();chapterPull.lockUntil=performance.now()+420;
      if(chapterTouch)chapterTouch.committed=true;
    }else if(kind==='wheel')chapterPull.timer=setTimeout(()=>resetChapterPull(true),200);
  }

  app.addEventListener('wheel',event=>{
    const input=readerInput(event);if(!input||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    const now=performance.now();
    if(chapterPull.locked){
      if(now<chapterPull.lockUntil||now-chapterPull.lastWheel<240){chapterPull.lastWheel=now;event.preventDefault();return;}
      chapterPull.locked=false;
    }
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?input.body.clientHeight:1);if(!delta)return;
    const direction=Math.sign(delta);
    if(nestedScroll(event,input.body,direction))return;
    if(canReadScroll(input.body,input.max,direction)){
      resetChapterPull();
      if(!input.body.contains(event.target)){input.body.scrollTop+=delta;event.preventDefault();}
      return;
    }
    event.preventDefault();paintChapterPull(input,delta,'wheel');
  },{passive:false});
  app.addEventListener('touchstart',event=>{
    resetChapterPull();chapterTouch=null;
    const input=readerInput(event);if(!input||event.touches.length!==1)return;
    const touch=event.touches[0];chapterTouch={x:touch.clientX,y:touch.clientY,lastY:touch.clientY,top:input.body.scrollTop<=2,end:input.body.scrollTop>=input.max-2,committed:false};
  },{passive:true});
  app.addEventListener('touchmove',event=>{
    const input=readerInput(event);if(!input||!chapterTouch||event.touches.length!==1)return;
    const touch=event.touches[0],delta=chapterTouch.lastY-touch.clientY;chapterTouch.lastY=touch.clientY;
    if(Math.abs(touch.clientX-chapterTouch.x)>Math.abs(touch.clientY-chapterTouch.y)||Math.abs(touch.clientY-chapterTouch.y)<6)return;
    if(chapterTouch.committed){event.preventDefault();return;}
    const direction=Math.sign(delta);if(!direction||nestedScroll(event,input.body,direction))return;
    if(canReadScroll(input.body,input.max,direction)){
      resetChapterPull();
      if(!input.body.contains(event.target)){input.body.scrollTop+=delta;event.preventDefault();}
      return;
    }
    event.preventDefault();paintChapterPull(input,delta,'touch',direction>0?chapterTouch.end:chapterTouch.top);
  },{passive:false});
  const finishChapterTouch=()=>{resetChapterPull(true);chapterTouch=null;};
  app.addEventListener('touchend',finishChapterTouch,{passive:true});app.addEventListener('touchcancel',finishChapterTouch,{passive:true});

  function crumb(text,action,extra='') {return `<button data-action="${action}" ${extra}>${esc(text)}</button>`;}
  function updateChrome() {
    const a=state.mode==='read'?byId.get(state.article):state.mode==='related'?byId.get(state.origin):null;
    let html=state.mode==='feed'?`<a href="${state.topic?paths.topics:paths.home}">${state.topic?copy.topics:copy.home}</a>${state.topic?`<span class="crumb-separator">›</span><span>${esc(state.topic)}</span>`:''}`:state.mode==='topics'?`<span>${copy.topics}</span>`:state.mode==='document'?`<a href="${paths.home}">${copy.home}</a><span class="crumb-separator">›</span><span class="crumb-title">${esc(byId.get('__document').title)}</span>`:crumb(copy.home,'timeline');
    if(state.mode==='feed'&&state.topic&&topics.find(t=>t.title===state.topic)?.guide)html+=`<button class="guide-open" data-action="guide">${copy.guide}</button>`;
    if(['month','read','related'].includes(state.mode))html+=`<span class="crumb-separator" aria-hidden="true">›</span>${crumb(monthLabel(a?a.date.slice(0,7):state.month),'month')}`;
    if(state.mode==='read')html+=`<span class="crumb-separator" aria-hidden="true">›</span><span aria-current="page">${copy.body}</span>`;
    if(state.mode==='related')html+=`<span class="crumb-separator" aria-hidden="true">›</span><span aria-current="page">${copy.related}</span>`;
    if(state.mode==='feed'&&!state.topic&&state.path!==paths.home) {
      const page=catalog.pages.findIndex(p=>p.url===state.path);
      html+=`<span class="spatial-pagination">${page>0?`<a href="${catalog.pages[page-1].url}" aria-label="${copy.previous}">←</a>`:''}${page>=0&&page<catalog.pages.length-1?`<a href="${catalog.pages[page+1].url}" aria-label="${copy.next}">→</a>`:''}</span>`;
    }
    if(crumbs.innerHTML!==html)crumbs.innerHTML=html;
    app.querySelector('.back-button').hidden=['timeline','topics'].includes(state.mode)||(state.mode==='feed'&&!state.topic&&state.depth===0);
    const current=['timeline','feed','month'].includes(state.mode)?byId.get(focusId()).date.slice(0,7):(a?a.date.slice(0,7):state.month);
    for(const button of rail.children) {
      if(button.dataset.openMonth===current)button.setAttribute('aria-current','date');else button.removeAttribute('aria-current');
    }
    if(current!==lastRail){
      const active=rail.querySelector('[aria-current]');
      if(active){if(innerWidth<760)rail.scrollTo({left:active.offsetLeft-rail.clientWidth/2+active.clientWidth/2,behavior:'instant'});else if(active.offsetTop<rail.scrollTop||active.offsetTop>rail.scrollTop+rail.clientHeight-30)rail.scrollTop=active.offsetTop-rail.clientHeight/2;}
      lastRail=current;
    }
    const label=state.mode==='topics'?topics.find(t=>t.id===focusId()).title:state.mode==='document'?byId.get('__document').title:state.mode==='related'?`${relation(a,byId.get(focusId()))} · ${byId.get(focusId()).title}`:byId.get(focusId()).title;
    if(label!==announced){announcement.textContent=label;announced=label;}
    const doc=state.mode==='document';rail.hidden=doc||state.mode==='topics';
    const heading=app.querySelector('#workspace-heading');
    heading.hidden=doc||state.mode==='read';
    heading.textContent=state.mode==='timeline'?copy.home:state.mode==='topics'?copy.topics:state.mode==='feed'?(state.topic??copy.home):config.title;
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
    node.style.setProperty('--spatial-fold',String(p.fold??0));
    node.style.visibility=visible?'visible':'hidden';
    node.dataset.front=String(!!p.front);node.dataset.folded=String((p.fold??0)>.8);node.inert=!visible;
    node.querySelectorAll('.paper-preview,.month-description,.month-open').forEach(el=>el.inert=!visible||(p.fold??0)>.8);
    node.setAttribute('aria-hidden',String(!visible));
    node.style.pointerEvents=visible?'auto':'none';
  }
  const mix=(a,b,t)=>Object.fromEntries(Object.keys(a).map(k=>[k,typeof a[k]==='number'?a[k]+(b[k]-a[k])*t:t>.5?b[k]:a[k]]));

  function draw() {
    frame=0;
    pendingPoses.clear();
    const w=workspace.clientWidth,h=workspace.clientHeight,mobile=w<760||innerHeight<540,compact=h<420;
    const ay=compact?42:72, aw=Math.min(mobile?w-32:740,w-40), ax=(w-aw)/2;
    const ah=compact?Math.max(180,h-116):Math.min(mobile?440:420,h-160);
    const p=reduced.matches?Math.round(state.progress):state.progress,index=Math.floor(p),q=ease(clamp((p-index-.15)/.7));
    const activeIndex=clamp(Math.round(p),0,ids().length-1);
    const foldedTop={x:ax+12,y:2,w:aw-24,h:compact?36:64,scale:.95,rx:9,fold:1,opacity:.76};
    const foldedBottom={x:ax+12,y:h-(compact?40:68),w:aw-24,h:compact?36:64,scale:.95,rx:-9,fold:1,opacity:.82};
    const front={x:ax,y:ay,w:aw,h:Math.max(compact?180:260,ah),scale:1,rx:0,fold:0,opacity:1};
    for(const node of monthNodes.values())pose(node,{x:ax,y:0,w:aw,h:compact?28:40,opacity:0,fold:0});
    topicOverview.hidden=state.mode!=='topics';
    for(const node of articleNodes.values()){
      node.classList.remove('reading');node.removeAttribute('data-relation');
      const title=node.querySelector('.article-title'),tag=(state.mode==='read'&&node.dataset.article===state.article)||(state.mode==='document'&&node.classList.contains('document-paper'))?'H1':'H2';
      if(title.tagName!==tag){const next=document.createElement(tag);next.className=title.className;next.append(...title.childNodes);title.replaceWith(next);}
      pose(node,{x:ax,y:h+70,w:aw,h:64,opacity:0,fold:1});
    }
    document.getElementById('relations').innerHTML='';
    if(state.mode==='timeline') {
      // Months divide a single article stream; they are never a selection gate.
      const list=ids(),currentMonth=byId.get(list[activeIndex]).date.slice(0,7);
      pose(monthNodes.get(currentMonth),{x:ax,y:0,w:aw,h:compact?28:40,opacity:1,fold:0,z:130});
      const tf={...front,y:compact?44:92,h:Math.max(compact?160:240,Math.min(ah,h-(compact?94:184)))};
      const tt={...foldedTop,y:compact?30:46,h:compact?28:40};
      for(let i=Math.max(0,index-1);i<=Math.min(list.length-1,index+2);i++){
        const pos=i===index?mix(tf,tt,q):i===index+1?mix(foldedBottom,tf,q):i===index+2?{...foldedBottom,opacity:foldedBottom.opacity*q**4}:{...tt,opacity:compact?0:tt.opacity*(1-q)**4};
        pose(articleNodes.get(list[i]),{...pos,z:i===activeIndex?100:40-i,front:i===activeIndex});
      }
    } else if(state.mode==='month'||state.mode==='feed') {
      const list=ids();
      for(let i=Math.max(0,index-1);i<=Math.min(list.length-1,index+1);i++){
        let pos=i===index?mix(front,foldedTop,q):i===index+1?mix(foldedBottom,front,q):{...foldedTop,opacity:foldedTop.opacity*(1-q)**4};
        pose(articleNodes.get(list[i]),{...pos,z:i===activeIndex?100:40-i,front:i===activeIndex});
      }
    } else if(state.mode==='read') {
      const node=articleNodes.get(state.article);node.classList.add('reading');chapters();
      const rw=mobile?w-32:Math.min(780,w-310),rx=mobile?16:Math.max(0,(w-rw-260)/2);
      const rh=mobile?h-(compact?50:78):h-32;
      pose(node,{x:rx,y:mobile?6:12,w:rw,h:rh,opacity:1,scale:1,fold:0,z:120,front:true});
      const related=relatedTo(state.article);
      related.slice(0,mobile?1:3).forEach((id,i)=>{
        const other=articleNodes.get(id);other.dataset.relation=relation(byId.get(state.article),byId.get(id));other.querySelector('.relation-label').textContent=other.dataset.relation;
        pose(other,{x:mobile?24:rx+rw+28+i*5,y:mobile?h-(compact?40:64):82+i*94,w:mobile?w-48:Math.max(225,w-rx-rw-48),h:mobile?(compact?36:60):82,scale:1,rx:mobile?-3:0,fold:1,opacity:.9-i*.08,z:80-i});
      });
    } else if(state.mode==='document') {
      const node=articleNodes.get('__document');node.classList.add('reading');chapters();
      const width=Math.min(900,w-32);pose(node,{x:(w-width)/2,y:6,w:width,h:h-16,opacity:1,z:120,front:true});
    } else if(state.mode==='topics') {
      drawTopics();
    } else if(state.mode==='related') {
      const list=relatedTo(state.origin),source=articleNodes.get(state.origin),cx=mobile?16:Math.max(360,w*.4),cw=mobile?w-32:Math.min(640,w-cx-20);
      const rf={...front,x:cx,w:cw,y:compact?46:mobile?90:86,h:compact?Math.max(180,h-92):Math.max(260,Math.min(420,h-175))};
      const rt={...foldedTop,x:cx+12,w:cw-24,y:mobile?82:12};
      const rb={...foldedBottom,x:cx+12,w:cw-24};
      pose(source,{x:mobile?16:20,y:mobile?0:76,w:mobile?w-32:Math.min(310,cx-40),h:compact?36:mobile?68:108,scale:1,fold:1,opacity:.75,z:40});
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
    const distance=['read','document','topics'].includes(state.mode)?0:Math.max(0,ids().length-1)*step;
    document.body.classList.toggle('read-mode',['read','document'].includes(state.mode));
    document.body.classList.toggle('document-mode',state.mode==='document');
    document.body.classList.toggle('topics-mode',state.mode==='topics');
    track.style.height=`${innerHeight+distance}px`;
    ignoreScroll=true;configuredY=state.mode==='topics'?0:clamp(p,0,ids().length-1)*step;scrollTo({top:configuredY,behavior:'instant'});
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ignoreScroll=false;}));
  }
  const status=app.querySelector('.workspace-status'),menu=app.querySelector('.spatial-menu');
  let retryNavigation=null,statusTimer;
  function message(text,{error=false}={}) {
    clearTimeout(statusTimer);status.hidden=!text;
    status.classList.toggle('is-error',error);
    status.innerHTML=error?`${esc(text)} <button data-action="retry">${copy.retry}</button>`:esc(text);
  }
  function fragmentChapter(id,fragment,fallbackIndex=0) {
    buildReader(id);const node=articleNodes.get(id),all=[...node.querySelectorAll('.chapter')];
    const target=all.findIndex(el=>el.dataset.fragment===fragment||[...el.querySelectorAll('[id]')].some(n=>n.id===`${id}--${fragment}`));
    return clamp(target<0?fallbackIndex:target,0,all.length-1);
  }
  function statePath(value) {
    if(value.mode==='read'||value.mode==='related')return byId.get(value.mode==='read'?value.article:value.origin).url;
    return value.mode==='timeline'||value.mode==='month'?paths.timeline:value.mode==='topics'?paths.topics:value.mode==='document'?(value.documentPath??config.path):value.path;
  }
  async function navigate(next,{push=true,animate=true,save=true,focus=true}={}) {
    resetChapterPull();chapterPull.locked=false;chapterTouch=null;
    clearTimeout(saveTimer);
    if(save)remember();
    const token=++generation;
    const proposed={...state,...next,toc:next.toc??false,bodyScroll:next.bodyScroll??0};
    app.setAttribute('aria-busy','true');message(copy.loading);
    try {
      let record;
      if(proposed.mode==='read'||proposed.mode==='related'){
        const payload=await ensureArticle(proposed.mode==='read'?proposed.article:proposed.origin);
        record={...payload.head,main:payload.html};
      } else {
        record=await pageRecord(statePath(proposed));
      }
      if(token!==generation)return;
      if(proposed.mode==='document'&&proposed.guide)installGuide(record,proposed.documentPath);
      state=proposed;state.depth+=push?1:0;
      if(state.mode==='feed'&&!state.topic&&state.path===paths.home)state.list=articles.map(a=>a.id);
      if(['read','document'].includes(state.mode))state.chapter=fragmentChapter(state.mode==='document'?'__document':state.article,state.fragment,state.chapter);
      state.progress=clamp(state.progress,0,ids().length-1);
      if(animate&&!reduced.matches){app.classList.add('switching');clearTimeout(switchTimer);switchTimer=setTimeout(()=>app.classList.remove('switching'),720);}
      configureScroll();draw();setHead(record);
      const current=articleNodes.get(state.mode==='document'?'__document':state.article);
      const body=current?.querySelector('.chapter.active .chapter-body');
      if(body&&['read','document'].includes(state.mode))restoreBody(body,state.bodyScroll);
      if(focus){const target=current?.classList.contains('reading')?current.querySelector('.article-title'):workspace;target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
      history[push?'pushState':'replaceState']({spatial:snapshot()},'',hash());
      message('');retryNavigation=null;
    }catch(error) {
      if(token!==generation)return;
      retryNavigation=()=>navigate(next,{push,animate,save:false,focus});
      message(copy.error,{error:true});
    }finally {if(token===generation)app.setAttribute('aria-busy','false');}
  }
  // A surface changes width while unfolding. Restore again after that reflow,
  // but never override a scroll or keyboard action performed by the reader.
  function restoreBody(body,top) {
    const record={top,token:generation,revision:inputRevision};bodyRestores.set(body,record);
    const apply=()=>{
      if(record.token!==generation||record.revision!==inputRevision||!body.closest('.reading')||!body.closest('.chapter').classList.contains('active'))return;
      body.scrollTop=top;return true;
    };
    apply();document.fonts.ready.then(()=>requestAnimationFrame(()=>{if(apply())remember();}));
    setTimeout(()=>{if(apply()){bodyRestores.delete(body);remember();}},app.classList.contains('switching')?740:0);
  }
  function openMonth(id) {return navigate({mode:'timeline',month:id,progress:monthStart(id),origin:null,fragment:''});}
  function openRead(id) {
    if(state.mode==='read'&&id===state.article)return;
    if(state.mode==='read'&&id!==state.article)return navigate({mode:'related',origin:state.article,progress:relatedTo(state.article).indexOf(id),fragment:''});
    const saved=readPositions.get(id);
    return navigate({mode:'read',article:id,month:byId.get(id).date.slice(0,7),chapter:saved?.chapter??0,bodyScroll:saved?.bodyScroll??0,fragment:saved?.fragment??'',progress:0});
  }
  function back() {
    if(state.toc){state.toc=false;draw();return;}
    if(state.depth>0){history.back();return;}
    if(state.mode==='related'){void openRead(state.origin);return;}
    if(state.mode==='document'){
      const parent=state.guide&&topics.find(t=>t.url===state.documentPath);
      if(parent)void navigate({mode:'feed',topic:parent.title,path:parent.url,list:parent.articles,progress:0,fragment:'',guide:false});
      else if(document.referrer&&new URL(document.referrer).origin===location.origin)history.back();else location.assign(paths.home);
      return;
    }
    const topic=topics.find(t=>t.title===byId.get(state.article)?.category);
    if(state.mode==='read'&&topic){void navigate({mode:'feed',topic:topic.title,list:topic.articles,path:topic.url,progress:0,fragment:''});return;}
    if(state.mode==='feed'&&state.topic){void navigate({mode:'topics',progress:topics.findIndex(t=>t.title===state.topic),fragment:''});return;}
    void navigate({mode:'timeline',progress:monthStart(state.month),fragment:''});
  }
  function seek(index) {if(state.mode==='topics'){state.progress=clamp(index,0,topics.length-1);draw();topicOverview.querySelector(`[data-select-topic="${focusId()}"]`).focus({preventScroll:true});remember();return;}scrollTo({top:clamp(index,0,ids().length-1)*step,behavior:reduced.matches?'instant':'smooth'});}

  app.addEventListener('click',event=>{
    if(event.defaultPrevented)return;
    const button=event.target.closest('button,a');
    if(!button){
      const card=event.target.closest('.article-paper[data-article]:not(.reading)');
      if(card&&!getSelection()?.toString())void openRead(card.dataset.article);
      return;
    }
    if(button.tagName==='A'&&(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||button.target||button.hasAttribute('download')))return;
    if(button.classList.contains('spatial-skip')){event.preventDefault();const target=app.querySelector('.reading .chapter.active .chapter-body')??workspace;target.focus({preventScroll:true});return;}
    if(button.dataset.openMonth){void openMonth(button.dataset.openMonth);return;}
    if(button.dataset.selectTopic){state.progress=topics.findIndex(t=>t.id===button.dataset.selectTopic);draw();remember();return;}
    if(button.dataset.openTopic){event.preventDefault();const topic=topics.find(t=>t.id===button.dataset.openTopic);void navigate({mode:'feed',topic:topic.title,list:topic.articles,path:topic.url,progress:0,fragment:''});return;}
    if(button.dataset.read){event.preventDefault();void openRead(button.dataset.read);return;}
    if(button.tagName==='A'&&button.getAttribute('href').startsWith('#')) {
      const id=state.mode==='document'?'__document':state.article;
      const fragment=decodeURIComponent(button.hash.slice(1)).replace(`${id}--`,'');
      const chapter=fragmentChapter(id,fragment,state.chapter);event.preventDefault();selectChapter(chapter,fragment);return;
    }
    if(button.dataset.chapter!==undefined){
      selectChapter(Number(button.dataset.chapter));return;
    }
    switch(button.dataset.action){
      case'timeline':void navigate({mode:'timeline',progress:state.mode==='timeline'?state.progress:monthStart(state.month),fragment:''});break;
      case'month':void openMonth(state.mode==='related'?byId.get(state.origin).date.slice(0,7):state.month);break;
      case'back':back();break;
      case'toc':resetChapterPull();state.toc=!state.toc;draw();break;
      case'related':void navigate({mode:'related',origin:state.article,progress:0,fragment:''});break;
      case'guide':void navigate({mode:'document',documentPath:state.path,guide:true,chapter:0,fragment:'topic-guide',progress:0});break;
      case'menu':menu.showModal();break;
      case'close-menu':menu.close();break;
      case'retry':void retryNavigation?.();break;
      case'copy':void share(false);break;
      case'share':void share(true);break;
    }
  });
  function selectChapter(chapter,fragment,{direction=0}={}) {
    resetChapterPull();
    ++inputRevision;
    const id=state.mode==='document'?'__document':state.article,node=articleNodes.get(id);
    state.chapter=chapter;state.toc=false;state.fragment=fragment??node.querySelector(`.chapter[data-chapter="${chapter}"]`).dataset.fragment;
    if(!direction)node.querySelector('.chapter-list').animate([{opacity:.25,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:reduced.matches?0:280,easing:'ease-out'});
    draw();
    const body=node.querySelector('.chapter.active .chapter-body');
    const target=fragment?document.getElementById(`${id}--${fragment}`):null;
    if(target&&body.contains(target))body.scrollTop+=target.getBoundingClientRect().top-body.getBoundingClientRect().top;
    if(direction){
      const selectedChapter=state.chapter,selectedGeneration=generation;
      requestAnimationFrame(()=>{
        if(generation!==selectedGeneration||state.chapter!==selectedChapter||!node.classList.contains('reading'))return;
        body.scrollTop=direction>0?0:body.scrollHeight;body.tabIndex=0;body.focus({preventScroll:true});
        if(!reduced.matches)body.animate([{opacity:.35,transform:`translateY(${direction*18}px)`},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});
        readPositions.set(id,{chapter:state.chapter,fragment:state.fragment,bodyScroll:body.scrollTop});remember();
      });
    }else node.querySelector('.chapter.active .chapter-toggle').focus({preventScroll:true});
    readPositions.set(id,{chapter:state.chapter,fragment:state.fragment,bodyScroll:body.scrollTop});remember();
  }
  async function share(native) {
    const a=byId.get(state.article),url=new URL(a.url,canonicalOrigin);url.hash=state.fragment;
    try {
      if(native&&navigator.share)await navigator.share({title:a.title,url:url.href});
      else {await navigator.clipboard.writeText(`${a.title}\n${url.href}`);message(copy.copied);statusTimer=setTimeout(()=>message(''),1800);}
    }catch(error){if(error.name!=='AbortError'){message(copy.copyError);statusTimer=setTimeout(()=>message(''),2500);}}
  }
  addEventListener('scroll',()=>{
    if(['read','document','topics'].includes(state.mode)||(ignoreScroll&&Math.abs(scrollY-configuredY)<1)||menu.open)return;
    ignoreScroll=false;
    app.classList.remove('switching');state.progress=clamp(scrollY/step,0,ids().length-1);schedule();
    clearTimeout(saveTimer);saveTimer=setTimeout(remember,160);
  },{passive:true});
  addEventListener('wheel',()=>{++inputRevision;app.classList.remove('switching');},{passive:true});
  addEventListener('touchmove',()=>{++inputRevision;},{passive:true});
  addEventListener('touchstart',()=>app.classList.remove('switching'),{passive:true});
  addEventListener('keydown',event=>{
    ++inputRevision;
    if(menu.open)return;
    if(event.key==='Escape'){event.preventDefault();back();return;}
    if(['read','document'].includes(state.mode))return;
    if(event.key==='ArrowDown'||event.key==='ArrowRight'){event.preventDefault();seek(focusIndex()+1);}
    if(event.key==='ArrowUp'||event.key==='ArrowLeft'){event.preventDefault();seek(focusIndex()-1);}
    if(event.key==='Enter'&&(event.target===document.body||event.target===workspace)){if(state.mode==='topics'){const topic=topics.find(t=>t.id===focusId());void navigate({mode:'feed',path:topic.url,topic:topic.title,list:topic.articles,progress:0});}else void openRead(focusId());}
  });
  let routePending='';
  async function applyHashRoute() {
    if(routePending===location.href||location.pathname+location.search+location.hash===hash())return;
    const target=location.href;routePending=target;
    try {
      let fragment;try{fragment=decodeURIComponent(location.hash.slice(1));}catch{fragment='';}
      const topic=topics.find(t=>t.url===location.pathname&&t.guide);
      if(topic&&fragment.startsWith('topic-guide')){
        await navigate({mode:'document',documentPath:topic.url,guide:true,fragment,chapter:0,progress:0,depth:state.depth+1},{push:false,save:false});
      }else if(['read','document'].includes(state.mode)&&location.pathname===statePath(state)){
        const id=state.mode==='document'?'__document':state.article;
        state.depth++;selectChapter(fragmentChapter(id,fragment),fragment);
      }else location.reload();
    }finally{if(routePending===target)routePending='';}
  }
  addEventListener('popstate',event=>{
    let fragment;try{fragment=decodeURIComponent(location.hash.slice(1));}catch{fragment='';}
    if(event.state?.spatial&&(event.state.spatial.fragment??'')===fragment){const target=location.href;routePending=target;void navigate(event.state.spatial,{push:false,save:false}).finally(()=>{if(routePending===target)routePending='';});}
    else void applyHashRoute();
  });
  addEventListener('hashchange',()=>void applyHashRoute());
  let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{configureScroll();draw();},80);});
  reduced.addEventListener('change',()=>{app.classList.remove('switching');draw();});

  const url=new URL(location.href),item=url.searchParams.get('item'),month=url.searchParams.get('month'),topic=url.searchParams.get('topic'),related=url.searchParams.get('related');
  if(config.mode==='timeline'){if(item&&byId.has(item)){state.progress=articles.findIndex(a=>a.id===item);state.month=byId.get(item).date.slice(0,7);}else if(monthById.has(month)){state.month=month;state.progress=monthStart(month);}}
  if(config.mode==='feed'&&state.list.includes(item))state.progress=state.list.indexOf(item);
  if(config.mode==='topics'&&topics.some(t=>t.id===topic))state.progress=topics.findIndex(t=>t.id===topic);
  if(config.mode==='read'){state.month=byId.get(config.article).date.slice(0,7);if(related&&relatedTo(config.article).includes(related)){state.mode='related';state.origin=config.article;state.progress=relatedTo(config.article).indexOf(related);}}
  try{state.fragment=decodeURIComponent(location.hash.slice(1));}catch{state.fragment='';}
  if(config.mode==='feed'&&config.topic&&state.fragment.startsWith('topic-guide'))state={...state,mode:'document',documentPath:config.path,guide:true};
  let saved=history.state?.spatial;
  try{if(!saved)saved=JSON.parse(sessionStorage.getItem(`ard-spatial:${location.href}`));}catch{}
  if(saved&&['timeline','month','read','related','feed','topics','document'].includes(saved.mode)&&byId.has(saved.article)&&(saved.fragment??'')===state.fragment&&statePath(saved)===url.pathname)state={...state,...saved};
  if(config.mode==='timeline'&&state.mode==='feed'&&!state.topic){state.mode='timeline';state.list=articles.map(a=>a.id);}
  if(config.mode==='timeline'&&['timeline','month'].includes(state.mode)&&(saved?.timelineVersion!==2||state.mode==='month')){
    state.mode='timeline';
    state.progress=item&&byId.has(item)?articles.findIndex(a=>a.id===item):monthById.has(month)?monthStart(month):0;
    state.timelineVersion=2;
  }
  if(state.mode==='feed'&&!state.topic&&state.path===paths.home)state.list=articles.map(a=>a.id);
  if(state.mode==='read'){await ensureArticle(state.article);state.chapter=fragmentChapter(state.article,state.fragment,state.chapter);}
  if(state.mode==='related')await ensureArticle(state.origin);
  if(state.mode==='document'){if(state.guide)installGuide(await pageRecord(state.documentPath),state.documentPath);state.chapter=fragmentChapter('__document',state.fragment,state.chapter);}
  document.body.classList.add('spatial-active');document.documentElement.classList.add('spatial-active');fallback.inert=true;fallback.setAttribute('aria-hidden','true');
  configureScroll();draw();app.style.visibility='visible';
  document.getElementById('spatial-startup').hidden=true;dispatchEvent(new Event('spatial-ready'));
  const initialBody=app.querySelector('.reading .chapter.active .chapter-body');if(initialBody)restoreBody(initialBody,state.bodyScroll??0);
  remember();
  app.addEventListener('scroll',event=>{
    if(!event.target.matches?.('.chapter-body'))return;
    const id=state.mode==='document'?'__document':state.article;
    if(event.target.closest('.reading')!==articleNodes.get(id)||!event.target.closest('.chapter').classList.contains('active'))return;
    readPositions.set(id,{chapter:state.chapter,fragment:state.fragment,bodyScroll:event.target.scrollTop});
    clearTimeout(saveTimer);saveTimer=setTimeout(remember,160);
  },{capture:true,passive:true});
  addEventListener('pagehide',()=>{++generation;clearTimeout(saveTimer);remember();try{sessionStorage.setItem(`ard-spatial:${location.href}`,JSON.stringify(snapshot()));}catch{}});
  addEventListener('pageshow',event=>{if(event.persisted){app.setAttribute('aria-busy','false');message('');configureScroll();draw();}});
  const closedForPrint=[];
  addEventListener('beforeprint',()=>fallbackMain.querySelectorAll('details:not([open])').forEach(el=>{closedForPrint.push(el);el.open=true;}));
  addEventListener('afterprint',()=>{closedForPrint.splice(0).forEach(el=>el.open=false);});
  document.fonts.ready.then(()=>{configureScroll();draw();});
  window.spatialSite={getState:()=>({...snapshot(),focus:focusId(),step,months:months.length,articles:articles.length,reduced:reduced.matches})};
}
