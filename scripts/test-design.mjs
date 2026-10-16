import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { topicSequence, nextTopicArticle, prepareArticleBody } from './lib/article-template.mjs';
import { renderArticlePage, renderReadingArticle } from './lib/render.mjs';
import { loadArticles, publishedArticles } from './lib/content.mjs';

const { articles, errors } = await loadArticles();
assert.deepEqual(errors, []);
const live = publishedArticles(articles);
for (const article of live) {
  const visited = new Set();
  let current = article;
  while (current) {
    assert(!visited.has(current.sourceDirName), 'Topic reading must not form a cycle');
    visited.add(current.sourceDirName);
    const next = nextTopicArticle(live, current);
    if (next) { assert.equal(next.category, current.category); assert(next.date <= current.date); }
    current = next;
  }
}
const sample = live.find((a) => a.category === 'AI Agents');
assert.deepEqual(topicSequence([...live].reverse(), sample).map((a) => a.sourceDirName), topicSequence(live, sample).map((a) => a.sourceDirName), 'Same-date order must not depend on filesystem order');
const semantic = { ...sample, sourceDirName: 'semantic-template', bodies: { ja: '<section><h2>読みやすい本文</h2><p>スタイルを指定しない本文。</p><figure><figcaption>流れ</figcaption><ol><li>入力</li><li>確認</li></ol></figure></section>', en: '<h2>A plain body</h2><p>No design classes.</p>' } };
for (const locale of ['ja','en']) {
  const page = renderArticlePage(semantic, locale, [semantic]);
  assert(page.includes(semantic.bodies[locale].match(/<p>.*?<\/p>/)[0]), 'Plain body must survive the shared template');
  assert(page.includes('reading-title') && page.includes('reading-map') && page.includes('section-1'));
  assert(!renderReadingArticle(semantic, locale, [semantic]).includes('<h1'), 'Appended articles must not introduce another main heading');
}
assert.equal(prepareArticleBody('<h2 id="existing">A</h2>'), '<h2 id="existing">A</h2>');
assert(prepareArticleBody('<h2>A</h2><h2 id="section-1">B</h2>').includes('id="section-2"'), 'Automatic anchors must not collide with authored anchors');
const numeric = '<figure><figcaption>Fixture data</figcaption><table><tr><th>Case</th><th>Value</th></tr><tr><td>A</td><td>-2</td></tr><tr><td>B</td><td>4</td></tr></table></figure>';
const chart = prepareArticleBody(numeric);
assert(chart.includes('data-chart') && chart.includes('<td>-2</td>') && chart.includes('<td>4</td>'), 'A generated chart retains the exact source data');
assert(!prepareArticleBody(numeric.replace('<td>4</td>','<td>not measured</td>')).includes('data-chart'), 'Missing measurements must never become plotted values');
assert.equal(nextTopicArticle([], sample), null);
const directory = await mkdtemp(path.join(tmpdir(), 'ard-template-'));
try {
  execFileSync(process.execPath, ['scripts/new-article.mjs', '--date', '2026-10-12', '--slug', 'template-check', '--root', directory]);
  const body = await readFile(path.join(directory, '2026-10-12-template-check/body.ja.html'), 'utf8');
  assert(!/class=|style=/.test(body), 'New authors must not need design classes');
  const meta = JSON.parse(await readFile(path.join(directory, '2026-10-12-template-check/meta.json')));
  const draft = { ...meta, sourceDirName: '2026-10-12-template-check' };
  assert.equal(publishedArticles([draft]).length, 0, 'Drafts must not leak into normal builds');
  const old = process.env.PREVIEW_ARTICLE;
  process.env.PREVIEW_ARTICLE = draft.sourceDirName;
  assert.equal(publishedArticles([draft]).length, 1);
  if (old === undefined) delete process.env.PREVIEW_ARTICLE; else process.env.PREVIEW_ARTICLE = old;
} finally { await rm(directory, { recursive: true, force: true }); }
console.log(`Topic sequences for ${live.length} articles, semantic templates, authoring scaffolds and draft isolation passed.`);
