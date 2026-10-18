import {mkdir, writeFile} from 'node:fs/promises';
import {loadArticles, publishedArticles} from '../../scripts/lib/content.mjs';

const articles = publishedArticles((await loadArticles()).articles)
  .map(a => ({id:a.sourceDirName, date:a.date, title:a.titleJa, summary:a.summaryJa,
    teaser:a.seo.ja.teaser, category:a.category, tags:a.tags,
    body:a.bodies.ja, sources:a.publishedSources, url:`https://research.notelligent.app/${a.outputPaths.ja}`}))
  .sort((a,b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
const months = [...new Set(articles.map(a => a.date.slice(0,7)))].map(id => ({id,
  articles:articles.filter(a=>a.date.startsWith(id)).map(a=>a.id),
  categories:[...new Set(articles.filter(a=>a.date.startsWith(id)).map(a=>a.category))]}));
await mkdir(new URL('.',import.meta.url),{recursive:true});
await writeFile(new URL('data.js',import.meta.url),`window.RESEARCH_DATA = ${JSON.stringify({articles,months}).replaceAll('<','\\u003c')};\n`);
console.log(`${articles.length} published articles / ${months.length} research months`);
