import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import {serveBuild} from './lib/test-server.mjs';
const server=await serveBuild(),results=[];
const publishedCount=JSON.parse(await readFile('public/assets/spatial/ja.json','utf8')).articles.length;
await mkdir('output/spatial-site',{recursive:true});
try{
  for(const engine of [chromium,webkit]){
    const browser=await engine.launch();
    try{
      for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]){
        const page=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
        await page.goto(server.base+'/');await page.waitForFunction(()=>window.spatialSite);await page.evaluate(()=>document.fonts.ready);
        assert.equal(await page.evaluate(()=>spatialSite.getState().list.length),publishedCount,'home exposes every published article');
        const homeFirst=await page.evaluate(()=>spatialSite.getState().focus);
        await page.keyboard.press('ArrowDown');await page.waitForFunction(first=>spatialSite.getState().focus!==first,homeFirst);
        await page.goto(server.base+'/timeline/');await page.waitForFunction(()=>window.spatialSite);await page.evaluate(()=>document.fonts.ready);
        const first=await page.evaluate(()=>spatialSite.getState().focus);
        await page.keyboard.press('ArrowDown');await page.waitForFunction(first=>spatialSite.getState().focus!==first,first);
        await page.keyboard.press('ArrowUp');await page.waitForFunction(first=>spatialSite.getState().focus===first,first);
        await page.keyboard.press('Enter');await page.waitForFunction(()=>spatialSite.getState().mode==='read');
        assert.ok((await page.locator('.reading').evaluate(e=>getComputedStyle(e).transitionDuration)).split(',').every(v=>parseFloat(v)===0));
        await page.locator('.reading [data-action=toc]').focus();await page.keyboard.press('Enter');
        await page.locator('.reading [data-chapter="2"] .chapter-toggle').focus();await page.keyboard.press('Enter');
        assert.equal(await page.evaluate(()=>spatialSite.getState().chapter),2);
        assert.equal(new URL(page.url()).hash,'#section-3');
        // Native same-document navigation must also work when no reload occurs.
        await page.goto(page.url().replace('#section-3','#section-2'));
        await page.waitForFunction(()=>spatialSite.getState().chapter===1);
        await page.locator('.spatial-skip').focus();await page.keyboard.press('Enter');
        assert.ok(await page.locator('.reading .chapter.active .chapter-body').evaluate(e=>e===document.activeElement));
        await page.locator('#spatial-app [data-action=menu]').focus();await page.keyboard.press('Enter');
        assert.ok(await page.locator('.spatial-menu').evaluate(e=>e.open));
        const destinations=await page.locator('.spatial-menu a').evaluateAll(links=>links.map(link=>link.href));
        assert.equal(new Set(destinations).size,destinations.length,'menu has no duplicate destinations');
        await page.keyboard.press('Escape');assert.ok(!(await page.locator('.spatial-menu').evaluate(e=>e.open)));
        const current=await page.evaluate(()=>spatialSite.getState().article);
        for(const size of [{width:360,height:664},{width:768,height:1024},viewport]){
          await page.setViewportSize(size);await page.waitForTimeout(120);
          assert.equal(await page.evaluate(()=>spatialSite.getState().article),current);
          const height=await page.locator('.reading .chapter.active .chapter-body').evaluate(e=>e.clientHeight);
          assert.ok(height>=70,`${engine.name()} ${JSON.stringify(size)} body ${height}`);
        }
        await page.keyboard.press('Escape');await page.waitForFunction(()=>spatialSite.getState().mode==='read'&&spatialSite.getState().chapter===2);
        await page.keyboard.press('Escape');await page.waitForFunction(()=>spatialSite.getState().mode==='timeline');
        assert.deepEqual(errors,[]);
        results.push({engine:engine.name(),viewport,reducedMotion:true,keyboard:'arrows, enter, chapter, native hash, skip, dialog, escape',resize:true,status:'passed'});
        await page.close();
      }
    }finally{await browser.close();}
  }
}finally{await server.close();await writeFile('output/spatial-site/accessibility.json',JSON.stringify(results,null,2));}
console.log(results.length,'reduced-motion / keyboard / resize flows passed');
