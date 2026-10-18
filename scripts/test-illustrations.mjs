import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import {serveBuild} from './lib/test-server.mjs';
const server=await serveBuild(),out='output/illustrations';await mkdir(out,{recursive:true});const results=[];
try{for(const engine of[chromium,webkit]){const browser=await engine.launch();try{for(const width of[1440,390]){const page=await browser.newPage({viewport:{width,height:width===390?844:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));let checks=0;
for(const locale of['ja','en']){const c=JSON.parse(await readFile(`public/assets/spatial/${locale}.json`,'utf8'));
for(const a of c.articles){await page.goto(server.base+a.url);await page.waitForFunction(()=>window.spatialSite);const image=page.locator('.reading .article-illustration img');assert.equal(await image.count(),1,`${a.id}: opening chapter has one illustration`);await image.evaluate(e=>e.decode());assert.ok((await image.getAttribute('src')).endsWith(a.illustration));assert.ok(await image.evaluate(e=>{const r=e.getBoundingClientRect(),body=e.closest('.chapter-body');return e.naturalWidth===1200&&r.width<=body.clientWidth&&getComputedStyle(e).objectFit==='contain';}),`${a.id}: illustration is loaded and fits`);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks++;
if(locale==='ja'&&a.id===c.articles[0].id)await page.screenshot({path:`${out}/${engine.name()}-${width}-article.png`});}
await page.goto(server.base+c.paths.topics);await page.waitForFunction(()=>window.spatialSite);const categoryImages=page.locator('.topic-selector img');assert.equal(await categoryImages.count(),c.topics.length);await categoryImages.evaluateAll(images=>Promise.all(images.map(i=>i.decode())));assert.equal(new Set(await categoryImages.evaluateAll(images=>images.map(i=>i.src))).size,c.topics.length);
for(const t of c.topics){await page.locator(`[data-select-topic="${t.id}"]`).click();await page.locator('.topic-article img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));assert.equal(await page.locator('.topic-article img').count(),Math.min(4,t.articles.length));checks++;}
if(locale==='ja')await page.screenshot({path:`${out}/${engine.name()}-${width}-topics.png`});}
assert.deepEqual(errors,[]);results.push({browser:engine.name(),width,checks});await page.close();}}finally{await browser.close();}}
await writeFile(`${out}/browser-results.json`,JSON.stringify(results,null,2));console.log(results);
}finally{await server.close();}
