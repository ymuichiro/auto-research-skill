import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import {serveBuild} from './lib/test-server.mjs';

const server=await serveBuild(),out='output/spatial-site';
await mkdir(out,{recursive:true});
const results=[];
const catalogs=Object.fromEntries(await Promise.all(['ja','en'].map(async locale=>[locale,JSON.parse(await readFile(`public/assets/spatial/${locale}.json`,'utf8'))])));
const getState=page=>page.evaluate(()=>window.spatialSite.getState());
const waitMode=(page,mode)=>page.waitForFunction(mode=>window.spatialSite?.getState().mode===mode&&document.getElementById('spatial-app')?.getAttribute('aria-busy')!=='true',mode);
const settled=page=>page.waitForTimeout(750);
async function ready(page,url){await page.goto(url);await page.waitForFunction(()=>window.spatialSite);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(100);}
async function geometry(page,selector){return page.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};});}
async function swipe(page,selector,dy){
  const box=await page.locator(selector).boundingBox(),cdp=await page.context().newCDPSession(page);
  const x=box.x+box.width*.6,y=box.y+box.height*.72;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-dy*i/12}]});await page.waitForTimeout(20);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(800);await cdp.detach();
}
async function journey(engine,locale,viewport){
  const name=`${engine.name()}-${locale}-${viewport.width}`,catalog=catalogs[locale],checks=[],errors=[];
  const browser=await engine.launch(),mobile=viewport.width<760;
  const record=process.env.SPATIAL_RECORD==='1'&&engine===chromium&&locale==='ja';
  const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,
    ...(record?{recordVideo:{dir:`${out}/videos`,size:viewport}}:{})});
  await context.addInitScript(()=>{
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.testCopied=text;}}});
    Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.testShared=data;}});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const check=(label,value=true)=>{assert.ok(value,`${name}: ${label}`);checks.push(label);};
  try{
    await ready(page,server.base+catalog.paths.timeline);await settled(page);
    await page.screenshot({path:`${out}/${name}-timeline.png`});
    const workspace=await geometry(page,'#workspace'),first=(await getState(page)).focus,selector=`[data-article="${first}"]`;
    check('month is a thin divider',(await geometry(page,'.month-paper:not([aria-hidden=true])')).h<=40);
    check('first article opens without selecting a month',await page.locator('.article-paper[data-front=true] .paper-preview').isVisible());
    const before=await geometry(page,selector);
    if(mobile&&engine===chromium)await swipe(page,'#workspace',125);
    else if(mobile){await page.keyboard.press('ArrowDown');await settled(page);}
    else {await page.mouse.move(viewport.width*.6,viewport.height*.5);await page.mouse.wheel(0,200);await page.waitForTimeout(350);}
    await page.waitForFunction(({selector,height})=>Math.abs(document.querySelector(selector).getBoundingClientRect().height-height)>3,{selector,height:before.h});
    check('native input changes timeline geometry',Math.abs((await geometry(page,selector)).h-before.h)>3);
    assert.deepEqual(await geometry(page,'#workspace'),workspace);check('workspace remains fixed');
    const step=(await getState(page)).step;
    const seekExact=async progress=>{
      await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),step*progress);
      await page.waitForFunction(p=>Math.abs(Number(document.getElementById('spatial-app').dataset.progress)-p)<.002,progress);
    };
    await seekExact(.4);
    const at40=await geometry(page,selector);await page.waitForTimeout(300);assert.deepEqual(await geometry(page,selector),at40);check('scroll stops animation');
    await seekExact(.75);
    await seekExact(.4);
    assert.deepEqual(await geometry(page,selector),at40);check('reverse restores exact geometry');
    await seekExact(0);
    const id=(await getState(page)).focus,article=catalog.articles.find(a=>a.id===id);
    await page.evaluate(id=>{window.originalSurface=document.querySelector(`#spatial-app [data-article="${id}"]`);},id);
    // Sample in the browser: WebKit on a busy CI runner may finish the
    // transition before the first geometry request reaches it over the wire.
    await page.evaluate(()=>{
      window.testOpeningFrames=[];const started=performance.now();let opened;
      function sample(){
        const node=document.querySelector('#spatial-app .reading');
        if(node){opened??=performance.now();const r=node.getBoundingClientRect();window.testOpeningFrames.push({h:r.height,y:r.y});}
        if(performance.now()-started<6000&&(!opened||performance.now()-opened<850))requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    // The whole card, including whitespace, opens the article.
    await page.locator('.article-paper[data-front=true]').click({position:{x:25,y:200}});await waitMode(page,'read');
    await settled(page);
    const opening=await page.evaluate(()=>window.testOpeningFrames);
    check('article unfolds through intermediate geometry',opening.length>2&&['h','y'].some(key=>Math.max(...opening.map(r=>r[key]))-Math.min(...opening.map(r=>r[key]))>2));
    check('same article surface opens',await page.evaluate(()=>document.querySelector('#spatial-app .reading')===window.originalSurface));
    check('uses published article URL',new URL(page.url()).pathname===article.url);
    check('language link follows article',new URL(await page.locator('#spatial-language').getAttribute('href'),server.base).pathname===article.alternate);
    const payload=JSON.parse(await readFile(`public/assets/articles/${locale}/${id}.json`,'utf8'));
    check('document title matches article',await page.title()===payload.head.title);
    check('canonical matches current article',new URL(await page.locator('link[rel=canonical]').getAttribute('href')).pathname===article.url);
    check('one visible article heading',await page.locator('#spatial-app h1:visible:not(.sr-only)').count()===1);
    check('source and review content retained',await page.locator('.reading .chapter[data-fragment=sources] a.source-row').count()===article.sourceCount);
    check('related candidates remain visible',await page.locator('.article-paper[data-relation]:not([aria-hidden=true])').count()>0);
    if(mobile)check('mobile reader gives space to the body',!(await page.locator('#month-rail').isVisible()));
    check('no decorative article copies',await page.locator('#spatial-app [data-article]').evaluateAll(es=>new Set(es.map(e=>e.dataset.article)).size===es.length));
    await page.screenshot({path:`${out}/${name}-read.png`});
    await page.locator('.reading [data-action=toc]').click();
    check('contents exposes chapters',await page.locator('.reading .chapter-toggle:visible').count()>=7);
    await page.locator('.reading [data-chapter="3"] .chapter-toggle').click();await page.waitForTimeout(320);
    check('chapter selection updates shareable fragment',new URL(page.url()).hash==='#section-4');
    const body='.reading .chapter.active .chapter-body';
    if(mobile&&engine===chromium)await swipe(page,body,100);
    else if(mobile){await page.locator(body).focus();await page.keyboard.press('PageDown');await page.waitForTimeout(300);}
    else {const b=await page.locator(body).boundingBox();await page.mouse.move(b.x+b.width*.5,b.y+b.height*.5);await page.mouse.wheel(0,240);await page.waitForTimeout(300);}
    const scroll=await page.locator(body).evaluate(e=>({top:e.scrollTop,max:e.scrollHeight-e.clientHeight,h:e.clientHeight}));
    check('body is readable',scroll.h>=100);if(scroll.max>2)check('native input scrolls body',scroll.top>0);
    check('body scroll does not advance workspace',await page.evaluate(()=>scrollY===0));
    check('no standalone copy button',await page.locator('.reading [data-action=copy]').count()===0);
    await page.locator('.reading [data-action=share]').click();check('share contract follows current article',await page.evaluate(()=>window.testShared.url.includes('#section-4')));
    await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:undefined}));
    await page.locator('.reading [data-action=share]').click();
    check('share fallback copies canonical chapter URL',await page.evaluate(()=>window.testCopied.includes('#section-4')&&window.testCopied.includes('https://research.notelligent.app/')));
    await page.locator('.reading [data-action=related]').click();await waitMode(page,'related');await settled(page);
    await page.screenshot({path:`${out}/${name}-related.png`});
    const target=(await getState(page)).focus;
    await page.locator('.article-paper[data-front=true] .read-button').click();await waitMode(page,'read');await settled(page);
    check('related article opens',(await getState(page)).article===target);
    check('related article canonical changes',new URL(await page.locator('link[rel=canonical]').getAttribute('href')).pathname===catalog.articles.find(a=>a.id===target).url);
    await page.goBack();await waitMode(page,'related');check('back restores relation origin',(await getState(page)).origin===id);
    await page.goBack();await waitMode(page,'read');await settled(page);
    check('back restores chapter',(await getState(page)).chapter===3&&(await getState(page)).article===id);
    check('back restores body position',Math.abs((await page.locator(body).evaluate(e=>e.scrollTop))-scroll.top)<3);
    await page.reload();await page.waitForFunction(()=>window.spatialSite);await page.evaluate(()=>document.fonts.ready);await settled(page);
    check('reload restores chapter',(await getState(page)).chapter===3);
    check('reload restores body position',Math.abs((await page.locator(body).evaluate(e=>e.scrollTop))-scroll.top)<3);
    await page.locator('#spatial-app [data-action=menu]').click();check('navigation menu opens',await page.locator('.spatial-menu').evaluate(e=>e.open));
    await page.keyboard.press('Escape');check('escape closes menu without navigation',!(await page.locator('.spatial-menu').evaluate(e=>e.open))&&(await getState(page)).mode==='read');
    await page.emulateMedia({media:'print'});await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));
    check('print uses active article',await page.locator('.page-shell .reading-title').innerText()===article.title);
    check('print exposes sources',await page.locator('.page-shell .reading-evidence').first().evaluate(e=>e.open));
    await page.emulateMedia({media:'screen'});await page.evaluate(()=>dispatchEvent(new Event('afterprint')));
    check('no page horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check('no script errors',errors.length===0);
    results.push({name,status:'passed',checks});console.log(name,checks.length,'passed');
  }catch(error){await page.screenshot({path:`${out}/${name}-failure.png`});results.push({name,status:'failed',checks,error:error.stack,browserErrors:errors});throw error;}
  finally{const video=page.video();await context.close();if(video)await video.saveAs(`${out}/${name}.webm`);await browser.close();await writeFile(`${out}/journeys.json`,JSON.stringify(results,null,2));}
}
try{
  for(const engine of [chromium,webkit])for(const locale of ['ja','en'])for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    if(!process.env.SPATIAL_CASE||`${engine.name()}-${locale}-${viewport.width}`===process.env.SPATIAL_CASE)await journey(engine,locale,viewport);
  }
}finally{await server.close();}
