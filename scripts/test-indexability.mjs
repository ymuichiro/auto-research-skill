import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium, webkit} from 'playwright';
import {createHash} from 'node:crypto';
import {serveBuild} from './lib/test-server.mjs';

// Test the reader's actual rendered content, not just text in an HTML response.
const args=process.argv.slice(2),option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const remote=option('--base-url',null),server=remote?null:await serveBuild();
const base=remote??server.base+'/',out=option('--output','output/indexability');
await mkdir(out,{recursive:true});
const results=[];
let browser;
try {
  const xml=await Promise.all(['sitemap-pages.xml','sitemap-articles.xml'].map(async file=>{
    const response=await fetch(new URL(file,base));assert.equal(response.status,200);return response.text();
  }));
  const urls=[...new Set(xml.flatMap(s=>[...s.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1])))];
  const paths=urls.map(u=>new URL(u).pathname);
  const pathSet=new Set(paths),links=new Map(),assets=new Set();
  browser=await chromium.launch();
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await context.route('https://fonts.googleapis.com/**',route=>route.abort());
  const page=await context.newPage();
  for(const pathname of paths){
    const url=new URL(pathname,new URL(base).origin);
    const response=await page.goto(url.href,{waitUntil:'domcontentloaded'});
    assert.equal(response.status(),200,pathname);
    assert.ok(await page.locator('.page-shell').isVisible(),`${pathname}: HTML must be visible without JavaScript`);
    assert.equal(await page.locator('.page-shell').evaluate(e=>e.inert||e.getAttribute('aria-hidden')==='true'),false,pathname);
    assert.equal(await page.locator('#spatial-startup').isVisible(),false,`${pathname}: no blocking loader`);
    assert.ok(await page.locator('#main h1').isVisible(),`${pathname}: main heading visible`);
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),urls[paths.indexOf(pathname)]);
    assert.equal(await page.locator('meta[name=robots]').evaluate(e=>e.content.includes('noindex')),false);
    for(const href of await page.locator('script[src],link[rel=stylesheet]').evaluateAll(nodes=>nodes.map(n=>n.src||n.href))){
      const match=href.match(/\.([0-9a-f]{12})\.(?:js|css)$/);
      if(!match||assets.has(href))continue;
      const response=await fetch(href);assert.equal(response.status,200,href);
      assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex').slice(0,12),match[1],'runtime asset fingerprint matches its delivered bytes');
      assets.add(href);
    }
    if(await page.locator('.article-body').count()){
      assert.ok(await page.locator('.article-body').isVisible(),`${pathname}: readable body`);
      const paragraphs=page.locator('.article-body p');
      assert.ok(await paragraphs.count()>2,pathname);
      await paragraphs.last().scrollIntoViewIfNeeded();
      assert.ok(await paragraphs.last().isVisible(),`${pathname}: final paragraph retained`);
      await page.locator('.reading-evidence summary').first().click();
      assert.ok(await page.locator('.reading-evidence[open] a[href^="https://"]').first().isVisible(),`${pathname}: sources usable`);
    }
    links.set(pathname,await page.locator('.page-shell a[href]').evaluateAll(nodes=>nodes.map(n=>new URL(n.href).pathname)));
  }
  const seen=new Set(['/','/en/']),queue=[...seen];
  for(let i=0;i<queue.length;i++)for(const href of links.get(queue[i])??[]){
    if(pathSet.has(href)&&!seen.has(href)){seen.add(href);queue.push(href);}
  }
  assert.deepEqual(paths.filter(p=>!seen.has(p)),[],'Every canonical page must be reachable through ordinary HTML links');
  await page.goto(new URL('/',base).href,{waitUntil:'domcontentloaded'});
  await page.locator('.lang-switch').click();
  assert.equal(new URL(page.url()).pathname,'/en/','Language navigation works without JavaScript');
  await page.goto(new URL('/2026-08-12-beyond-ai-agents-hacw.html',base).href,{waitUntil:'domcontentloaded'});
  await page.screenshot({path:`${out}/article-without-javascript.png`});
  results.push({suite:'all-canonical-pages-without-javascript',pages:paths.length,reachable:paths.filter(p=>seen.has(p)).length,status:'passed'});
  await browser.close();browser=null;

  for(const engine of [chromium,webkit]){
    browser=await engine.launch();
    for(const locale of ['ja','en'])for(const failure of ['delayed-catalog','catalog-failure','script-failure']){
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage();
      await context.route('https://fonts.googleapis.com/**',route=>route.abort());
      let release;
      const gate=new Promise(resolve=>release=resolve);
      await page.route('**/assets/spatial/*.json',async route=>{
        if(failure==='catalog-failure')return route.fulfill({status:503,body:'Unavailable'});
        if(failure==='delayed-catalog')await gate;
        return route.continue();
      });
      if(failure==='script-failure')await page.route('**/assets/spatial-site*.js',route=>route.abort());
      const article=`${locale==='en'?'/en':''}/2026-08-12-beyond-ai-agents-hacw.html`;
      await page.goto(new URL(article,base).href,{waitUntil:'domcontentloaded'});
      assert.ok(await page.locator('.page-shell .article-body').isVisible(),`${engine.name()}/${locale}/${failure}: body available before enhancement`);
      assert.equal(await page.locator('.page-shell').evaluate(e=>e.inert),false);
      if(failure==='delayed-catalog'){
        release();
        await page.waitForFunction(()=>window.spatialSite);
        assert.equal(await page.locator('.page-shell').isVisible(),false,'successful enhancement replaces the HTML view');
        assert.equal(await page.locator('.page-shell').evaluate(e=>e.inert),true,'no duplicate keyboard surface');
        assert.ok(await page.locator('#spatial-app .reading .chapter-content').first().isVisible());
        await page.screenshot({path:`${out}/${engine.name()}-${locale}-enhanced.png`});
      }else{
        await page.locator('#spatial-startup-retry').waitFor({state:'visible'});
        assert.ok(await page.locator('.page-shell .article-body').isVisible(),'startup failure must not hide content');
        await page.locator('.lang-switch').click();
        assert.equal(new URL(page.url()).pathname,`${locale==='ja'?'/en':''}/2026-08-12-beyond-ai-agents-hacw.html`,'navigation remains usable after failure');
      }
      results.push({suite:'enhancement-resilience',engine:engine.name(),locale,failure,status:'passed'});
      await context.close();
    }
    await browser.close();browser=null;
  }
  await writeFile(`${out}/results.json`,JSON.stringify({base,results},null,2)+'\n');
  console.log(`Indexability passed: ${paths.length} canonical pages without JavaScript, HTML link reachability, and 12 Chromium/WebKit startup cases.`);
} finally {
  await browser?.close();
  await server?.close();
}
