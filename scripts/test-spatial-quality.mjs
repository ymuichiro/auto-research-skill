import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,mkdtemp,copyFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {chromium,webkit} from 'playwright';
import {serveBuild} from './lib/test-server.mjs';
import {removedHtmlPages} from './lib/site-config.mjs';
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
          // Chapter sizing is applied by ResizeObserver/requestAnimationFrame.
          // Measure after that layout, not the preceding chapter's grid height.
          await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
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
          for(const [suffix,mode] of [[c.paths.home,'timeline'],[c.pages[1].url,'feed'],[`${prefix}/timeline/`,'timeline'],[c.paths.topics,'topics'],[hub.url,'feed'],[hub.url+'#topic-guide','document'],[`${prefix}/404.html`,'document'],[c.articles[0].url,'read']]){
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
    assert.equal(await page.evaluate(()=>spatialSite.getState().mode),'timeline');
    assert.equal(await page.locator('.workspace-status a').count(),0,'no alternate screen on loading failure');
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
      let failures=0;
      if(behavior==='catalog-failure')await p.route('**/assets/spatial/ja.json',r=>++failures===1?r.fulfill({status:503,body:''}):r.continue());
      if(behavior==='script-failure')await p.route('**/assets/spatial-site.js',r=>++failures===1?r.abort():r.continue());
      await p.goto(server.base+c.articles[0].url+(behavior==='static-query'?'?view=static':''));
      if(behavior==='static-query'){
        await p.waitForFunction(()=>window.spatialSite?.getState().mode==='read');
        assert.equal(new URL(p.url()).searchParams.has('view'),false);
        assert.equal(await p.locator('#spatial-app a[href*="view=static"]').count(),0);
      }else if(behavior==='javascript-disabled'){
        assert.ok(await p.locator('#spatial-startup noscript p').isVisible());
      }else{
        await p.locator('#spatial-startup-retry').waitFor({state:'visible'});
        assert.ok(await p.locator('#spatial-startup').isVisible());
        await p.locator('#spatial-startup-retry').click();
        await p.waitForFunction(()=>window.spatialSite?.getState().mode==='read');
        assert.equal(await p.locator('#spatial-startup').isVisible(),false,'retry restores the new screen');
      }
      assert.equal(await p.locator('.page-shell').isVisible(),false,'the retired screen never appears');
      await context.close();
    }
    for(const name of ['article-share.js','article-stream.js','article-motion.js','listing-motion.js'])assert.equal((await fetch(`${server.base}/assets/${name}`)).status,404,'retired screen scripts are not distributed');
  }finally{await browser.close();}
  results.push({suite:'network-retry-race-and-startup',checks:6,status:'passed'});console.log('resilience passed');
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
    await ready(page,preview.base+'/topics/?topic=ai-workflows');
    assert.equal(await page.locator('.topic-selector button').count(),catalogs.ja.topics.length);
    assert.ok(await page.locator('.topic-article img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0&&new URL(image.src).pathname.startsWith('/preview/assets/illustrations/'))),'topic illustrations honor the base path');
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
        await page.waitForFunction(id=>document.getElementById('spatial-app').dataset.focus===id,c.articles[i].id);
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
        await page.waitForFunction(p=>Math.abs(Number(document.getElementById('spatial-app').dataset.progress)-p)<.01,progress);
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
async function removedPages(){
  const staleRoot=await mkdtemp(path.join(tmpdir(),'ard-removed-pages-'));
  try{
    for(const file of removedHtmlPages){await mkdir(path.dirname(path.join(staleRoot,file)),{recursive:true});await writeFile(path.join(staleRoot,file),'stale removed page');}
    await promisify(execFile)(process.execPath,['scripts/build.mjs'],{env:{...process.env,SITE_OUTPUT_DIR:staleRoot}});
    for(const file of removedHtmlPages)await assert.rejects(readFile(path.join(staleRoot,file)),{code:'ENOENT'});
    for(const file of ['sitemap.xml','sitemap-pages.xml','sitemap-articles.xml'])assert.ok((await readFile(path.join(staleRoot,file),'utf8')).includes('<?xml'));
  }finally{await rm(staleRoot,{recursive:true,force:true});}
  for(const file of removedHtmlPages)for(const suffix of ['', '?view=static']){
    assert.equal((await fetch(`${server.base}/${file}${suffix}`)).status,404,`${file}${suffix} must be removed`);
  }
  for(const engine of [chromium,webkit]){
    const browser=await engine.launch();
    try{for(const locale of ['ja','en']){
      const page=await browser.newPage({viewport:{width:390,height:844}}),c=catalogs[locale];
      for(const [file,root] of [['sitemap.xml','sitemapindex'],['sitemap-pages.xml','urlset'],['sitemap-articles.xml','urlset']]){
        const response=await page.request.get(`${server.base}/${file}`);assert.equal(response.status(),200);
        const parsed=await page.evaluate(({xml,root})=>{const doc=new DOMParser().parseFromString(xml,'application/xml');return {root:doc.documentElement.localName,errors:doc.querySelectorAll('parsererror').length,entries:doc.documentElement.children.length};},{xml:await response.text(),root});
        assert.equal(parsed.root,root);assert.equal(parsed.errors,0);assert.ok(parsed.entries>0);
      }
      await ready(page,server.base+c.paths.home);
      await page.locator('#spatial-app [data-action=menu]').click();
      const menuLinks=await page.locator('.spatial-menu a').evaluateAll(links=>links.map(a=>new URL(a.href).pathname));
      assert.equal(menuLinks.length,2,'menu contains only home and topics');
      assert.equal(await page.locator('.spatial-menu a[href*="view=static"]').count(),0);
      for(const file of removedHtmlPages)assert.ok(!menuLinks.some(url=>url.endsWith('/'+file)));
      if(locale==='ja')await page.screenshot({path:`${out}/removed-pages-menu-${engine.name()}.png`});
      await page.goto(server.base+c.articles[0].url+'?view=static');
      const links=await page.locator('a[href]').evaluateAll(links=>links.map(a=>new URL(a.href).pathname));
      for(const file of removedHtmlPages)assert.ok(!links.some(url=>url.endsWith('/'+file)));
      await page.close();
    }}finally{await browser.close();}
  }
  results.push({suite:'removed-pages-and-retained-xml',removedUrls:removedHtmlPages.length,status:'passed'});console.log('16 removed HTML URLs, menus, article links and 3 XML sitemaps passed');
}
async function mergedHome(){
  let checks=0;
  for(const engine of [chromium,webkit]){
    const browser=await engine.launch();
    try{for(const viewport of [{width:1440,height:900},{width:390,height:844}])for(const locale of ['ja','en']){
      const page=await browser.newPage({viewport,reducedMotion:'reduce'}),c=catalogs[locale],legacy=locale==='ja'?'/timeline/':'/en/timeline/';
      assert.equal(c.paths.timeline,c.paths.home,'one canonical destination');
      for(const suffix of ['',`?month=${c.months[1].id}`,`?month=${c.months[0].id}&item=${c.articles[2].id}`,`?item=${c.articles[3].id}`]){
        await ready(page,server.base+legacy+suffix);
        assert.equal(new URL(page.url()).pathname,c.paths.home);
        assert.equal(await page.evaluate(()=>spatialSite.getState().mode),'timeline');
        const expected=suffix.includes('item=')?new URLSearchParams(suffix).get('item'):suffix?c.months[1].articles[0]:c.articles[0].id;
        assert.equal(await page.evaluate(()=>spatialSite.getState().focus),expected);
        assert.ok((await page.locator('.month-paper:not([aria-hidden=true])').boundingBox()).height<=40);
        assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),new URL(c.paths.home,'https://research.notelligent.app').href);
        checks++;
      }
      await page.locator('#spatial-app [data-action=menu]').click();
      assert.deepEqual(await page.locator('.spatial-menu a').evaluateAll(links=>links.map(a=>new URL(a.href).pathname)),[c.paths.home,c.paths.topics]);
      await page.locator('[data-action=close-menu]').click();
      await page.screenshot({path:`${out}/merged-home-${engine.name()}-${locale}-${viewport.width}.png`});
      await page.close();
      const migration=await browser.newPage({viewport,reducedMotion:'reduce'});
      await migration.addInitScript(({home,article,list})=>{
        if(location.pathname===home)history.replaceState({spatial:{mode:'feed',path:home,article,list,topic:null,progress:2,fragment:'',timelineVersion:2}},'',location.href);
      },{home:c.paths.home,article:c.articles[0].id,list:c.articles.map(a=>a.id)});
      await ready(migration,server.base+c.paths.home);
      assert.equal(await migration.evaluate(()=>spatialSite.getState().mode),'timeline');
      assert.equal(await migration.evaluate(()=>spatialSite.getState().focus),c.articles[2].id);
      await migration.close();checks++;
    }}finally{await browser.close();}
  }
  results.push({suite:'merged-home-and-legacy-redirect',checks,status:'passed'});console.log('merged home',checks,'passed');
}
try{
  const suites={corpus,pages,resilience,basePath,timeline,removedPages,mergedHome};
  for(const [name,run] of Object.entries(suites))if(!process.env.SPATIAL_SUITE||process.env.SPATIAL_SUITE===name){await run();await writeFile(`${out}/quality.json`,JSON.stringify(results,null,2));}
}finally{await server.close();}
