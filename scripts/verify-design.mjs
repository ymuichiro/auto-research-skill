import { chromium, webkit } from 'playwright';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('public');
const base = process.env.DESIGN_BASE_URL ?? 'http://127.0.0.1:4173';
const output = path.resolve(process.env.DESIGN_OUTPUT ?? 'output/design-verification/all-pages');
const widths = [360,390,768,1440];
async function walk(directory) {
  const results = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...await walk(file));
    else if (file.endsWith('.html')) results.push(path.relative(root, file));
  }
  return results.sort();
}
await mkdir(output, { recursive: true });
const files = await walk(root);
const checks = [];
const failures = [];
for (const [engine, browserType, executablePath] of [['chromium',chromium,process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE],['webkit',webkit,process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE]]) {
  const browser = await browserType.launch({ headless: true, ...(executablePath ? {executablePath} : {}) });
  for (const width of widths) {
    const context = await browser.newContext({viewport:{width,height:1000}, reducedMotion:'reduce'});
    let nextIndex = 0;
    await Promise.all(Array.from({length:2}, async () => {
    const page = await context.newPage();
    let errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (;;) {
      const index = nextIndex++;
      if (index >= files.length) break;
      const file = files[index];
      errors = [];
      const url = `${base}/${file}`;
      const response = await page.goto(url, {waitUntil:'networkidle', timeout:30000});
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(() => {
        const body = document.querySelector('.reading-article .article-body') ?? document.querySelector('.content-stack');
        const visible = (el) => { const rect = el.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
        const overflow = [...document.querySelectorAll('main *, header.site-header *')].filter(visible).filter((el) => {
          if (el.closest('dialog:not([open])')) return false;
          const rect = el.getBoundingClientRect();
          return rect.left < -2 || rect.right > innerWidth + 2;
        }).slice(0,12).map((el)=>({tag:el.tagName,class:el.className,text:el.textContent.trim().slice(0,70)}));
        const ids = [...document.querySelectorAll('[id]')].map((el)=>el.id);
        const missingAnchors = [...document.querySelectorAll('a[href^="#"]')].filter(visible).filter((el)=>!document.getElementById(decodeURIComponent(el.getAttribute('href').slice(1)))).map((el)=>el.getAttribute('href'));
        return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,overflow,duplicateIds:ids.filter((id,index)=>ids.indexOf(id)!==index),missingAnchors,h1:document.querySelectorAll('h1').length,bodyColor:body?getComputedStyle(body).color:null,fonts:document.fonts.status};
      });
      const name = `${index.toString().padStart(3,'0')}-${file.replaceAll('/','_').replace('.html','')}-${width}`;
      // Full-document captures prove that lower sections, sources and footer rendered.
      // Save Chromium captures; WebKit repeats every geometry/DOM check independently.
      if (engine === 'chromium') {
        const target = path.join(output,`${name}.png`);
        if (result.height < 12000) await page.screenshot({path:target,fullPage:true,timeout:30000});
        else {
          const layers=[];
          for(let top=0;top<result.height;top+=5000) {
            const height=Math.min(5000,result.height-top);
            const input=await page.screenshot({fullPage:true,clip:{x:0,y:top,width,height},timeout:30000});
            layers.push({input,left:0,top});
          }
          await sharp({create:{width,height:result.height,channels:4,background:'#edf3f7'}}).composite(layers).png().toFile(target);
        }
      }
      const failed = response.status() !== 200 || result.overflow.length || result.duplicateIds.length || result.missingAnchors.length || result.h1 !== 1 || errors.length;
      const record = {engine,width,file,status:response.status(),...result,errors:[...errors],screenshot:engine==='chromium'?`${name}.png`:null};
      checks.push(record);
      if (failed) failures.push(record);
      if ((index+1)%25===0) console.log(`${engine} ${width}px: ${index+1}/${files.length} pages, ${failures.length} failures`);
    }
    await page.close();
    }));
    await context.close();
  }
  await browser.close();
}
// Contact sheets include the top, middle and bottom of every full-page capture.
for (const width of widths) {
  const captures = checks.filter((r)=>r.engine==='chromium'&&r.width===width).sort((a,b)=>a.file.localeCompare(b.file));
  for (let start=0;start<captures.length;start+=12) {
    const group=captures.slice(start,start+12);
    const cellWidth=450,cellHeight=360;
    const layers=[];
    for (let index=0;index<group.length;index++) {
      const record=group[index];
      const image=path.join(output,record.screenshot);
      const info=await sharp(image).metadata();
      for (let part=0;part<3;part++) {
        const height=Math.min(1000,info.height);
        const top=Math.round((info.height-height)*part/2);
        const buffer=await sharp(image).extract({left:0,top,width:info.width,height}).resize(140,310,{fit:'contain',background:'#edf3f7'}).png().toBuffer();
        layers.push({input:buffer,left:(index%3)*cellWidth+part*145,top:Math.floor(index/3)*cellHeight+35});
      }
      const label=Buffer.from(`<svg width="450" height="30"><text x="5" y="20" font-size="11" font-family="sans-serif">${record.file.replaceAll('&','&amp;')}</text></svg>`);
      layers.push({input:label,left:(index%3)*cellWidth,top:Math.floor(index/3)*cellHeight});
    }
    await sharp({create:{width:1350,height:Math.ceil(group.length/3)*cellHeight,channels:4,background:'#edf3f7'}}).composite(layers).png().toFile(path.join(output,`contact-${width}-${start/12}.png`));
  }
}
await writeFile(path.join(output,'report.json'), JSON.stringify({base,pages:files.length,checks:checks.length,failures,results:checks},null,2));
console.log(`${files.length} pages × 4 widths × 2 engines: ${checks.length} checks, ${failures.length} failures.`);
if (failures.length) process.exitCode=1;
