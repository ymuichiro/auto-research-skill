import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import {serveBuild} from './lib/test-server.mjs';
const server=await serveBuild(),out='output/chapter-scroll';await mkdir(out,{recursive:true});const results=[];
try{for(const [engine,mobile] of [[chromium,false],[webkit,false],[chromium,true],[webkit,true]]){
 const name=`${engine.name()}-${mobile?'mobile':'desktop'}`,browser=await engine.launch();
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},hasTouch:mobile,isMobile:mobile&&engine===chromium});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto(server.base+'/2026-10-11-agentic-commerce-purchase-and-payment-authorization.html');await page.waitForFunction(()=>window.spatialSite);await page.waitForTimeout(800);
 const reader=page.locator('.reading');
 assert.ok(await reader.evaluate(e=>e.scrollHeight>e.clientHeight),'whole article is one scroll surface');
 assert.ok(await page.locator('.reading .chapter-body').evaluateAll(es=>es.every(e=>getComputedStyle(e).overflowY==='visible'&&e.scrollHeight<=e.clientHeight+2)),'chapters have no nested scroll viewport');
 const second=page.locator('.reading .chapter[data-chapter="1"]'),before=await second.evaluate(e=>e.getBoundingClientRect().top);
 if(mobile&&engine===chromium){
 const cdp=await context.newCDPSession(page),r=await reader.boundingBox(),x=r.x+r.width*.5,y=r.y+r.height*.75;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*25}]});await page.waitForTimeout(20);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 }else{const r=await reader.boundingBox();await page.mouse.move(r.x+r.width*.5,r.y+r.height*.7);await page.mouse.wheel(0,500);}
 await page.waitForFunction(()=>document.querySelector('.reading').scrollTop>20);
 assert.ok(await second.evaluate(e=>e.getBoundingClientRect().top)<before,'next chapter flows upwards with native scroll');
 assert.equal(await page.evaluate(()=>spatialSite.getState().chapter),0,'scroll does not switch chapters');
 assert.ok(await page.locator('.reading .chapter').evaluateAll(es=>es.every(e=>!e.style.transform)),'no bounce transforms');
 await second.locator('button').click();assert.equal(await second.locator('button').getAttribute('aria-expanded'),'false');assert.equal(await second.locator('.chapter-body').isVisible(),false);
 await second.locator('button').click();assert.equal(await second.locator('button').getAttribute('aria-expanded'),'true');assert.ok(await second.locator('.chapter-body').isVisible());
 await page.screenshot({path:`${out}/${name}-native.png`});
 await page.locator('.reading [data-action=toc]').click();await page.locator('.reading [data-chapter="3"] button').click();assert.equal(new URL(page.url()).hash,'#section-4');
 assert.deepEqual(errors,[]);results.push({name,passed:true});
 }finally{await context.close();await browser.close();}
}await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));console.log(results);}finally{await server.close();}
