import { chromium, webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { loadArticles, publishedArticles } from './lib/content.mjs';
import { serveBuild } from './lib/test-server.mjs';
const {articles}=await loadArticles();
const files=publishedArticles(articles).flatMap(article=>[article.outputPaths.ja,article.outputPaths.en]);
const preview=process.env.DESIGN_BASE_URL?{base:process.env.DESIGN_BASE_URL,close:async()=>{}}:await serveBuild();
const base=preview.base;
const output=process.env.DISCLOSURE_OUTPUT??'output/epic-motion/26';
await mkdir(output,{recursive:true});
const checks=[];
try {for(const [engine,type,executablePath] of [['chromium',chromium,process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE]]) {
  const browser=await type.launch({...(executablePath?{executablePath}:{})});
  for(const width of [360,390,768,1440]) {
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
    let index=0;
    await Promise.all(Array.from({length:4},async()=>{
      const page=await context.newPage();
      let errors=[];page.on('pageerror',error=>errors.push(error.message));
      for(;;){
        const current=index++;if(current>=files.length)break;
        errors=[];
        const file=files[current];const response=await page.goto(base+'/'+file,{waitUntil:'domcontentloaded'});
        await page.evaluate(()=>{document.querySelectorAll('.reading-evidence, .reading-toc').forEach(el=>el.open=true);});
        await page.evaluate(()=>document.fonts.ready);
        const toc=await page.evaluate(()=>{
          const article=document.querySelector('[data-article-id]');
          const headings=[...article.querySelectorAll('.article-body h2')];
          const links=[...article.querySelectorAll('.reading-map a')];
          const normalize=text=>text.trim().replace(/\s+/g,' ');
          return {count:links.length,expected:headings.length,invalid:links.flatMap((link,index)=>{
            const target=document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1)));
            const label=link.querySelector('.reading-map-title')?.textContent??'';
            return target!==headings[index]||normalize(label)!==normalize(headings[index]?.textContent??'')||link.getBoundingClientRect().height<44?[index]:[];
          })};
        });
        const overflow=await page.evaluate(()=>[...document.querySelectorAll('.reading-evidence *, .reading-map *')].filter(el=>{
          const r=el.getBoundingClientRect();return r.width>0 && r.height>0 && (r.left< -2||r.right>innerWidth+2);
        }).map(el=>({tag:el.tagName,class:el.className})));
        if(file==='2026-08-12-beyond-ai-agents-hacw.html'||file==='en/2026-03-26-agent-identity-becomes-an-auth-control-plane.html'){
          await page.locator('.reading-map').first().screenshot({path:`${output}/${engine}-${width}-${file.startsWith('en/')?'en':'ja'}-toc.png`});
        }
        await page.evaluate(()=>document.querySelector('[data-related-dialog]').showModal());
        const dialogOverflow=await page.evaluate(()=>[...document.querySelectorAll('dialog[open] *')].filter(el=>{
          const r=el.getBoundingClientRect();return r.width>0 && (r.left< -2||r.right>innerWidth+2);
        }).map(el=>({tag:el.tagName,class:el.className})));
        checks.push({engine,width,file,status:response.status(),toc,overflow,dialogOverflow,errors:[...errors]});
      }
      await page.close();
    }));
    await context.close();
  }
  await browser.close();
}}finally{await preview.close();}
const failures=checks.filter(r=>r.status!==200||r.toc.count!==r.toc.expected||r.toc.invalid.length||r.overflow.length||r.dialogOverflow.length||r.errors.length);
await writeFile(`${output}/disclosures.json`,JSON.stringify({articles:files.length,checks:checks.length,failures,results:checks},null,2));
console.log(`${files.length} article pages × 4 widths × 2 engines: ${checks.length} expanded-source/outline/dialog checks, ${failures.length} failures.`);
if(failures.length)process.exitCode=1;
