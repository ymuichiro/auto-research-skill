import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import {serveBuild} from './lib/test-server.mjs';
const server=await serveBuild(),out='output/timeline-preview',results=[];await mkdir(out,{recursive:true});
try{for(const engine of[chromium,webkit])for(const viewport of[{width:390,height:844},{width:360,height:664}]){
 const browser=await engine.launch(),context=await browser.newContext({viewport,hasTouch:true}),page=await context.newPage();
 try{
 await page.goto(server.base+'/');await page.waitForFunction(()=>window.spatialSite);await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>{
 window.previewFrames=[];window.samplePreview=true;
 function sample(){for(const n of document.querySelectorAll('.article-paper:not([aria-hidden=true])')){
 const preview=n.querySelector('.paper-preview'),copy=n.querySelector('.preview-copy'),image=n.querySelector('.preview-illustration'),r=n.getBoundingClientRect(),c=copy.getBoundingClientRect();
 window.previewFrames.push({fold:Number(n.style.getPropertyValue('--spatial-fold')),opacity:Number(getComputedStyle(preview).opacity),width:preview.offsetWidth,font:parseFloat(getComputedStyle(copy).fontSize),height:copy.offsetHeight,line:parseFloat(getComputedStyle(copy).lineHeight),copyBottom:c.bottom,cardBottom:r.bottom,imageHeight:image?.offsetHeight});
 }if(window.samplePreview)requestAnimationFrame(sample);}requestAnimationFrame(sample);
 });
 async function move(direction){
 if(engine===chromium){const cdp=await context.newCDPSession(page),x=viewport.width*.55,y=direction>0?viewport.height*.73:viewport.height*.3;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=16;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-direction*i*13}]});await page.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
 else{await page.mouse.move(viewport.width*.55,viewport.height*.5);for(let i=0;i<12;i++){await page.mouse.wheel(0,direction*20);await page.waitForTimeout(20);}}
 await page.waitForTimeout(250);
 }
 for(let i=0;i<4;i++)await move(1);
 assert.ok(await page.evaluate(()=>spatialSite.getState().progress)>.5,'native scrolling moves cards');
 await page.screenshot({path:`${out}/${engine.name()}-${viewport.width}-moving.png`});
 for(let i=0;i<3;i++)await move(-1);
 const frames=await page.evaluate(()=>{window.samplePreview=false;return window.previewFrames;});
 assert.ok(frames.some(f=>f.fold>.2)&&frames.some(f=>f.opacity>0&&f.opacity<1),'sample moving and fading surfaces');
 assert.ok(frames.filter(f=>f.fold>=.16).every(f=>f.opacity===0),'folding cards hide their summaries');
 const shown=frames.filter(f=>f.opacity>0);
 assert.ok(shown.every(f=>f.font===13&&f.height>=f.line-1),'visible summary text retains full line height');
 assert.ok(shown.every(f=>f.copyBottom<=f.cardBottom+2),'visible summary text fits inside the surface');
 assert.equal(new Set(frames.map(f=>f.width)).size,1,'summary width never reflows during movement');
 results.push({engine:engine.name(),viewport,frames:frames.length,status:'passed'});
 }finally{await context.close();await browser.close();}
}await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));console.log(results);}finally{await server.close();}
