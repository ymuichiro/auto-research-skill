import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import {serveBuild} from './lib/test-server.mjs';
const server=await serveBuild(),out='output/chapter-scroll';await mkdir(out,{recursive:true});const results=[];
try{
for(const [engine,mobile] of [[chromium,false],[webkit,false],[chromium,true]]){
 const name=`${engine.name()}-${mobile?'touch':'wheel'}`,browser=await engine.launch();
 const viewport=mobile?{width:390,height:844}:{width:1440,height:1100};
 const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,recordVideo:{dir:`${out}/videos`,size:viewport}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));const chapter=()=>page.evaluate(()=>spatialSite.getState().chapter);
 const body=page.locator('.reading .chapter.active .chapter-body');
 async function wheel(delta,count=1){const r=await body.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);for(let i=0;i<count;i++){await page.mouse.wheel(0,delta);await page.waitForTimeout(40);}}
 async function swipe(delta,shot){const r=await body.boundingBox(),cdp=await context.newCDPSession(page),x=r.x+r.width*.6,y=delta>0?r.y+r.height*.85:r.y+r.height*.15;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=16;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-delta*i/16}]});await page.waitForTimeout(20);if(shot&&i===4){assert.equal(await chapter(),0);assert.match(await page.locator('.reading .chapter.next').getAttribute('style'),/translateY/);await page.screenshot({path:`${out}/${name}-pull.png`});}}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();await page.waitForTimeout(450);}
 try{
 await page.goto(server.base+'/2026-10-11-agentic-commerce-purchase-and-payment-authorization.html');await page.waitForFunction(()=>window.spatialSite);await page.waitForTimeout(700);
 await page.screenshot({path:`${out}/${name}-before.png`});assert.equal(await chapter(),0);
 if(!mobile)assert.ok(await page.locator('.reading .chapter.active').evaluate(e=>{const content=e.querySelector('.chapter-content').getBoundingClientRect(),next=e.nextElementSibling.getBoundingClientRect();return next.top-content.bottom<35;}),'short chapter keeps next heading adjacent');
 // Read to the edge with actual input; reaching the edge alone must not skip chapters.
 if(mobile){for(let i=0;i<12&&await body.evaluate(e=>e.scrollTop<e.scrollHeight-e.clientHeight-2);i++)await swipe(180);}else await wheel(1200);
 await page.waitForTimeout(350);assert.equal(await chapter(),0);
 if(mobile){await swipe(50);assert.equal(await chapter(),0);await swipe(220,true);}else{
 await wheel(35);assert.equal(await chapter(),0);assert.match(await page.locator('.reading .chapter.next').getAttribute('style'),/translateY/);await page.screenshot({path:`${out}/${name}-pull.png`});await page.waitForTimeout(450);assert.equal(await page.locator('.reading .chapter.next').evaluate(e=>e.style.transform),'');await wheel(65,6);
 }
 await page.waitForFunction(()=>spatialSite.getState().chapter===1);if(!mobile){await wheel(65,5);assert.equal(await chapter(),1);}await page.waitForTimeout(450);assert.equal(await chapter(),1);await page.screenshot({path:`${out}/${name}-after.png`});
 if(!mobile){await page.waitForTimeout(650);await wheel(-65,5);}else await swipe(-220);
 await page.waitForFunction(()=>spatialSite.getState().chapter===0);assert.equal(await chapter(),0);assert.ok(new URL(page.url()).hash);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(650);
 if(mobile)await swipe(220);else await wheel(65,5);
 await page.waitForFunction(()=>spatialSite.getState().chapter===1);
 await page.getByRole('button',{name:'目次',exact:true}).click();await page.locator('.reading [data-chapter="0"] button').click();assert.equal(await chapter(),0);assert.deepEqual(errors,[]);results.push({name,passed:true});
 }finally{await context.close();await browser.close();}
}
await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));console.log(results);
}finally{await server.close();}
