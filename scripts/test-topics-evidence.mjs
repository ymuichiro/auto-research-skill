import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import {serveBuild} from './lib/test-server.mjs';
const out='output/topics-evidence';await mkdir(out,{recursive:true});const server=await serveBuild(),results=[];
const ready=async(page,url)=>{await page.goto(url);await page.waitForFunction(()=>window.spatialSite);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(350);};
try{for(const engine of[chromium,webkit]){const browser=await engine.launch();try{for(const locale of['ja','en']){
const c=JSON.parse(await readFile(`public/assets/spatial/${locale}.json`,'utf8'));
for(const viewport of[{width:1440,height:1000},{width:390,height:844},{width:360,height:664},{width:844,height:390}]){
 const name=`${engine.name()}-${locale}-${viewport.width}`,page=await browser.newPage({viewport,hasTouch:viewport.width<760}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await ready(page,server.base+c.paths.topics+'?topic=ai-workflows');
 const overview=page.locator('.topics-overview'),buttons=page.locator('.topic-selector button');assert.equal(await buttons.count(),c.topics.length);
 assert.ok(await buttons.evaluateAll(nodes=>nodes.every(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;})),'all topic selectors visible at once');
 const selected=c.topics.find(t=>t.id==='ai-workflows');assert.equal(await page.locator('.topic-article').count(),Math.min(4,selected.articles.length));
 assert.ok(await page.locator('.topic-article img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0)),'generated illustrations load');
 await page.screenshot({path:`${out}/${name}-topics.png`});
 await page.locator('[data-select-topic="ai-workflows"]').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.dataset.selectTopic),c.topics[Math.min(c.topics.findIndex(t=>t.id==='ai-workflows')+1,c.topics.length-1)].id);await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('[data-select-topic="ai-workflows"]').getAttribute('aria-pressed'),'true');
 for(const t of c.topics){await page.locator(`[data-select-topic="${t.id}"]`).click();assert.equal(await page.locator(`[data-select-topic="${t.id}"]`).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.topic-article').count(),Math.min(4,t.articles.length));
 const expected=t.articles.map(id=>c.articles.find(a=>a.id===id)).sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id)).slice(0,4).map(a=>a.id);assert.deepEqual(await page.locator('.topic-article [data-read]').evaluateAll(nodes=>nodes.map(n=>n.dataset.read)),expected);
 }
 await page.locator('[data-select-topic="ai-workflows"]').click();const id=await page.locator('.topic-article [data-read]').first().getAttribute('data-read');await page.locator('.topic-article [data-read]').first().click();await page.waitForFunction(()=>spatialSite.getState().mode==='read');assert.equal(await page.evaluate(()=>spatialSite.getState().article),id);await page.goBack();await page.waitForFunction(()=>spatialSite.getState().mode==='topics');assert.equal(await page.locator('[data-select-topic="ai-workflows"]').getAttribute('aria-pressed'),'true');
 await ready(page,server.base+c.articles[0].url+'#sources');const source=page.locator('.reading .evidence-chapter .source-row');assert.ok(await source.count()>0);
 assert.ok(await source.evaluateAll(nodes=>nodes.every(e=>{const s=getComputedStyle(e);return parseFloat(s.borderTopWidth)===0&&parseFloat(s.borderBottomWidth)===0&&parseFloat(s.borderRadius)===0&&s.textDecorationLine==='none';})),'sources have no card frame or full-row underline');
 assert.ok(await source.evaluateAll(nodes=>nodes.every(e=>{const r=e.getBoundingClientRect(),p=e.closest('.chapter-body').getBoundingClientRect();return r.left>=p.left&&r.right<=p.right+1&&e.scrollWidth<=e.clientWidth+1;})),'source links fit reading column');
 assert.ok(await page.locator('.reading .evidence-heading').first().evaluate(e=>{const title=e.querySelector('h2').getBoundingClientRect(),copy=e.querySelector('p').getBoundingClientRect();return title.height<50&&copy.top>=title.bottom;}),'evidence title is above its explanation');
 await page.screenshot({path:`${out}/${name}-evidence.png`});assert.deepEqual(errors,[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));results.push({name,passed:true});
 }finally{await page.close();}
}}}finally{await browser.close();}}
await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));console.log(results);
}finally{await server.close();}
