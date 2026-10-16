import { chromium, webkit } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
const report=JSON.parse(await readFile('output/design-verification/final/report.json'));
const files=[...new Set(report.results.filter(r=>/^\d{4}-\d{2}-\d{2}-|^en\/\d{4}-\d{2}-\d{2}-/.test(r.file)).map(r=>r.file))];
const base=process.env.DESIGN_BASE_URL??'http://127.0.0.1:4173';
const checks=[];
for(const [engine,type,executablePath] of [['chromium',chromium,process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE]]) {
  const browser=await type.launch({...(executablePath?{executablePath}:{})});
  for(const width of [360,390,768,1440]) {
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
    let index=0;
    await Promise.all(Array.from({length:4},async()=>{
      const page=await context.newPage();
      for(;;){
        const current=index++;if(current>=files.length)break;
        const file=files[current];await page.goto(base+'/'+file,{waitUntil:'domcontentloaded'});
        await page.evaluate(()=>{document.querySelectorAll('.reading-evidence').forEach(el=>el.open=true);});
        await page.evaluate(()=>document.fonts.ready);
        const overflow=await page.evaluate(()=>[...document.querySelectorAll('.reading-evidence *, .reading-map *')].filter(el=>{
          const r=el.getBoundingClientRect();return r.width>0 && r.height>0 && (r.left< -2||r.right>innerWidth+2);
        }).map(el=>({tag:el.tagName,class:el.className})));
        await page.evaluate(()=>document.querySelector('[data-related-dialog]').showModal());
        const dialogOverflow=await page.evaluate(()=>[...document.querySelectorAll('dialog[open] *')].filter(el=>{
          const r=el.getBoundingClientRect();return r.width>0 && (r.left< -2||r.right>innerWidth+2);
        }).map(el=>({tag:el.tagName,class:el.className})));
        checks.push({engine,width,file,overflow,dialogOverflow});
      }
      await page.close();
    }));
    await context.close();
  }
  await browser.close();
}
const failures=checks.filter(r=>r.overflow.length||r.dialogOverflow.length);
await writeFile('output/design-verification/final/disclosures.json',JSON.stringify({articles:files.length,checks:checks.length,failures,results:checks},null,2));
console.log(`${files.length} article pages × 4 widths × 2 engines: ${checks.length} expanded-source/outline/dialog checks, ${failures.length} failures.`);
if(failures.length)process.exitCode=1;
