import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const url=process.env.PROTOTYPE_URL??'http://localhost:4174/';
const out=new URL('../../output/spatial-reader/',import.meta.url).pathname;
await mkdir(out,{recursive:true});
const results=[];
const pause=page=>page.waitForTimeout(800);
const state=page=>page.evaluate(()=>window.spatialPrototype.getState());
const geometry=async(page,selector)=>page.locator(selector).evaluate(el=>{
  const r=el.getBoundingClientRect(),s=getComputedStyle(el);
  return {x:r.x,y:r.y,w:r.width,h:r.height,opacity:Number(s.opacity),transform:s.transform};
});
const readBox='.reading .chapter.active .chapter-body';
async function touchScroll(page,selector,distance=180){
  const box=await page.locator(selector).boundingBox(),session=await page.context().newCDPSession(page);
  const x=box.x+box.width*.6,y=box.y+box.height*.72;
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=14;i++){
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-distance*i/14}]});
    await page.waitForTimeout(18);
  }
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(900);await session.detach();
}
async function journey(engine,name,viewport,touch=false){
  const browser=await engine.launch();
  const context=await browser.newContext({viewport,isMobile:touch,hasTouch:touch,deviceScaleFactor:1,
    recordVideo:{dir:out+'videos',size:viewport}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',req=>{if(new URL(req.url()).origin===new URL(url).origin)errors.push(`${req.url()}: ${req.failure()?.errorText}`);});
  const record={name,engine:engine.name(),viewport,checks:[]};
  function check(name,value=true){assert.ok(value,name);record.checks.push(name);}
  try{
    await page.goto(url);await page.waitForFunction(()=>window.spatialPrototype);await page.evaluate(()=>document.fonts.ready);await pause(page);
    await page.screenshot({path:out+name+'-timeline.png'});
    const foldedTitles=await page.locator('.article-paper[data-folded=true]:not([aria-hidden=true]) .title-open').evaluateAll(es=>es.map(e=>({height:e.getBoundingClientRect().height,line:parseFloat(getComputedStyle(e).lineHeight)})));
    check('folded titles stay on a single readable line',foldedTitles.length>0&&foldedTitles.every(t=>t.height<=t.line+2));
    const workspace=await geometry(page,'#workspace');
    const initialMonth=(await state(page)).focus;
    const monthSelector=`[data-month="${initialMonth}"]`;
    const before=await geometry(page,monthSelector);
    if(touch&&engine===chromium)await touchScroll(page,'#workspace',150);
    else if(touch){await page.keyboard.press('ArrowDown');await page.waitForTimeout(800);}
    else {await page.mouse.move(viewport.width*.6,viewport.height*.5);await page.mouse.wheel(0,220);await page.waitForTimeout(400);}
    check('native input advances timeline',(await state(page)).progress>0);
    check('workspace remains fixed',Math.abs((await geometry(page,'#workspace')).y-workspace.y)<1);
    check('scroll changes month geometry',Math.abs((await geometry(page,monthSelector)).h-before.h)>5);
    // Exact stop and reverse samples complement native input. These do not change application state directly.
    const step=(await state(page)).step;
    await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),step*.4);await page.waitForTimeout(100);
    const at40=await geometry(page,monthSelector);
    await page.waitForTimeout(350);assert.deepEqual(await geometry(page,monthSelector),at40);check('animation stops with input');
    await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),step*.75);await page.waitForTimeout(100);
    await page.screenshot({path:out+name+'-timeline-motion.png'});
    await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),step*.4);await page.waitForTimeout(100);
    assert.deepEqual(await geometry(page,monthSelector),at40);check('reverse returns identical geometry');
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);
    await page.locator(`${monthSelector} .month-open`).click();
    await page.waitForTimeout(180);const opening=await geometry(page,'.article-paper[data-front=true]');
    await page.screenshot({path:out+name+'-opening-motion.png'});await pause(page);
    const opened=await geometry(page,'.article-paper[data-front=true]');
    check('article unfolds through intermediate geometry',Math.abs(opening.h-opened.h)>2||Math.abs(opening.y-opened.y)>2);
    const id=(await state(page)).focus;
    await page.evaluate(id=>{window.__originalPaper=document.querySelector(`[data-article="${id}"]`);},id);
    check('exactly one surface per article',await page.evaluate(()=>{
      const ids=[...document.querySelectorAll('[data-article]')].map(e=>e.dataset.article);return ids.length===new Set(ids).size&&ids.length===40;
    }));
    await page.screenshot({path:out+name+'-preview.png'});
    // Use real article wheel/touch input as well as month input.
    if(touch&&engine===chromium)await touchScroll(page,'#workspace',125);
    else if(touch){await page.keyboard.press('ArrowDown');await page.waitForTimeout(800);}
    else {await page.mouse.wheel(0,200);await page.waitForTimeout(300);}
    check('native input animates article selection',(await state(page)).progress>0);
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(150);
    const input=touch?'tap':'click';
    await page.locator('.article-paper[data-front=true] .read-button')[input]();await pause(page);
    check('opens real article body',(await state(page)).mode==='read');
    check('same article DOM surface expands',await page.evaluate(()=>document.querySelector('.reading')===window.__originalPaper));
    check('related candidate remains visible',await page.locator('.article-paper[data-relation]:not([aria-hidden=true])').count()>0);
    await page.screenshot({path:out+name+'-read.png'});
    if(touch&&engine===chromium)await touchScroll(page,readBox,100);
    else if(touch){await page.locator(readBox).focus();await page.keyboard.press('PageDown');await page.waitForTimeout(300);}
    else {
      const box=await page.locator(readBox).boundingBox();await page.mouse.move(box.x+box.width*.6,box.y+box.height*.6);
      await page.mouse.wheel(0,200);await page.waitForTimeout(200);
    }
    const bodyMetrics=await page.locator(readBox).evaluate(e=>({top:e.scrollTop,total:e.scrollHeight,visible:e.clientHeight}));
    check('body has readable space',bodyMetrics.visible>=100);
    if(bodyMetrics.total>bodyMetrics.visible+2)check('native input scrolls chapter body',bodyMetrics.top>0);
    check('reading does not change outer scroll',await page.evaluate(()=>scrollY===0));
    await page.locator('.reading .chapter.next .chapter-toggle')[input]();await page.waitForTimeout(320);
    check('folded chapter opens',(await state(page)).chapter===1);
    await page.locator('.reading [data-action=toc]')[input]();await page.waitForTimeout(100);
    await page.screenshot({path:out+name+'-contents.png'});
    check('contents exposes all chapter names',await page.locator('.reading .chapter-toggle:visible').count()>=7);
    await page.locator('.reading .chapter[data-chapter="3"] .chapter-toggle')[input]();await page.waitForTimeout(320);
    check('contents chooses chapter',(await state(page)).chapter===3&&!(await state(page)).toc);
    await page.locator('.reading [data-action=related]')[input]();await pause(page);
    check('related branch opens',(await state(page)).mode==='related');
    await page.screenshot({path:out+name+'-related.png'});
    const target=(await state(page)).focus;
    await page.evaluate(id=>{window.__relatedPaper=document.querySelector(`[data-article="${id}"]`);},target);
    await page.locator('.article-paper[data-front=true] .read-button')[input]();await pause(page);
    check('related article opens',(await state(page)).article===target&&(await state(page)).mode==='read');
    check('related surface persists into reading',await page.evaluate(()=>document.querySelector('.reading')===window.__relatedPaper));
    await page.screenshot({path:out+name+'-related-read.png'});
    await page.goBack();await pause(page);check('browser back restores relation context',(await state(page)).mode==='related'&&(await state(page)).origin===id);
    await page.goBack();await pause(page);check('browser back restores reading chapter',(await state(page)).mode==='read'&&(await state(page)).article===id&&(await state(page)).chapter===3);
    check('no horizontal page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check('no browser script errors',errors.length===0);
    record.status='passed';
  }catch(error){record.status='failed';record.error=error.stack;record.browserErrors=errors;await page.screenshot({path:out+name+'-failure.png'});throw error;}
  finally{
    const video=page.video();await context.close();await video.saveAs(out+name+'-journey.webm');
    await browser.close();results.push(record);await writeFile(out+'verification.json',JSON.stringify(results,null,2));
    console.log(name,record.status,record.checks.length,record.error??'');
  }
}
for(const [engine,name,viewport,touch] of [
  [chromium,'desktop',{width:1440,height:900},false],
  [chromium,'mobile',{width:390,height:844},true],
  [webkit,'webkit-mobile',{width:390,height:844},true],
  [chromium,'small',{width:360,height:664},true],
])await journey(engine,name,viewport,touch);
