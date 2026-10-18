import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,mkdtemp,copyFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {chromium,webkit} from 'playwright';
import {serveBuild} from './lib/test-server.mjs';
const out='output/spatial-site';await mkdir(out,{recursive:true});
const results=[],server=await serveBuild();
const catalogs=Object.fromEntries(await Promise.all(['ja','en'].map(async l=>[l,JSON.parse(await readFile(`public/assets/spatial/${l}.json`,'utf8'))])));
const normalize=s=>s.trim().replace(/\s+/g,' ');
async function ready(page,url){await page.goto(url);await page.waitForFunction(()=>window.spatialSite);await page.evaluate(()=>document.fonts.ready);}
async function corpus(){
  const browser=await chromium.launch();let chapters=0,minHeight=Infinity;
  try{
    for(const viewport of [{width:1440,height:900},{width:360,height:664}]){
      const page=await browser.newPage({viewport,reducedMotion:'reduce'});
      for(const locale of ['ja','en'])for(const a of catalogs[locale].articles){
        await ready(page,server.base+a.url);
        const content=await page.locator('#spatial-app .reading .read-pane').textContent();
        const payload=JSON.parse(await readFile(`public/assets/articles/${locale}/${a.id}.json`,'utf8'));
        const expected=await page.evaluate(body=>{
          const doc=new DOMParser().parseFromString(body,'text/html');
          return {sections:[...doc.body.children].filter(e=>e.tagName==='SECTION').length,paragraphs:[...doc.querySelectorAll('p,li')].map(e=>e.textContent.trim()).filter(Boolean)};
        },payload.body);
        assert.equal(await page.locator('.reading .chapter').count(),expected.sections+1);
        for(const p of expected.paragraphs)assert.ok(normalize(content).includes(normalize(p)),`${locale}/${a.id}: paragraph retained`);
        for(let i=0;i<=expected.sections;i++){
          if(i)await page.locator('.reading .chapter.next .chapter-toggle').click();
          const body=await page.locator('.reading .chapter.active .chapter-body').evaluate(e=>({h:e.clientHeight,w:e.clientWidth,overflow:e.scrollWidth>e.clientWidth+2}));
          assert.ok(body.h>=90&&body.w>=200,`${locale}/${a.id}/${i}: readable area ${JSON.stringify(body)}`);
          assert.equal(body.overflow,false,`${locale}/${a.id}/${i}: no horizontal overflow`);
          minHeight=Math.min(minHeight,body.h);chapters++;
        }
        const duplicates=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.filter((id,i)=>ids.indexOf(id)!==i);});
        assert.deepEqual(duplicates,[],`${locale}/${a.id}: unique IDs`);
      }
      await page.close();
    }
  }finally{await browser.close();}
  results.push({suite:'all-article-content',articles:Object.values(catalogs).reduce((n,c)=>n+c.articles.length,0),viewportChapterChecks:chapters,minimumBodyHeight:minHeight,status:'passed'});console.log('corpus',chapters,minHeight,'passed');
}
async function pages(){
  let checks=0;
  for(const engine of [chromium,webkit]){
    const browser=await engine.launch();
    try{
      for(const locale of ['ja','en']){
        const c=catalogs[locale],hub=c.topics.find(t=>t.guide),prefix=locale==='en'?'/en':'';
        for(const viewport of [{width:360,height:664},{width:768,height:1024},{width:844,height:390},{width:1440,height:900}]){
          const page=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
          for(const [suffix,mode] of [[c.paths.home,'feed'],[c.pages[1].url,'feed'],[c.paths.timeline,'timeline'],[c.paths.topics,'topics'],[hub.url,'feed'],[hub.url+'#topic-guide','document'],[`${prefix}/about.html`,'document'],[`${prefix}/terms.html`,'document'],[`${prefix}/sitemap.html`,'document'],[`${prefix}/404.html`,'document'],[c.articles[0].url,'read']]){
            await ready(page,server.base+suffix);
            await page.waitForFunction(mode=>spatialSite.getState().mode===mode,mode);
            assert.equal(await page.evaluate(()=>spatialSite.getState().mode),mode,`${engine.name()} ${suffix} mode`);
            assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${suffix} width ${viewport.width}`);
            const header=await page.locator('.app-header').boundingBox();assert.ok(header.width<=viewport.width);
            if(mode==='read'||mode==='document'){
              const body=await page.locator('.reading .chapter.active .chapter-body').boundingBox();
              assert.ok(body.height>=70&&body.width>=200,`${engine.name()} ${suffix} ${JSON.stringify(viewport)}: ${JSON.stringify(body)}`);
              if(mode==='document'&&suffix.endsWith('#topic-guide'))assert.ok(await page.locator('.reading .chapter').count()>=4);
            }
            if(locale==='en')assert.equal(await page.locator('#spatial-app .app-header').evaluate(e=>/[\u3040-\u30ff\u4e00-\u9fff]/.test(e.innerText.replace('日本語',''))),false,'English navigation has no Japanese labels');
            if(viewport.width===360||viewport.width===1440)await page.screenshot({path:`${out}/page-${engine.name()}-${locale}-${viewport.width}-${mode}-${suffix.includes('about')?'about':suffix.includes('terms')?'terms':suffix.includes('sitemap')?'sitemap':suffix.includes('topic-guide')?'guide':suffix.includes('/topics/')?'topics':suffix.includes('/page/')?'page2':'main'}.png`});
            checks++;
          }
          assert.deepEqual(errors,[]);await page.close();
        }
      }
    }finally{await browser.close();}
  }
  results.push({suite:'page-types-and-responsive',checks,status:'passed'});console.log('pages',checks,'passed');
}
async function resilience(){
  const browser=await chromium.launch(),c=catalogs.ja;
  try{
    const page=await browser.newPage({viewport:{width:390,height:844}});
    let requests=0;
    await page.route('**/assets/articles/ja/*.json',route=>{
      if(++requests===1)return route.fulfill({status:503,body:'Unavailable'});
      return route.continue();
    });
    await ready(page,server.base+c.paths.home);
    await page.locator('.article-paper[data-front=true] .read-button').click();
    await page.locator('.workspace-status [data-action=retry]').waitFor();
    assert.equal(await page.evaluate(()=>spatialSite.getState().mode),'feed');
    assert.ok((await page.locator('.workspace-status a').getAttribute('href')).includes('view=static'));
    await page.locator('[data-action=retry]').click();await page.waitForFunction(()=>spatialSite.getState().mode==='read');
    assert.equal(await page.locator('.workspace-status').isVisible(),false);
    await page.close();
    const race=await browser.newPage({viewport:{width:390,height:844}});
    let releaseFirst;const firstGate=new Promise(resolve=>{releaseFirst=resolve;});
    await race.route('**/assets/articles/ja/'+c.articles[0].id+'.json',async route=>{await firstGate;await new Promise(r=>setTimeout(r,150));await route.continue();});
    await race.route('**/assets/articles/ja/'+c.articles[1].id+'.json',async route=>{releaseFirst();await route.continue();});
    await ready(race,server.base+c.paths.home);
    await race.locator('.article-paper[data-front=true] .read-button').click();
    await race.locator(`[data-article="${c.articles[1].id}"] .title-open`).click();
    await race.waitForFunction(id=>spatialSite.getState().article===id&&spatialSite.getState().mode==='read',c.articles[1].id);await race.waitForTimeout(1000);
    assert.equal(await race.evaluate(()=>spatialSite.getState().article),c.articles[1].id);await race.close();
    for(const behavior of ['catalog-failure','script-failure','static-query','javascript-disabled']){
      const context=await browser.newContext({javaScriptEnabled:behavior!=='javascript-disabled',viewport:{width:390,height:844}}),p=await context.newPage();
      if(behavior==='catalog-failure')await p.route('**/assets/spatial/ja.json',r=>r.fulfill({status:503,body:''}));
      if(behavior==='script-failure')await p.route('**/assets/spatial-site.js',r=>r.abort());
      await p.goto(server.base+c.articles[0].url+(behavior==='static-query'?'?view=static':''));
      if(behavior==='catalog-failure')await p.waitForFunction(()=>!document.getElementById('spatial-app'));
      assert.ok(await p.locator('.page-shell .reading-title').isVisible(),behavior);
      assert.ok(await p.locator('.page-shell .article-body').isVisible(),behavior);
      assert.ok(await p.locator('.page-shell a[href]').count()>10);
      await context.close();
    }
  }finally{await browser.close();}
  results.push({suite:'network-retry-race-and-fallback',checks:6,status:'passed'});console.log('resilience passed');
}
async function basePath(){
  const temp=await mkdtemp(path.join(tmpdir(),'ard-spatial-')),prefix='/preview',root=path.join(temp,'site');let preview,browser;
  try{
    await promisify(execFile)(process.execPath,['scripts/build.mjs'],{env:{...process.env,SITE_URL:'https://research.notelligent.app/preview/',SITE_OUTPUT_DIR:root}});
    await copyFile('public/assets/site.css',path.join(root,'assets/site.css'));
    preview=await serveBuild({root,basePath:prefix});browser=await chromium.launch();const page=await browser.newPage();
    await ready(page,preview.base+'/timeline/');
    await page.locator('.article-paper[data-front=true] .read-button').click();await page.waitForFunction(()=>spatialSite.getState().mode==='read');
    assert.ok(new URL(page.url()).pathname.startsWith('/preview/'));
    assert.ok((await page.locator('link[rel=canonical]').getAttribute('href')).startsWith('https://research.notelligent.app/preview/'));
    assert.ok((await page.locator('#spatial-language').getAttribute('href')).startsWith('/preview/en/'));
  }finally{if(browser)await browser.close();if(preview)await preview.close();await rm(temp,{recursive:true,force:true});}
  results.push({suite:'deployment-base-path',path:prefix,status:'passed'});console.log('base path passed');
}
async function timeline(){
  let checks=0;
  for(const engine of [chromium,webkit]){
    const browser=await engine.launch();
    try{for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
      const page=await browser.newPage({viewport}),c=catalogs.ja;
      await ready(page,server.base+c.paths.timeline);
      assert.equal(await page.locator('.month-paper button').count(),0,'no month selection gate');
      for(let i=0;i<c.articles.length;i++){
        await page.evaluate(i=>scrollTo({top:i*spatialSite.getState().step,behavior:'instant'}),i);
        await page.waitForFunction(id=>spatialSite.getState().focus===id,c.articles[i].id);
        const surface=page.locator('.article-paper[data-front=true]');
        assert.equal(await surface.getAttribute('data-article'),c.articles[i].id);
        assert.equal(await surface.getAttribute('data-folded'),'false');
        const divider=page.locator('.month-paper:not([aria-hidden=true])');
        assert.equal(await divider.getAttribute('data-month'),c.articles[i].date.slice(0,7));
        assert.ok((await divider.boundingBox()).height<=40);
        assert.ok((await surface.boundingBox()).height>=240);
        assert.equal(await page.locator('.rail-month[aria-current]').getAttribute('data-open-month'),c.articles[i].date.slice(0,7));
        checks++;
      }
      for(const progress of [.4,.75,.9,3.9]){
        await page.evaluate(p=>scrollTo({top:p*spatialSite.getState().step,behavior:'instant'}),progress);
        await page.waitForFunction(p=>Math.abs(spatialSite.getState().progress-p)<.01,progress);
        const next=c.articles[Math.round(progress)+1];
        assert.equal(await page.locator(`[data-article="${next.id}"]`).getAttribute('aria-hidden'),'false','next candidate remains visible between scroll stops');
      }
      const month=c.months[1];
      await page.locator(`.rail-month[data-open-month="${month.id}"]`).click();
      await page.waitForFunction(id=>spatialSite.getState().mode==='timeline'&&spatialSite.getState().focus===id,month.articles[0]);
      await page.waitForTimeout(750);
      await page.locator('.article-paper[data-front=true] .paper-meta').click();
      await page.waitForFunction(id=>spatialSite.getState().mode==='read'&&spatialSite.getState().article===id,month.articles[0]);
      await page.waitForTimeout(150);
      assert.ok(await page.locator(`.month-paper[data-month="${month.id}"]`).evaluate(el=>el.getBoundingClientRect().height<=40),'month divider stays thin while opening the article');
      await page.goBack();await page.waitForFunction(()=>spatialSite.getState().mode==='timeline');
      assert.equal(await page.evaluate(()=>spatialSite.getState().focus),month.articles[0]);
      await page.reload();await page.waitForFunction(()=>window.spatialSite);
      assert.equal(await page.evaluate(()=>spatialSite.getState().focus),month.articles[0]);
      await page.screenshot({path:`${out}/timeline-stream-${engine.name()}-${viewport.width}.png`});
      await page.close();
    }}finally{await browser.close();}
  }
  results.push({suite:'continuous-timeline-articles',articlePositions:checks,status:'passed'});console.log('timeline',checks,'passed');
}
try{
  const suites={corpus,pages,resilience,basePath,timeline};
  for(const [name,run] of Object.entries(suites))if(!process.env.SPATIAL_SUITE||process.env.SPATIAL_SUITE===name){await run();await writeFile(`${out}/quality.json`,JSON.stringify(results,null,2));}
}finally{await server.close();}
