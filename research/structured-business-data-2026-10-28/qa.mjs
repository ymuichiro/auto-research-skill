import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import {serveBuild} from '../../scripts/lib/test-server.mjs';
const id='2026-10-28-structured-business-data-and-predictive-agents';
const out='research/structured-business-data-2026-10-28/qa';
await mkdir(out,{recursive:true});
const server=await serveBuild();const results=[];
try {for(const engine of [chromium,webkit]) {
 const browser=await engine.launch();
 try {for(const width of [360,390,768,1440]) for(const locale of ['ja','en']) {
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const rel=(locale==='en'?'en/':'')+id+'.html';
  await page.goto(server.base+'/'+rel);await page.waitForFunction(()=>window.spatialSite);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.reading h1').count(),1);
  const canonical=await page.locator('link[rel=canonical]').getAttribute('href');
  assert.equal(canonical,'https://research.notelligent.app/'+rel);
  assert.match(await page.locator('meta[name=robots]').getAttribute('content'),/^index,follow/);
  const hero=page.locator('.reading .article-illustration img');await hero.evaluate(e=>e.decode());
  assert.equal(await hero.evaluate(e=>e.naturalWidth),1200);
  if(locale==='ja'&&(width===390||width===1440)) await page.screenshot({path:`${out}/${engine.name()}-${width}-opening.png`});
  const figs=[];
  for(const chapter of [1,3]) {
   const toggle=page.locator(`.reading .chapter-toggle[data-chapter="${chapter}"]`);
   if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
   const figure=page.locator(`.reading .chapter[data-chapter="${chapter}"] figure`);
   const fallback=page.locator('.reading figure').filter({visible:true});
   const target=await figure.count()?figure:fallback.last();
   await target.scrollIntoViewIfNeeded();
   const rect=await target.boundingBox();assert.ok(rect.width<=width);
   if(engine===chromium&&locale==='ja'&&(width===390||width===1440))await target.screenshot({path:`${out}/figure-${chapter}-${width}.png`});
   figs.push({chapter,width:rect.width});
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}: horizontal overflow`);
  assert.deepEqual(errors,[]);
  results.push({browser:engine.name(),width,locale,figures:figs,canonical,errors});await page.close();
 }}finally{await browser.close();}
}
const browser=await chromium.launch();try{const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.goto(server.base+'/');await page.waitForFunction(()=>window.spatialSite);await page.locator(`img[src*="${id}"]`).first().evaluate(e=>e.decode());await page.screenshot({path:`${out}/listing-390.png`});
 const catalog=JSON.parse(await readFile('public/assets/spatial/ja.json','utf8'));
 const topic=catalog.topics.find(t=>t.articles.includes(id)||t.articles.some?.(a=>a.id===id));
 await page.goto(server.base+catalog.paths.topics);await page.waitForFunction(()=>window.spatialSite);
 if(topic)await page.locator(`[data-select-topic="${topic.id}"]`).click();
 await page.locator(`img[src*="${id}"]`).first().evaluate(e=>e.decode());await page.screenshot({path:`${out}/topic-390.png`});
}finally{await browser.close();}
await writeFile(out+'/results.json',JSON.stringify(results,null,2)+'\n');console.log({cases:results.length,checks:'bilingual article, figures, hero, canonical, indexability, page errors, overflow, listing, topic'});
}finally{await server.close();}
