import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import {serveBuild} from './lib/test-server.mjs';
const server=await serveBuild(),out='output/navigation-drawer',results=[];await mkdir(out,{recursive:true});
try{for(const engine of[chromium,webkit])for(const viewport of[{width:1440,height:900},{width:390,height:844},{width:360,height:664}]){
 const browser=await engine.launch(),page=await browser.newPage({viewport});
 try{
 await page.goto(server.base+'/');await page.waitForFunction(()=>window.spatialSite);
 const toggle=page.locator('[data-action=menu]'),drawer=page.locator('.spatial-menu');
 await toggle.click();await page.waitForTimeout(260);
 const r=await drawer.boundingBox();assert.ok(Math.abs(r.x+r.width-viewport.width)<2&&Math.abs(r.y)<2&&Math.abs(r.height-viewport.height)<2,'right-aligned full-height drawer');
 assert.ok(r.width<viewport.width&&r.width<=321);assert.equal(await toggle.getAttribute('aria-expanded'),'true');
 assert.ok(await drawer.evaluate(e=>e.contains(document.activeElement)),'focus starts in drawer');
 for(let i=0;i<5;i++){await page.keyboard.press('Tab');assert.ok(await drawer.evaluate(e=>e.contains(document.activeElement)),`keyboard focus remains in drawer: ${engine.name()} ${viewport.width} ${await page.evaluate(()=>document.activeElement.outerHTML.slice(0,200))}`);}
 await page.screenshot({path:`${out}/${engine.name()}-${viewport.width}.png`});
 await page.mouse.click(Math.max(2,r.x/2),viewport.height/2);await page.waitForFunction(()=>!document.querySelector('.spatial-menu').open);
 await page.waitForFunction(()=>document.activeElement===document.querySelector('[data-action=menu]'),'closing restores menu focus');
 await toggle.click();await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.spatial-menu').open);
 await toggle.click();await page.locator('[data-action=close-menu]').click();await page.waitForFunction(()=>!document.querySelector('.spatial-menu').open);
 await page.emulateMedia({reducedMotion:'reduce'});await toggle.click();assert.equal(await drawer.evaluate(e=>e.getAnimations().length),0);
 await drawer.locator('a').filter({hasText:'トピック'}).click();await page.waitForFunction(()=>window.spatialSite?.getState().mode==='topics');
 assert.ok(!(await drawer.evaluate(e=>e.open)),'navigation closes drawer');
 results.push({engine:engine.name(),viewport,status:'passed'});
 }finally{await page.close();await browser.close();}
}await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));console.log(results);}finally{await server.close();}
