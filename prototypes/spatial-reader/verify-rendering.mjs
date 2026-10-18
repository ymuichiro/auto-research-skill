import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const out=new URL('../../output/spatial-reader/',import.meta.url).pathname;
const url=process.env.PROTOTYPE_URL??'http://localhost:4174/';
const browser=await chromium.launch(),results=[];
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport});
  await page.goto(url);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(300);
  const fonts=await page.evaluate(()=>[...document.fonts].filter(f=>f.family.includes('Noto Sans JP')&&f.status==='loaded').length);
  assert.ok(fonts>0,'Noto Sans JP loaded');
  const performance=await page.evaluate(async()=>{
    const intervals=[],longTasks=[];let previous,frame=0;
    const observer=new PerformanceObserver(entries=>longTasks.push(...entries.getEntries().map(e=>e.duration)));
    observer.observe({type:'longtask'});
    await new Promise(resolve=>{
      function advance(t){
        if(previous!==undefined)intervals.push(t-previous);previous=t;
        scrollTo({top:frame*spatialPrototype.getState().step/100,behavior:'instant'});
        if(++frame<=100)requestAnimationFrame(advance);else resolve();
      }requestAnimationFrame(advance);
    });observer.disconnect();
    const sorted=intervals.toSorted((a,b)=>a-b);
    return {frames:intervals.length,p50:sorted[50],p95:sorted[95],maximum:sorted.at(-1),longTasks};
  });
  assert.ok(performance.p95<50,'local browser frame interval below 50ms');
  const id='2026-10-11-ai-science-candidate-search-and-experimental-validation';
  await page.goto(`${url}?rendering=1#read/${id}/0`);await page.evaluate(()=>document.fonts.ready);
  await page.locator('.reading [data-action=toc]').click();
  const chapter=await page.locator('.reading .chapter').evaluateAll(es=>es.findIndex(e=>e.querySelector('.comparison-card')));
  assert.ok(chapter>=0);
  await page.locator(`.reading [data-chapter="${chapter}"] .chapter-toggle`).click();await page.waitForTimeout(350);
  // Bring the existing comparison to the top of the reading region, without moving the workspace.
  await page.locator('.reading .chapter.active .chapter-body').evaluate(e=>{const card=e.querySelector('.comparison-grid');e.scrollTop=card.offsetTop-e.offsetTop;});
  await page.screenshot({path:out+`comparison-${viewport.width}.png`});
  assert.ok(await page.locator('.reading .chapter.active .comparison-card').first().isVisible());
  const overflow=await page.locator('.reading .chapter.active .chapter-body').evaluate(e=>e.scrollWidth>e.clientWidth+1);
  assert.equal(overflow,false);
  results.push({viewport,loadedNotoFaces:fonts,performance,comparison:'visible without horizontal overflow',status:'passed'});
  await page.close();
}
await browser.close();await writeFile(out+'rendering-verification.json',JSON.stringify(results,null,2));console.log(results);
