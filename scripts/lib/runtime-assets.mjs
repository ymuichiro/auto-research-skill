import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {assetPath} from './site-config.mjs';

// Google WRS can reuse resources despite cache headers. Change the URL when
// bytes change, including the entry module's reference to its dependency.
const files=new Map();
function register(name,content){
  const hash=createHash('sha256').update(content).digest('hex').slice(0,12);
  const filename=name.replace(/\.(js|css)$/,`.${hash}.$1`);
  files.set(name,{filename,content});
  return filename;
}
const source=(folder,name)=>readFileSync(new URL(`../../src/${folder}/${name}`,import.meta.url),'utf8');
const copy=register('spatial-copy.js',source('assets','spatial-copy.js'));
register('spatial-site.js',source('assets','spatial-site.js').replace("'./spatial-copy.js'",`'./${copy}'`));
register('site-ui.js',source('assets','site-ui.js'));
register('spatial-site.css',source('styles','spatial-site.css'));
export const runtimeAssets=[...files.values()];
export const runtimeAssetPath=name=>assetPath(`assets/${files.get(name).filename}`);
