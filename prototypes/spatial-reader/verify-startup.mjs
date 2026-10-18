import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const url=process.env.PROTOTYPE_URL??'http://localhost:4174/';
const results=[];
for(const engine of [chromium,webkit]){
  const browser=await engine.launch();
  try{
    const runs=await Promise.all(Array.from({length:4},async(_,run)=>{
      const context=await browser.newContext({viewport:{width:390,height:844}}),errors=[];
      // Isolate local asset startup from the optional external font service.
      await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({status:200,contentType:'text/css',body:''}));
      const page=await context.newPage();
      page.on('pageerror',e=>errors.push(e.message));
      page.on('requestfailed',r=>{if(r.url().startsWith(url))errors.push(r.failure()?.errorText);});
      await page.goto(url);await page.waitForFunction(()=>window.spatialPrototype);
      assert.equal(await page.locator('[data-article]').count(),40);
      assert.ok(await page.locator('.month-paper[data-front=true] .month-open').isVisible());
      assert.deepEqual(errors,[]);
      await context.close();return {engine:engine.name(),run,localAssetErrors:errors,status:'passed'};
    }));results.push(...runs);
  }finally{await browser.close();}
}
await writeFile(new URL('../../output/spatial-reader/startup-verification.json',import.meta.url),JSON.stringify(results,null,2));
console.log({coldStarts:results.length,status:'passed'});
