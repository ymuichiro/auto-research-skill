import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import { serveBuild } from './lib/test-server.mjs';
const preview=await serveBuild();
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
try{for(const [engine,type,executablePath] of [['chromium',chromium,process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE]]){
  const browser=await type.launch({...executablePath?{executablePath}:{}});
  try{for(const width of [390,1440])for(const locale of ['ja','en']){
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${preview.base}/${locale==='en'?'en/':''}2026-07-11-agent-evaluation-measures-execution-path.html`);
    const boundary=page.locator('[data-next-url]').first();const id=await boundary.getAttribute('data-next-id');
    await boundary.scrollIntoViewIfNeeded();const article=page.locator(`[data-article-id="${id}"]`);await article.waitFor();
    const top=await article.evaluate(el=>el.parentElement.getBoundingClientRect().top+scrollY);
    const historyLength=await page.evaluate(()=>history.length);
    for(const y of [300,200,300,200]){
      await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),top-y);await frames(page);
      assert.equal(page.url().includes(id),y<=220,'Current URL follows the reading plane in both directions');
    }
    assert.equal(await page.evaluate(()=>history.length),historyLength,'Native scroll does not add history entries');
    assert((await page.locator('link[rel="canonical"]').getAttribute('href')).includes(id));
    assert((await page.locator('.lang-switch').getAttribute('href')).includes(id));
    assert((await article.locator('[data-copy-share]').getAttribute('data-share-url')).includes(id));
    assert((await page.locator('script[type="application/ld+json"]').allTextContents()).some(text=>text.includes(id)));
    const link=article.locator('.reading-map a').nth(1);await link.scrollIntoViewIfNeeded();await frames(page);
    const before=await page.evaluate(()=>scrollY);
    const fragment=await link.getAttribute('data-original-fragment');
    await link.click();await frames(page);
    assert.equal(new URL(page.url()).hash,fragment);assert.equal(await page.evaluate(()=>history.length),historyLength+1);
    const selected=article.locator('.reading-map a[aria-current="location"]');assert.equal(await selected.count(),1);
    assert.equal(await selected.getAttribute('data-original-fragment'),fragment);
    assert.equal(await page.locator('.reading-map a[aria-current="location"]').count(),1,'Inactive article maps have no current marker');
    const heading=article.locator('.article-body h2').nth(1);
    assert(await heading.evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom),'Anchor heading clears the fixed header');
    await page.evaluate(()=>scrollBy({top:300,behavior:'instant'}));await frames(page);const moved=await page.evaluate(()=>scrollY);
    await page.goBack();await frames(page);assert(Math.abs(await page.evaluate(()=>scrollY)-before)<3,`${engine}: back restores reading position`);
    await page.goForward();await frames(page);assert(Math.abs(await page.evaluate(()=>scrollY)-moved)<3,`${engine}: forward restores the later reading position`);
    const offset=await article.evaluate(el=>-el.parentElement.getBoundingClientRect().top);
    await page.reload();await frames(page);
    assert.equal(await page.locator('[data-article-id]').first().getAttribute('data-article-id'),id);
    await page.waitForFunction(y=>Math.abs(-document.querySelector('[data-article-id]').parentElement.getBoundingClientRect().top-y)<3,offset).catch(async error=>{
      console.error({engine,width,locale,offset,actual:await page.evaluate(()=>({scroll:scrollY,top:document.querySelector('[data-article-id]').parentElement.getBoundingClientRect().top,state:history.state}))});throw error;
    });
    assert.equal(new URL(page.url()).hash,fragment);
    assert.deepEqual(errors,[]);await page.close();
  }}finally{await browser.close();}
}}finally{await preview.close();}
console.log('Article/section state, metadata, anchor history and exact reading restoration passed in both engines, widths and languages.');
