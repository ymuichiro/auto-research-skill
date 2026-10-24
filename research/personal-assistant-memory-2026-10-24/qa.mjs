import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
const out='research/personal-assistant-memory-2026-10-24/qa';
const id='2026-10-24-personal-assistant-memory-and-agent-coordination';
const results=[];
await mkdir(out,{recursive:true});
for(const engine of [chromium,webkit]) {
  const browser=await engine.launch();
  try {
    for(const width of [360,390,768,1440]) for(const locale of ['ja','en']) {
      const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(`http://127.0.0.1:4177/${locale==='en'?'en/':''}${id}.html`);
      await page.waitForFunction(()=>window.spatialSite);
      await page.evaluate(()=>document.fonts.ready);
      assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/);
      assert.equal(await page.locator('.reading h1').count(),1);
      const figures=[];
      for(const [name,chapter] of [['coordination',0],['decision',4]]) {
        const toggle=page.locator(`.reading .chapter-toggle[data-chapter="${chapter}"]`);
        if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
        const svg=page.locator(`.reading svg[aria-labelledby*="${name}-${locale}-title"]`);
        assert.equal(await svg.count(),1);
        await svg.scrollIntoViewIfNeeded();
        const checks=await svg.evaluate(el=>{
          const v=el.viewBox.baseVal,r=el.getBoundingClientRect();
          return {
            width:r.width,
            minFont:Math.min(...[...el.querySelectorAll('text')].map(t=>Number(t.getAttribute('font-size'))*r.width/v.width)),
            outside:[...el.querySelectorAll('text')].filter(t=>{
              const b=t.getBBox();
              return b.x<0||b.x+b.width>v.width||b.y<0||b.y+b.height>v.height;
            }).map(t=>t.textContent)
          };
        });
        assert.deepEqual(checks.outside,[],`${engine.name()} ${locale} ${width} ${name}: SVG labels overflow`);
        assert.ok(checks.minFont>=11,`${width}: diagram text ${checks.minFont} below 11px`);
        figures.push({name,...checks});
        if(engine===chromium&&locale==='ja'&&(width===390||width===1440)) {
          await svg.locator('..').screenshot({path:`${out}/${name}-${width}.png`});
        }
      }
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}: horizontal overflow`);
      if(locale==='ja'&&(width===390||width===1440)) {
        await page.screenshot({path:`${out}/${engine.name()}-article-${width}.png`});
      }
      assert.deepEqual(errors,[]);
      results.push({engine:engine.name(),width,locale,figures,noindex:true,pageErrors:errors});
      await page.close();
    }
  } finally {await browser.close();}
}
await writeFile(`${out}/browser-results.json`,JSON.stringify(results,null,2)+'\n');
console.log({cases:results.length,checks:'noindex, diagrams, SVG text bounds, minimum font size, horizontal overflow, page errors'});
