import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { serveBuild } from './lib/test-server.mjs';
const preview=await serveBuild();
const functionalOnly=process.argv.includes('--functional-only');
const output='output/epic-motion/25';await mkdir(output,{recursive:true});
const results=[];
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function measure(page,count){
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await frames(page);await page.waitForTimeout(150);
  return page.evaluate(async count=>{
    const last=document.querySelectorAll('[data-article-id]')[count-1].parentElement;
    const end=Math.max(100,last.getBoundingClientRect().bottom+scrollY-innerHeight-1300);
    const started=performance.now(),long=[],shifts=[],times=[];
    const supports=PerformanceObserver.supportedEntryTypes;
    const observers=[];
    for(const type of ['longtask','layout-shift'])if(supports.includes(type)){
      const observer=new PerformanceObserver(list=>{for(const entry of list.getEntries())if(entry.startTime>=started)(type==='longtask'?long:shifts).push(type==='longtask'?entry.duration:entry.hadRecentInput?0:entry.value);});
      observer.observe({type,buffered:false});observers.push(observer);
    }
    let previous;
    await new Promise(resolve=>{
      let index=0;
      function tick(now){
        if(previous!==undefined)times.push(now-previous);previous=now;
        const progress=index<=120?index/120:(240-index)/120;
        scrollTo({top:end*progress,behavior:'instant'});
        if(++index<=240)requestAnimationFrame(tick);else resolve();
      }
      requestAnimationFrame(tick);
    });
    await new Promise(resolve=>setTimeout(resolve,100));observers.forEach(observer=>observer.disconnect());
    times.sort((a,b)=>a-b);
    return {articles:count,dom:document.querySelectorAll('*').length,p50:times[Math.floor(times.length*.5)],p95:times[Math.floor(times.length*.95)],max:times.at(-1),longTaskSupported:supports.includes('longtask'),longTasks:long.length,longTaskMs:long.reduce((a,b)=>a+b,0),cls:shifts.reduce((a,b)=>a+b,0)};
  },count);
}
try{for(const [engine,type,executablePath] of [['chromium',chromium,process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE]]){
  const browser=await type.launch({...executablePath?{executablePath}:{}});
  try{for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:900},hasTouch:true,reducedMotion:'no-preference'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${preview.base}/2026-07-11-agent-evaluation-measures-execution-path.html`);await page.evaluate(()=>document.fonts.ready);
    const boundary=page.locator('[data-next-url]').first();const id=await boundary.getAttribute('data-next-id');
    await boundary.scrollIntoViewIfNeeded();const article=page.locator(`[data-article-id="${id}"]`);await article.waitFor();
    const top=await article.evaluate(el=>el.parentElement.getBoundingClientRect().top+scrollY);
    await page.evaluate(y=>scrollTo({top:y-650,behavior:'instant'}),top);await frames(page);
    const beforeExpansion=await article.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a);
    await page.locator('[data-article-id]').first().locator('.reading-evidence').first().evaluate(el=>el.open=true);
    await page.evaluate(()=>document.fonts.ready);await frames(page);
    const movedTop=await article.evaluate(el=>el.parentElement.getBoundingClientRect().top+scrollY);
    await page.evaluate(y=>scrollTo({top:y-650,behavior:'instant'}),movedTop);await frames(page);
    assert(Math.abs(beforeExpansion-await article.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a))<.001,'Expanding an earlier article invalidates cached positions');
    await page.emulateMedia({reducedMotion:'reduce'});await frames(page);
    assert(await page.locator('[data-motion-phase]').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).transform==='none'&&getComputedStyle(node).opacity==='1')),'Reduced motion removes every spatial transform');
    await page.emulateMedia({reducedMotion:'no-preference'});await frames(page);
    assert(await article.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a<1),'Runtime setting changes restore spatial motion');
    const button=article.locator('[data-open-related]');await button.focus();await page.keyboard.press('Tab');await button.focus();await frames(page);
    assert(await button.evaluate(el=>document.activeElement===el),'Scrolling does not steal keyboard focus');
    assert.equal(await article.evaluate(el=>getComputedStyle(el).transform),'none','Keyboard-focused content stays flat');
    await button.tap();await page.keyboard.press('Escape');assert(await button.evaluate(el=>document.activeElement===el));
    await article.locator('.reading-map summary').click();
    const link=article.locator('.reading-map a').nth(1);await link.focus();await page.keyboard.press('Enter');await frames(page);
    assert.equal(await page.evaluate(()=>document.activeElement?.tagName),'H2','Keyboard navigation continues at the selected heading');
    await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:900,height:390});await frames(page);
    assert.equal(await article.evaluate(el=>getComputedStyle(el).transform),'none','Rotation retains a stable reduced-motion surface');
    assert.deepEqual(errors,[]);await page.close();
    if(!functionalOnly){
      const perf=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
      await perf.goto(`${preview.base}/2026-07-11-agent-evaluation-measures-execution-path.html`);await perf.evaluate(()=>document.fonts.ready);
      for(const count of [1,5]){
        while(await perf.locator('[data-article-id]').count()<count){
          const next=perf.locator('[data-next-url]').first();const nextId=await next.getAttribute('data-next-id');await next.scrollIntoViewIfNeeded();await perf.locator(`[data-article-id="${nextId}"]`).waitFor();
        }
        const record={engine,version:browser.version(),width,...await measure(perf,count)};results.push(record);
        assert(record.p95<34,`${engine} ${width}: frame p95 ${record.p95.toFixed(1)}ms exceeds 34ms`);
        assert(record.cls<.01,`${engine}: scrolling must not shift layout`);
        assert(record.longTaskMs<150,`${engine}: excessive main-thread blocking`);
        console.log(JSON.stringify(record));
      }
      await perf.close();
    }
  }}finally{await browser.close();}
}}finally{await preview.close();}
await writeFile(`${output}/quality.json`,JSON.stringify({environment:'Local macOS browser viewports; not physical mobile hardware',functionalOnly,results},null,2));
console.log('Reduced motion, runtime settings, keyboard/touch focus and rotation passed in both engines.');
