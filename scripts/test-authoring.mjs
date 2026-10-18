import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { readFile, writeFile, rm, access } from 'node:fs/promises';
import path from 'node:path';

const id='2026-10-12-template-local-preview-check';
const directory=path.resolve('content/articles',id);
try { await access(directory); throw new Error('Authoring fixture already exists; refusing to overwrite it.'); }
catch(error){ if(error.code!=='ENOENT')throw error; }
let child;
async function waitFor(url,predicate) {
  const deadline=Date.now()+30000;
  while(Date.now()<deadline){
    try {const response=await fetch(url);const html=await response.text();if(response.ok&&predicate(html))return html;}catch{}
    await new Promise(resolve=>setTimeout(resolve,300));
  }
  throw new Error(`Authoring preview did not reach the expected state: ${url}`);
}
try {
  execFileSync(process.execPath,['scripts/new-article.mjs','--date','2026-10-12','--slug','template-local-preview-check']);
  const original=await readFile(path.join(directory,'body.ja.html'),'utf8');
  assert(!/class=|style=/.test(original));
  child=spawn(process.execPath,['scripts/dev.mjs'],{env:{...process.env,PREVIEW_ARTICLE:id,PORT:'4174'},detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']});
  let log='';child.stdout.on('data',data=>{log=(log+data).slice(-6000);});child.stderr.on('data',data=>{log=(log+data).slice(-6000);});
  const html=await waitFor(`http://127.0.0.1:4174/${id}.html`,html=>html.includes('reading-article'));
  assert(html.includes('noindex,nofollow'),'Draft preview must be excluded from indexing');
  assert(html.includes('reading-map'),'Drafts use the actual shared article template');
  const marker='本文の保存だけで共通テンプレートへ反映される';
  await writeFile(path.join(directory,'body.ja.html'),original+`\n<section><h2>保存した節</h2><p>${marker}</p></section>\n`);
  const edited=await waitFor(`http://127.0.0.1:4174/${id}.html`,html=>html.includes(marker));
  assert(edited.includes('href="#section-4"'),'New headings receive outline links automatically');
  await waitFor(`http://127.0.0.1:4174/en/${id}.html`,html=>html.includes('noindex,nofollow'));
  console.log('Class-free scaffold → draft preview → save → automatic rebuild passed in both locales.');
} finally {
  if(child&&child.exitCode===null) {
    // Stop the CSS watcher and rebuild children before cleaning their output.
    const exited=new Promise(resolve=>child.once('exit',resolve));
    if(process.platform==='win32')child.kill('SIGINT');else process.kill(-child.pid,'SIGTERM');
    await exited;
  }
  await rm(directory,{recursive:true,force:true});
  execFileSync('pnpm',['build'],{stdio:'inherit'});
  try {await access(path.resolve('public',id+'.html'));throw new Error('Temporary draft leaked into the normal build.');}
  catch(error){if(error.code!=='ENOENT')throw error;}
}
