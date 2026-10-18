import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const url=process.env.PROTOTYPE_URL??'http://localhost:4174/';
const out=new URL('../../output/spatial-reader/',import.meta.url).pathname;
const results=[];
for(const engine of [chromium,webkit]){
  const browser=await engine.launch();
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  page.on('pageerror',error=>console.log(engine.name(),error.message));
  await page.goto(url);await page.waitForFunction(()=>window.spatialPrototype);await page.evaluate(()=>document.fonts.ready);
  const initial=await page.evaluate(()=>spatialPrototype.getState());
  assert.equal(initial.reduced,true);
  await page.keyboard.press('ArrowDown');await page.waitForTimeout(100);
  assert.notEqual((await page.evaluate(()=>spatialPrototype.getState())).focus,initial.focus);
  await page.keyboard.press('ArrowUp');await page.waitForTimeout(100);
  assert.equal((await page.evaluate(()=>spatialPrototype.getState())).focus,initial.focus);
  await page.keyboard.press('Enter');await page.waitForTimeout(100);
  assert.equal((await page.evaluate(()=>spatialPrototype.getState())).mode,'month');
  await page.keyboard.press('Enter');await page.waitForTimeout(100);
  assert.equal((await page.evaluate(()=>spatialPrototype.getState())).mode,'read');
  await page.locator('.reading [data-action=toc]').click();
  await page.locator('.reading [data-chapter="2"] .chapter-toggle').press('Enter');
  assert.equal((await page.evaluate(()=>spatialPrototype.getState())).chapter,2);
  const transitions=await page.locator('.reading').evaluate(e=>getComputedStyle(e).transitionDuration);
  assert.ok(transitions.split(',').every(v=>parseFloat(v)===0));
  await page.keyboard.press('Escape');await page.waitForTimeout(100);
  assert.equal((await page.evaluate(()=>spatialPrototype.getState())).mode,'month');
  const focus=await page.evaluate(()=>spatialPrototype.getState().focus);
  await page.locator('.article-paper[data-front=true] .read-button').focus();
  await page.keyboard.press('Enter');await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>spatialPrototype.getState().article),focus);
  // Width changes preserve the selected article, chapter and usable body.
  for(const [width,height] of [[768,1024],[360,664],[1440,900],[390,844]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(130);
    const metrics=await page.locator('.reading .chapter.active .chapter-body').evaluate(e=>({h:e.clientHeight,w:e.clientWidth}));
    assert.ok(metrics.h>=100&&metrics.w>=200,`${engine.name()} ${width}x${height} body ${JSON.stringify(metrics)}`);
    assert.equal(await page.evaluate(()=>spatialPrototype.getState().article),focus);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.setViewportSize({width:1440,height:900});
  await page.goto(new URL('review.html',url).href);
  const preview=page.frameLocator('iframe');
  await preview.locator('.month-paper[data-front=true] .month-open').click();
  await preview.locator('.article-paper[data-front=true] .read-button').click();await page.waitForTimeout(800);
  for(const [name,width] of [['デスクトップ',1440],['小型スマートフォン',360],['スマートフォン',390]]){
    await page.getByRole('button',{name,exact:true}).click();await page.waitForTimeout(150);
    assert.equal(Number(await page.locator('iframe').getAttribute('width')),width);
    assert.ok(await preview.locator('.reading').isVisible());
  }
  results.push({engine:engine.name(),reducedMotion:true,keyboard:'arrows, enter, escape, focus',resize:'768x1024,360x664,1440x900,390x844',status:'passed'});
  await browser.close();
}
const browser=await chromium.launch();
const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
await page.goto(url);assert.ok(await page.getByRole('link',{name:'公開版のタイムライン'}).isVisible());
results.push({javascript:false,fallback:'public timeline link visible',status:'passed'});
await browser.close();
await writeFile(out+'accessibility-verification.json',JSON.stringify(results,null,2));
console.log(results);
