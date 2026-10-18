import {chromium,webkit} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {loadArticles,publishedArticles} from './lib/content.mjs';
import {serveBuild} from './lib/test-server.mjs';
const {articles}=await loadArticles();
const allFiles=publishedArticles(articles).flatMap(article=>[article.outputPaths.ja,article.outputPaths.en]);
const files=process.env.DISCLOSURE_LIMIT?allFiles.slice(0,Number(process.env.DISCLOSURE_LIMIT)):allFiles;
const preview=process.env.DESIGN_BASE_URL?{base:process.env.DESIGN_BASE_URL,close:async()=>{}}:await serveBuild();
const output=process.env.DISCLOSURE_OUTPUT??'output/spatial-site/disclosures';await mkdir(output,{recursive:true});
const checks=[];
try{for(const [engine,type,executablePath] of [['chromium',chromium,process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE]]){
  const browser=await type.launch({...(executablePath?{executablePath}:{})});
  try{for(const width of [360,390,768,1440]){
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});let index=0;
    try{await Promise.all(Array.from({length:4},async()=>{
      const page=await context.newPage();let errors=[];page.on('pageerror',error=>errors.push(error.message));
      try{for(;;){
        const current=index++;if(current>=files.length)break;errors=[];
        const file=files[current],response=await page.goto(preview.base+'/'+file);
        await page.waitForFunction(()=>window.spatialSite?.getState().mode==='read');await page.evaluate(()=>document.fonts.ready);
        const expected=await page.locator('.page-shell .article-body > section').count()+1;
        await page.locator('.reading [data-action=toc]').click();
        const toc=await page.locator('.reading .chapter-toggle:visible').evaluateAll(buttons=>({count:buttons.length,invalid:buttons.flatMap((button,i)=>button.getBoundingClientRect().height<44||!button.querySelector('.chapter-name').textContent.trim()?[i]:[])}));
        await page.locator('.reading [data-action=toc]').click();
        await page.locator('.reading .chapter-toggle').last().click();
        const sourceCount=await page.locator('.reading .chapter.active a.source-row').count();
        const expectedSources=await page.locator('.page-shell .reading-evidence a.source-row').count();
        const overflow=await page.locator('.reading .chapter.active .chapter-body').evaluate(el=>{const r=el.getBoundingClientRect();return r.left< -2||r.right>innerWidth+2||el.scrollWidth>el.clientWidth+2;});
        const retiredScreenVisible=await page.locator('.page-shell').isVisible();
        const alternateLinks=await page.locator('#spatial-app a[href*="view=static"]').count();
        await page.locator('.reading [data-action=related]').click();await page.waitForFunction(()=>spatialSite.getState().mode==='related');
        const related=await page.locator('.article-paper[data-front=true] .title-open').count();
        checks.push({engine,width,file,status:response.status(),toc:{...toc,expected},sourceCount,expectedSources,overflow,retiredScreenVisible,alternateLinks,related,errors:[...errors]});
      }}finally{await page.close();}
    }));}finally{await context.close();}
  }}finally{await browser.close();}
}}finally{await preview.close();}
const failures=checks.filter(r=>r.status!==200||r.toc.count!==r.toc.expected||r.toc.invalid.length||r.sourceCount!==r.expectedSources||r.overflow||r.retiredScreenVisible||r.alternateLinks||!r.related||r.errors.length);
await writeFile(`${output}/disclosures.json`,JSON.stringify({articles:files.length,checks:checks.length,failures,results:checks},null,2));
console.log(`${files.length} article pages × 4 widths × 2 engines: ${checks.length} spatial contents/source/related checks, ${failures.length} failures.`);
if(failures.length)process.exitCode=1;
