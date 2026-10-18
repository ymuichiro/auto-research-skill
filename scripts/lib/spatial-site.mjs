import {readFileSync} from 'node:fs';
import {assetPath, localizedPath, listingRelativePath, topicHubRelativePath, topicIndexRelativePath, siteConfig} from './site-config.mjs';
const illustrationItems=JSON.parse(readFileSync(new URL('../../src/assets/illustrations/manifest.json',import.meta.url),'utf8')).items;
export function illustrationPath(kind,id){if(!illustrationItems.some(item=>item.kind===kind&&item.id===id))return undefined;return assetPath(`assets/illustrations/${kind}/${id}.webp`);}

export function spatialCatalog(articles, hubs, locale) {
  const local = path => localizedPath(locale,path.replace(/^en\//,''));
  const entries=articles.map(a=>({id:a.sourceDirName,date:a.date,title:locale==='ja'?a.titleJa:a.titleEn,
    teaser:a.seo[locale].teaser,illustration:illustrationPath('article',a.sourceDirName),category:a.category,tags:a.tags,sourceCount:a.publishedSources.length,
    url:local(a.outputPaths[locale]),alternate:localizedPath(locale==='ja'?'en':'ja',a.outputPaths.ja),
    payload:assetPath(`assets/articles/${locale}/${a.sourceDirName}.json`)}))
    .sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
  return {version:1,locale,articles:entries,
    months:[...new Set(entries.map(a=>a.date.slice(0,7)))].map(id=>({id,
      articles:entries.filter(a=>a.date.startsWith(id)).map(a=>a.id),
      categories:[...new Set(entries.filter(a=>a.date.startsWith(id)).map(a=>a.category))]})),
    topics:hubs.map(h=>({id:h.slug,title:h.category,description:h.descriptions[locale],
      illustration:illustrationPath('category',h.slug),guide:Boolean(h.guide?.[locale]),articles:h.articles.map(a=>a.sourceDirName),url:local(topicHubRelativePath(locale,h.slug))})),
    paths:{home:local(''),timeline:local(''),topics:local(topicIndexRelativePath(locale))},
    pages:Array.from({length:Math.max(1,Math.ceil(articles.length/siteConfig.pagination.articleListPageSize))},(_,i)=>({
      url:local(listingRelativePath(locale,i+1)),articles:articles.slice(i*siteConfig.pagination.articleListPageSize,(i+1)*siteConfig.pagination.articleListPageSize).map(a=>a.sourceDirName)})),
    navigation:siteConfig.nav[locale].map(n=>({label:n.label,url:local(n.path)})),
    footer:siteConfig.footerNav[locale].map(n=>({label:n.label,url:local(n.path)}))};
}

export function spatialConfigScript(config,locale,relativePath,title) {
  return `<script type="application/json" id="spatial-config">${JSON.stringify({
    ...config,locale,title,path:localizedPath(locale,relativePath.replace(/^en\//,'')),
    catalog:assetPath(`assets/spatial/${locale}.json`)
  }).replaceAll('<','\\u003c')}</script>`;
}
