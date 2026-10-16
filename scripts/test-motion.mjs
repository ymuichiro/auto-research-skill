import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { sampleMotion } from '../src/assets/article-motion.js';
import { serveBuild } from './lib/test-server.mjs';

for (const height of [640,844,900]) {
  const line = Math.min(height * .3,220);
  const samples = Array.from({length:11},(_,i)=>sampleMotion({top:height-(height-line)*i/10,bottom:10000},height));
  samples.slice(1).forEach((sample,i)=>assert(sample.scale > samples[i].scale));
  assert.equal(samples.at(-1).scale,1);
  assert.equal(sampleMotion({top:line-1,bottom:line+1},height).scale,1,'Even a short article settles flat');
  assert.deepEqual(sampleMotion({top:height,bottom:height+20},height),sampleMotion({top:height,bottom:height+10000},height),'Arrival is independent of article length');
}
const preview = await serveBuild();
const output = 'output/epic-motion/20';
await mkdir(output,{recursive:true});
const records=[];
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
try {
  for (const [engine,type,executablePath] of [['chromium',chromium,process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE]]) {
    const browser=await type.launch({...executablePath?{executablePath}:{}});
    try {
      for (const width of [360,390,768,1440]) for (const locale of ['ja','en']) {
        const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
        const errors=[];page.on('pageerror',e=>errors.push(e.message));
        await page.goto(`${preview.base}/${locale==='en'?'en/':''}2026-07-11-agent-evaluation-measures-execution-path.html`);
        await page.evaluate(()=>document.fonts.ready);
        const boundary=page.locator('[data-next-url]').first();
        const id=await boundary.getAttribute('data-next-id');
        await boundary.scrollIntoViewIfNeeded();
        const article=page.locator(`[data-article-id="${id}"]`);await article.waitFor();
        const top=await article.evaluate(el=>el.parentElement.getBoundingClientRect().top+scrollY);
        const states=[];
        for(const target of [820,650,450,200]){
          await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),top-target);await frames(page);
          states.push(await article.evaluate(el=>{const t=new DOMMatrix(getComputedStyle(el).transform);return {scale:t.a,y:t.f,opacity:Number(getComputedStyle(el).opacity),top:el.parentElement.getBoundingClientRect().top+scrollY,phase:el.dataset.motionPhase};}));
          assert(Math.abs(states.at(-1).top-top)<1,'Transforms must not move layout geometry');
        }
        states.slice(1).forEach((state,i)=>assert(state.scale>states[i].scale,`${engine} ${width} ${locale}: motion follows scroll continuously`));
        assert.equal(states.at(-1).scale,1,'Reading plane is flat');
        assert.equal(states.at(-1).opacity,1);
        await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),top-650);await frames(page);
        const reversed=await article.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a);
        assert(Math.abs(reversed-states[1].scale)<.001,'Reverse scrolling restores the same depth');
        await page.waitForTimeout(100);
        assert.equal(await article.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a),reversed,'Motion stops with scrolling');
        if(locale==='ja'&&[390,1440].includes(width))await page.screenshot({path:`${output}/${engine}-${width}-arrival.png`});
        assert.deepEqual(errors,[]);
        records.push({engine,width,locale,states,reversed});await page.close();
      }
    } finally {await browser.close();}
  }
} finally {await preview.close();}
await writeFile(`${output}/report.json`,JSON.stringify(records,null,2));
console.log(`${records.length} engine/width/language combinations: continuous arrival, stable geometry, reverse and stop passed.`);
