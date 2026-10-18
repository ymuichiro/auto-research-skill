import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const manifest=JSON.parse(await readFile('src/assets/illustrations/manifest.json','utf8')),hashes=new Set(),paths=new Set();
for(const item of manifest.items){
 assert.ok(item.prompt&&item.scene&&item.sourceFile,'Generated image needs its concept and provenance');
 const relative=`assets/illustrations/${item.kind}/${item.id}.webp`,bytes=await readFile(`public/${relative}`),hash=createHash('sha256').update(bytes).digest('hex'),meta=await sharp(bytes).metadata();
 assert.equal(hash,item.sha256,`Image differs from its recorded generation: ${item.id}`);assert.ok(!hashes.has(hash),`Reused illustration: ${item.id}`);hashes.add(hash);paths.add('/'+relative);
 assert.equal(meta.width,1200);assert.equal(meta.height,800);assert.ok(bytes.length<250000,`Oversized illustration: ${item.id}`);
}
for(const locale of['ja','en']){
 const catalog=JSON.parse(await readFile(`public/assets/spatial/${locale}.json`,'utf8'));
 for(const [kind,items]of[['article',catalog.articles],['category',catalog.topics]])for(const item of items){
  assert.ok(item.illustration,`Missing ${kind} illustration: ${item.id}`);assert.ok([...paths].some(path=>item.illustration.endsWith(path)),`Unregistered illustration: ${item.id}`);
  assert.ok(item.illustration.endsWith(`/${kind}/${item.id}.webp`),`Incorrect illustration mapping: ${item.id}`);
  if(kind==='article'){const html=await readFile('public'+item.url,'utf8');assert.ok(html.includes(`src="${item.illustration}"`),`SSR article illustration missing: ${item.id}`);}
 }
}
console.log(`${manifest.items.length} distinct generated illustrations: provenance, dimensions, budgets, Japanese/English mappings and SSR verified.`);
