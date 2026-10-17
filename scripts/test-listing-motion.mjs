import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import {serveBuild} from './lib/test-server.mjs';
const args=process.argv.slice(2),option=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const selected=option('--engine','all');assert(['all','chromium','webkit'].includes(selected));
const server=args.includes('--base-url')?null:await serveBuild(),base=option('--base-url',server?.base);
const output=option('--output','output/pinned-news');await mkdir(output,{recursive:true});
const results=[];
const frames=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function ready(p){await p.evaluate(()=>document.fonts.ready);await frames(p);}
async function geometry(scene){return scene.evaluate(e=>({
  start:e.getBoundingClientRect().top+scrollY-parseFloat(e.style.getPropertyValue('--scene-top')),
  step:(parseFloat(e.style.getPropertyValue('--scene-span'))-parseFloat(e.style.getPropertyValue('--scene-height')))/(e.querySelectorAll('[data-listing-motion]').length-1+.45)
}));}
async function move(p,scene,value){const g=await geometry(scene);await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),g.start+g.step*value);await frames(p);}
async function state(scene){return scene.evaluate(e=>{
  const frame=e.querySelector('.news-viewport').getBoundingClientRect();
  return {scrollY,top:frame.top,left:frame.left,width:frame.width,height:frame.height,progress:Number(e.dataset.sceneProgress),
    nodes:[...e.querySelectorAll('[data-listing-motion]')].slice(0,4).map(node=>{
      const surface=node.querySelector('.editorial-briefing')??node;
      return {scale:new DOMMatrix(getComputedStyle(node).transform).a,opacity:getComputedStyle(node).opacity,
        y:new DOMMatrix(getComputedStyle(node).transform).f,front:node.dataset.sceneFront,top:surface.getBoundingClientRect().top,
        fits:surface.scrollHeight<=surface.clientHeight+1,client:surface.clientHeight,scroll:surface.scrollHeight};
    })};
});}
try{for(const [engine,type]of[['chromium',chromium],['webkit',webkit]]){
  if(selected!=='all'&&selected!==engine)continue;
  const browser=await type.launch();
  try{for(const [width,height]of[[360,664],[390,844],[768,900],[1440,900]])for(const locale of['ja','en']){
    const mobile=width<768,context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'no-preference'});
    const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto(`${base}/${locale==='en'?'en/':''}`);await ready(p);
    if(mobile)assert(await p.evaluate(()=>matchMedia('(pointer: coarse)').matches&&'ontouchstart'in window));
    const topic=await p.locator('.topic-card .text-link').first().getAttribute('href');
    const next=await p.locator('.pagination-edge[href]').last().getAttribute('href');
    for(const [kind,url]of[['home',null],['page-2',next],['topic',topic]]){
      if(url){await p.goto(new URL(url,base).href);await ready(p);}
      const scene=p.locator('[data-news-sequence]');
      assert.equal(await scene.getAttribute('data-scene-mode'),'pinned',`${engine} ${width} ${locale} ${kind}: ${await scene.evaluate(e=>JSON.stringify({style:e.getAttribute('style'),header:document.querySelector('.site-header').clientHeight,natural:[...e.querySelectorAll('[data-listing-motion]')].map(n=>n.parentElement.getBoundingClientRect().height)}))}`);
      const contents=await scene.locator('[data-listing-motion]').evaluateAll(nodes=>nodes.map(n=>n.textContent));
      const samples=[];
      for(const value of[.1,.4,.6,.8,1.1,1.6,2.1]){await move(p,scene,value);samples.push(await state(scene));}
      assert(samples.at(-1).scrollY-samples[0].scrollY>400,'The browser really scrolls while its scene stays fixed');
      for(const sample of samples){
        assert(Math.abs(sample.top-samples[0].top)<1,'Pinned frame must NOT travel upward with page scroll');
        assert.equal(sample.left,samples[0].left);assert.equal(sample.width,samples[0].width);
      }
      assert(samples[2].nodes[0].scale<samples[1].nodes[0].scale,'Foreground recedes with input');
      assert(samples[2].nodes[1].y<samples[1].nodes[1].y,'Incoming card rises within the fixed frame');
      assert(samples[2].nodes[1].scale>samples[1].nodes[1].scale);
      for(const [sample,index]of[[samples[0],0],[samples[4],1],[samples[6],2]]){
        assert.equal(sample.nodes[index].scale,1);assert.equal(sample.nodes[index].opacity,'1');
        assert(sample.nodes[index].fits,`${engine} ${width} ${locale} ${kind} card ${index}: ${JSON.stringify(sample.nodes[index])}`);
        assert(Math.abs(sample.nodes[index].top-samples[0].nodes[0].top)<1,'Each new reading card settles into the SAME screen position');
      }
      await move(p,scene,.6);assert.deepEqual((await state(scene)).nodes,samples[2].nodes,'Reverse precisely rewinds');
      const stopped=await state(scene);await p.waitForTimeout(100);assert.deepEqual(await state(scene),stopped,'Stopped input stops animation');
      if(locale==='ja')await p.screenshot({path:`${output}/${engine}-${width}-${kind}-transition.png`});
      await move(p,scene,1.1);
      const front=scene.locator('[data-scene-front="true"]');
      assert.equal(await front.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
      assert(await front.evaluate(el=>el.scrollHeight<=el.clientHeight+1),'Reading content must fit rather than be clipped');
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      assert.deepEqual(await scene.locator('[data-listing-motion]').evaluateAll(nodes=>nodes.map(n=>n.textContent)),contents);
      if(locale==='ja')await p.screenshot({path:`${output}/${engine}-${width}-${kind}-reading.png`});
      results.push({engine,version:browser.version(),width,height,mobile,locale,kind,samples});
    }
    const scene=p.locator('[data-news-sequence]');await move(p,scene,1.1);
    const listUrl=p.url(),before=await state(scene),card=scene.locator('[data-scene-front="true"]');
    const target=await card.getAttribute('href');assert(target);
    await(mobile?card.tap():card.click());await p.waitForURL(new URL(target,base).href);await p.waitForFunction(()=>history.state?.articleStream===true);
    await p.goBack();await p.waitForURL(listUrl);await ready(p);
    await p.waitForFunction(value=>Math.abs(Number(document.querySelector('[data-news-sequence]').dataset.sceneProgress)-value)<.01,before.progress);
    await p.reload();await ready(p);
    await p.waitForFunction(value=>Math.abs(Number(document.querySelector('[data-news-sequence]').dataset.sceneProgress)-value)<.01,before.progress);
    // Runtime accessibility changes keep the selected article and ordinary flow.
    await p.emulateMedia({reducedMotion:'reduce'});await frames(p);
    assert.equal(await scene.getAttribute('data-scene-mode'),'static');
    assert(await scene.locator('[data-listing-motion]').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).transform==='none'&&getComputedStyle(n).opacity==='1')));
    await p.emulateMedia({reducedMotion:'no-preference'});await frames(p);
    assert.equal(await scene.getAttribute('data-scene-mode'),'pinned');
    await p.keyboard.press('Tab');
    const far=scene.locator('[data-listing-motion]').nth(3);await far.focus();await frames(p);
    await p.waitForFunction(()=>document.activeElement?.dataset.sceneFront==='true');
    assert.equal(await far.getAttribute('data-scene-front'),'true','Keyboard can select a card outside the visible layers');
    assert.equal(await far.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a),1);
    const farTarget=await far.getAttribute('href');
    await p.keyboard.press('Enter');await p.waitForURL(new URL(farTarget,base).href);
    // Navigate back explicitly after verifying the article stream initialized.
    await p.waitForFunction(()=>history.state?.articleStream===true);await p.goBack();await p.waitForURL(listUrl);await ready(p);
    await p.setViewportSize({width:844,height:390});await ready(p);
    assert.equal(await scene.getAttribute('data-scene-mode'),'static','Short landscape/zoom views keep every item readable');
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(width===390&&locale==='ja'){
      await p.addInitScript(()=>{
        const original=document.fonts.ready;let release;
        const held=new Promise(resolve=>{release=resolve;});
        Object.defineProperty(document.fonts,'ready',{get:()=>Promise.all([original,held])});
        window.releaseSceneFonts=release;
      });
      await p.reload();await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';});
      await p.keyboard.press('PageDown');await p.waitForTimeout(500);
      const y=await p.evaluate(()=>scrollY);
      await p.evaluate(()=>window.releaseSceneFonts());await p.waitForTimeout(150);
      assert(Math.abs(await p.evaluate(()=>scrollY)-y)<2,'Input cancels delayed restoration');
    }
    assert.deepEqual(errors,[]);await context.close();console.log(`${engine} ${width}px ${locale}: fixed frame, scrub/reverse/stop and navigation passed`);
  }
  const fallback=await browser.newPage({viewport:{width:360,height:664},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
  await fallback.route(/fonts\.(googleapis|gstatic)\.com/,route=>route.abort());
  await fallback.goto(base);await ready(fallback);
  assert.equal(await fallback.locator('[data-news-sequence]').getAttribute('data-scene-mode'),'pinned','Web-font failure must not silently disable a normal phone scene');
  assert(await fallback.locator('.site-header').evaluate(e=>e.clientHeight<80),'Fallback font keeps the closed mobile header in one row');
  await fallback.close();
  const p=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});await p.goto(base);
  const card=p.locator('[data-listing-motion="card"]').first(),target=await card.getAttribute('href');
  assert.equal(await p.locator('.is-pinned').count(),0);await p.evaluate(()=>document.fonts.ready);
  await card.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await card.click({noWaitAfter:true});await p.waitForURL(new URL(target,base).href,{waitUntil:'domcontentloaded'});await p.close();
  }finally{await browser.close();}
}}finally{await server?.close();}
await writeFile(`${output}/report.json`,JSON.stringify({boundary:'Browser mobile/touch emulation; not physical phone validation',results},null,2));
console.log(`${results.length} pinned-scene cases passed; stationary frame and reading coordinates, scrub, reverse, stop, history, reduced motion, keyboard, landscape and no-JS.`);
