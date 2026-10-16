import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import { serveBuild } from './lib/test-server.mjs';
const preview=await serveBuild();
try {
  for(const [engine,type,executablePath] of [['chromium',chromium,process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE]]){
    const browser=await type.launch({...executablePath?{executablePath}:{}});
    try{for(const width of [390,1440])for(const locale of ['ja','en']){
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
      let release;const gate=new Promise(resolve=>release=resolve);
      await page.route('**/assets/articles/**',async route=>{await gate;await route.continue();});
      await page.goto(`${preview.base}/${locale==='en'?'en/':''}2026-07-11-agent-evaluation-measures-execution-path.html`);
      const boundary=page.locator('[data-next-url]').first();const id=await boundary.getAttribute('data-next-id');
      await boundary.scrollIntoViewIfNeeded();await page.locator('[data-loading]').waitFor();
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const before=await boundary.evaluate(el=>({scroll:scrollY,pose:getComputedStyle(el.querySelector('.next-article-preview')).transform,top:el.querySelector('.article-mount').getBoundingClientRect().top+scrollY,previous:el.previousElementSibling.getBoundingClientRect().bottom+scrollY}));
      assert(before.top>before.previous,'Continuation must not overlap the preceding article');
      release();const article=page.locator(`[data-article-id="${id}"]`);await article.waitFor();
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const after=await article.evaluate(el=>({scroll:scrollY,pose:getComputedStyle(el).transform,top:el.closest('.article-mount').getBoundingClientRect().top+scrollY}));
      assert(Math.abs(before.top-after.top)<1,`${engine}: content is inserted at the same mount anchor`);
      assert(Math.abs(before.scroll-after.scroll)<2,`${engine}: delayed append must not move the reader`);
      assert.equal(before.pose,after.pose,`${engine}: preview and article use the same visual pose`);
      assert.equal(await article.count(),1);assert.equal(await article.evaluate(el=>el.closest('.article-continuation').querySelectorAll('.next-article-preview').length),0);
      await page.close();
    }}finally{await browser.close();}
  }
}finally{await preview.close();}
console.log('Delayed arrival preserves the preview anchor and reader position in both engines, widths and languages.');
