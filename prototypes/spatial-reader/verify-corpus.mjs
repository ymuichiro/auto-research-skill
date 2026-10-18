import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const url=process.env.PROTOTYPE_URL??'http://localhost:4174/';
const out=new URL('../../output/spatial-reader/',import.meta.url).pathname;
await mkdir(out,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage({reducedMotion:'reduce'});
await page.goto(url);const articles=await page.evaluate(()=>RESEARCH_DATA.articles.map(a=>({id:a.id,title:a.title})));
const measurements=[],failures=[];
for(const viewport of [{width:1440,height:900},{width:360,height:664}]){
  await page.setViewportSize(viewport);
  for(const article of articles){
    const target=new URL(url);target.searchParams.set('inspect',article.id);target.hash=`read/${article.id}/0`;
    await page.goto(target.href);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(40);
    const count=await page.locator('.reading .chapter').count();
    for(let i=0;i<count;i++){
      if(i){await page.locator('.reading .chapter.next .chapter-toggle').click();}
      const metrics=await page.locator('.reading .chapter.active .chapter-body').evaluate(e=>{
        const r=e.getBoundingClientRect();return {height:r.height,width:r.width,scroll:e.scrollHeight,client:e.clientHeight,visible:e.textContent.trim().length,overflow:e.scrollWidth>e.clientWidth+2};
      });
      const row={viewport,article:article.id,chapter:i,...metrics};measurements.push(row);
      if(metrics.height<90||metrics.width<200||!metrics.visible){failures.push(row);await page.screenshot({path:out+`corpus-failure-${viewport.width}-${article.id}-${i}.png`});}
    }
  }
}
await browser.close();
await writeFile(out+'corpus-verification.json',JSON.stringify({articles:articles.length,chapters:measurements.length,minimumBodyHeight:Math.min(...measurements.map(m=>m.height)),failures,measurements},null,2));
console.log({articles:articles.length,chapters:measurements.length,minimumBodyHeight:Math.min(...measurements.map(m=>m.height)),failures});
assert.equal(failures.length,0);
