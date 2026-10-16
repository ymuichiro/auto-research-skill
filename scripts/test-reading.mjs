import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium, webkit } from 'playwright';
import { loadArticles, publishedArticles } from './lib/content.mjs';
import { renderArticlePage } from './lib/render.mjs';

const {articles} = await loadArticles();
const sample = publishedArticles(articles)[0];
const fixtureBody = '<section><h2>Template fixture</h2><p>This fixture contains semantic prose without design classes.</p><figure><figcaption>Illustrative fixture process</figcaption><ol><li><strong>Input</strong>Retain the source.</li><li><strong>Review</strong>Check the result.</li></ol></figure><figure><figcaption>Fixture values, not research results</figcaption><table><tr><th>Case</th><th>Value</th></tr><tr><td>Long fixture label that must remain readable</td><td>-2</td></tr><tr><td>Comparison</td><td>4</td></tr></table></figure><blockquote><p>A quotation.</p></blockquote><pre><code>plain_code()</code></pre></section>';
const fixture = {...sample,sourceDirName:'template-fixture',titleJa:'テンプレート表示確認',titleEn:'Template verification',bodies:{ja:fixtureBody,en:fixtureBody},outputPaths:{ja:'template.html',en:'en/template.html'}};

const root = path.resolve('public');
const server = http.createServer(async (request,response)=>{
  try {
    let file = decodeURIComponent(new URL(request.url,'http://local').pathname);
    if (file.endsWith('/')) file += 'index.html';
    const payload = file === '/template.html' ? renderArticlePage(fixture,'ja',[fixture]) : await readFile(path.join(root,file));
    const type = file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.html')?'text/html':'application/octet-stream';
    response.writeHead(200,{'Content-Type':type+'; charset=utf-8'});response.end(payload);
  }catch{response.writeHead(404);response.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const entry='/2026-07-11-agent-evaluation-measures-execution-path.html';
try {
  for (const [name,type,executablePath] of [['chromium',chromium,process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE]]) {
    const browser=await type.launch({...(executablePath?{executablePath}:{})});
    try {
      const home=await browser.newPage();await home.goto(base+'/');
      assert.equal(await home.locator('.editorial-briefing-link').first().evaluate(el=>getComputedStyle(el).color),'rgb(24, 48, 68)','Headline links retain the reading palette');
      assert.equal(await home.locator('.editorial-briefing-side .text-link').last().evaluate(el=>getComputedStyle(el).color),'rgb(255, 255, 255)','Primary actions retain readable white labels');
      await home.close();
      for(const locale of ['ja','en']) {
        const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
        const page=await context.newPage();
        const errors=[];page.on('pageerror',e=>errors.push(e.message));
        let requests=0;
        let shouldFail=true;
        await page.route('**/assets/articles/**', async route=>{
          requests++;
          if(shouldFail){shouldFail=false;await route.abort();}else{await route.continue();}
        });
        await page.goto(base+(locale==='en'?'/en':'')+entry);
        const firstId=await page.locator('[data-article-id]').first().getAttribute('data-article-id');
        await page.locator('[data-open-related]').first().click();
        assert(await page.locator('dialog').first().evaluate(d=>d.open));
        await page.keyboard.press('Escape');
        assert(await page.locator('[data-open-related]').first().evaluate(b=>b===document.activeElement),'Closing related flow restores focus');
        await page.locator('.nav-toggle').click();
        assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'true');
        await page.keyboard.press('Escape');
        const boundary=page.locator('[data-next-url]').first();
        const nextId=await boundary.getAttribute('data-next-id');
        await boundary.scrollIntoViewIfNeeded();
        await page.locator('[data-stream-retry]').waitFor({state:'visible'});
        assert.equal(await page.locator(`[data-article-id="${firstId}"]`).count(),1,'Network failure retains current article');
        const afterFailure=requests;await page.waitForTimeout(250);
        assert.equal(requests,afterFailure,'A failed fetch does not retry indefinitely');
        await page.locator('[data-stream-retry]').click();
        const appended=page.locator(`[data-article-id="${nextId}"]`);
        await appended.waitFor();
        await appended.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
        await page.waitForFunction(id=>location.pathname.includes(id),nextId);
        assert.equal(await appended.count(),1,'Repeated observer notifications append once');
        assert((await page.locator('link[rel="canonical"]').getAttribute('href')).includes(nextId));
        assert((await page.locator('.lang-switch').getAttribute('href')).includes(nextId));
        assert((await appended.locator('[data-copy-share]').getAttribute('data-share-url')).includes(nextId));
        const duplicated=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);return ids.filter((id,i)=>ids.indexOf(id)!==i);});
        assert.deepEqual(duplicated,[],'Appended outline and diagram IDs do not collide');
        const jsonLd=await page.locator('script[type="application/ld+json"]').allTextContents();
        assert(jsonLd.some(text=>text.includes(nextId)),'Structured metadata follows current article');
        await appended.locator('.reading-map summary').click();
        await appended.locator('.reading-map a').first().click();
        assert(!new URL(page.url()).hash.includes('--'),'Public anchor links do not expose internal namespaced IDs');
        await page.locator(`[data-article-id="${firstId}"]`).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
        await page.waitForFunction(id=>location.pathname.includes(id),firstId);
        await appended.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
        await page.waitForFunction(id=>location.pathname.includes(id),nextId);
        await page.reload();
        assert.equal(await page.locator('[data-article-id]').first().getAttribute('data-article-id'),nextId,'Reload opens the actual active article');
        // An old response may finish after the reader has returned to the top.
        await page.unroute('**/assets/articles/**');
        let delayed = false;
        await page.route('**/assets/articles/**',async route=>{
          delayed=true;
          await new Promise(resolve=>setTimeout(resolve,450));
          await route.continue();
        });
        const later=page.locator('[data-next-url]').first();
        if(await later.count()) {
          const laterId=await later.getAttribute('data-next-id');
          await later.scrollIntoViewIfNeeded();
          await page.waitForFunction(()=>document.querySelector('[data-next-url][data-loading]')!=null);
          await page.locator('[data-article-id]').first().evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
          await page.locator(`[data-article-id="${laterId}"]`).waitFor();
          assert(delayed);
          assert(page.url().includes(nextId),'Late response must not switch the article being read');
        }
        assert.deepEqual(errors,[]);
        await context.close();
      }
      const offline=await browser.newContext({javaScriptEnabled:false,viewport:{width:360,height:844}});
      const page=await offline.newPage();await page.goto(base+entry);
      assert((await page.locator('.article-body').innerText()).length>1000,'No-JavaScript reading preserves full article');
      assert(await page.locator('.next-article-preview').isVisible(),'No-JavaScript reader retains ordinary continuation link');
      await page.locator('.reading-map summary').click();
      const nativeLink=page.locator('.reading-map a').nth(1);
      assert((await nativeLink.innerText()).trim().length>4,'No-JavaScript contents names the destination');
      const nativeFragment=await nativeLink.getAttribute('href');
      await nativeLink.click();
      await page.waitForURL(url=>url.hash===nativeFragment);
      // Page-side RAF polling is unavailable with JavaScript disabled. Poll
      // browser geometry from the test driver while the native scroll settles.
      let nativeVisible=false;
      for(let attempt=0;attempt<100;attempt++){
        nativeVisible=await page.locator(nativeFragment).evaluate(el=>{const top=el.getBoundingClientRect().top;return top>=document.querySelector('.site-header').getBoundingClientRect().bottom&&top<innerHeight/2;});
        if(nativeVisible)break;
        await page.waitForTimeout(50);
      }
      assert(nativeVisible,'Native contents navigation reaches a visible heading below the fixed header');
      await offline.close();
      for (const width of [360,390,768,1440]) {
        const fixturePage = await browser.newPage({viewport:{width,height:900}});
        await fixturePage.goto(base+'/template.html');
        await fixturePage.evaluate(()=>document.fonts.ready);
        assert.equal(await fixturePage.locator('.data-chart').count(),1,'Semantic numeric table receives a chart');
        assert.equal(await fixturePage.locator('.chart-series-0').evaluate(el=>getComputedStyle(el).fill),'rgb(120, 175, 196)','Numeric charts use the shared blue palette');
        assert.equal(await fixturePage.locator('.article-body table td').first().textContent(),'Long fixture label that must remain readable');
        const overflow=await fixturePage.evaluate(()=>[...document.querySelectorAll('.article-body *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0 && (r.right>innerWidth+2 || r.left< -2);}).map(el=>el.tagName));
        assert.deepEqual(overflow,[],`Semantic authoring blocks fit ${width}px`);
        await mkdir('output/design-verification/template',{recursive:true});
        await fixturePage.screenshot({path:`output/design-verification/template/${name}-${width}.png`,fullPage:true});
        await fixturePage.close();
      }
      const historyContext=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
      const historyPage=await historyContext.newPage();
      await historyPage.goto(base+'/topics/ai-agents/');
      await historyPage.goto(base+entry);
      const historyBoundary=historyPage.locator('[data-next-url]').first();
      const historyNext=await historyBoundary.getAttribute('data-next-id');
      await historyBoundary.scrollIntoViewIfNeeded();
      await historyPage.locator(`[data-article-id="${historyNext}"]`).waitFor();
      await historyPage.locator(`[data-article-id="${historyNext}"]`).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
      await historyPage.waitForFunction(id=>location.pathname.includes(id),historyNext);
      await historyPage.goBack();
      await historyPage.waitForURL(base+'/topics/ai-agents/');
      assert(historyPage.url().includes('/topics/ai-agents/'),'Back returns to the prior navigation, not every scroll event');
      await historyPage.goForward();
      await historyPage.waitForURL('**/'+historyNext+'.html');
      assert(historyPage.url().includes(historyNext),'Forward restores the active article');
      await historyPage.waitForFunction(id=>{
        const article=document.querySelector(`[data-article-id="${id}"]`);
        if(!article)return false;
        const rect=article.getBoundingClientRect();
        return rect.top<350 && rect.bottom>200;
      },historyNext);
      await historyContext.close();
      const interruptedContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
      const interruptedPage=await interruptedContext.newPage();
      let started=false,loads=0;
      await interruptedPage.route('**/assets/articles/**',async route=>{
        loads++;started=true;
        if(loads===1)await new Promise(resolve=>setTimeout(resolve,1000));
        try{await route.continue();}catch{} // Navigating away legitimately cancels the first request.
      });
      await interruptedPage.goto(base+'/topics/ai-agents/');
      await interruptedPage.goto(base+entry);
      const interruptedBoundary=interruptedPage.locator('[data-next-url]').first();
      const interruptedId=await interruptedBoundary.getAttribute('data-next-id');
      await interruptedBoundary.scrollIntoViewIfNeeded();
      await interruptedPage.waitForFunction(()=>document.querySelector('[data-next-url][data-loading]')!=null);
      assert(started);
      await interruptedPage.goBack();await interruptedPage.waitForURL(base+'/topics/ai-agents/');
      await interruptedPage.goForward();await interruptedPage.waitForURL('**/'+entry.slice(1));
      const resumedBoundary=interruptedPage.locator('[data-next-url]').first();
      if(await resumedBoundary.count())await resumedBoundary.scrollIntoViewIfNeeded();
      await interruptedPage.locator(`[data-article-id="${interruptedId}"]`).waitFor();
      assert.equal(await interruptedPage.locator(`[data-article-id="${interruptedId}"]`).count(),1,'Interrupted fetch resumes without losing ownership or duplicating the article');
      await interruptedContext.close();
      const enlargedPage=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
      await enlargedPage.goto(base+entry);
      await enlargedPage.addStyleTag({content:'html { font-size: 200%; }'});
      await enlargedPage.evaluate(()=>document.fonts.ready);
      await enlargedPage.waitForTimeout(100);
      const enlargedOverflow=await enlargedPage.evaluate(()=>[...document.querySelectorAll('main *, .site-header *')].filter(el=>{
        const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&!el.closest('dialog:not([open])')&&(r.left< -2||r.right>innerWidth+2);
      }).map(el=>el.className));
      assert.deepEqual(enlargedOverflow,[],'Text magnification must preserve the reading column and navigation');
      await enlargedPage.setViewportSize({width:844,height:390});
      assert.equal(await enlargedPage.locator('.reading-article').first().evaluate(el=>getComputedStyle(el).transform),'none','Reading text remains front-facing after rotation');
      await enlargedPage.close();
      console.log(`${name}: failure retention, retry, related-flow focus, mobile navigation, append ownership, metadata, sharing, reload and no-JS reading passed.`);
    }finally{await browser.close();}
  }
} finally { await new Promise(resolve=>server.close(resolve)); }
