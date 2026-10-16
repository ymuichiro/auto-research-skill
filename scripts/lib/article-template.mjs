import { escapeHtml } from "./utils.mjs";

function plainText(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&(?:amp|lt|gt|quot|apos|nbsp|#\d+|#x[\da-f]+);/gi, (entity) => {
    const named = { '&amp;':'&', '&lt;':'<', '&gt;':'>', '&quot;':'"', '&apos;':"'", '&nbsp;':' ' };
    if (named[entity.toLowerCase()] !== undefined) return named[entity.toLowerCase()];
    const number = entity.toLowerCase().startsWith('&#x') ? parseInt(entity.slice(3,-1),16) : Number(entity.slice(2,-1));
    return number >= 0 && number <= 0x10ffff ? String.fromCodePoint(number) : entity;
  }).trim();
}

// Authors supply semantic HTML. Presentation and navigation are owned by the site.
export function prepareArticleBody(body) {
  let chart = 0;
  const usedIds = new Set([...body.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]));
  body = body.replace(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/g, (original, attrs, content) => {
    const rows = [...content.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].slice(1).map((match) =>
      [...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g)].map((cell) => plainText(cell[1])));
    // Exact numeric two-column tables can be visualized without inventing data.
    // Keep the original table as the accessible source of values and units.
    if (!rows.length || rows.length > 12 || rows.some((row) => row.length !== 2 || !/^-?\d+(?:\.\d+)?$/.test(row[1]))) return original;
    chart += 1;
    while (usedIds.has(`chart-${chart}`)) chart += 1;
    usedIds.add(`chart-${chart}`);
    const values = rows.map((row) => Number(row[1]));
    if (values.some((value) => !Number.isFinite(value))) return original;
    const min = Math.min(0, ...values), max = Math.max(0, ...values);
    const range = max - min || 1;
    const zero = (0 - min) / range * 300;
    const label = plainText(content.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/)?.[1] ?? 'Data');
    const graphic = `<svg class="data-chart" viewBox="0 0 320 ${rows.length * 65 + 5}" role="img" aria-labelledby="chart-${chart}"><title id="chart-${chart}">${escapeHtml(label)}</title>${rows.map((row, index) => {
      const endpoint = (values[index] - min) / range * 300;
      return `<g><text x="0" y="${index * 65 + 20}"><title>${escapeHtml(row[0])}</title>${escapeHtml(row[0].length > 12 ? row[0].slice(0, 11) + '…' : row[0])}</text><path d="M${zero} ${index * 65 + 28}V${index * 65 + 51}" class="chart-axis"/><rect x="${Math.min(zero, endpoint)}" y="${index * 65 + 28}" width="${Math.abs(endpoint - zero)}" height="22" rx="4" class="${index % 2 === 0 ? 'chart-series-0' : 'chart-series-1'}"/><text x="310" text-anchor="end" y="${index * 65 + 20}">${escapeHtml(row[1])}</text></g>`;
    }).join('')}</svg>`;
    return `<figure${attrs}>${content.replace(/(<\/figcaption>)/, `$1${graphic}`)}</figure>`;
  });
  let index = 0;
  const ids = new Set([...body.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]));
  return body.replace(/<h2(\s[^>]*)?>/g, (match, attrs = "") => {
    index += 1;
    if (/\bid\s*=/.test(attrs)) return match;
    while (ids.has(`section-${index}`)) index += 1;
    ids.add(`section-${index}`);
    return `<h2${attrs} id="section-${index}">`;
  });
}

export function articleReadingMinutes(body, locale) {
  const text = body.replace(/<[^>]*>/g, " ");
  const units = locale === "ja" ? text.replace(/\s/g, "").length : text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(units / (locale === "ja" ? 500 : 220)));
}

export function articleOutline(body) {
  return [...prepareArticleBody(body).matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g)].map((match) => ({
    id: match[1].match(/\bid=["']([^"']+)["']/)?.[1] ?? "",
    label: plainText(match[2])
  })).filter((item) => item.id);
}

export function renderOutline(body, locale) {
  const items = articleOutline(body);
  if (!items.length) return "";
  return `<nav class="reading-map" aria-label="${locale === "ja" ? "この記事の章" : "Briefing sections"}">
    <details class="reading-toc"><summary class="reading-map-label">${locale === "ja" ? "目次" : "Contents"}</summary>
    <ol>${items.map((item, index) => `<li><a href="#${escapeHtml(item.id)}" aria-label="${escapeHtml(item.label)}"${index === 0 ? ' aria-current="location"' : ""}><span class="reading-map-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><span class="reading-map-title">${escapeHtml(item.label)}</span></a></li>`).join("")}</ol></details>
  </nav>`;
}

export function topicSequence(articles, current) {
  return articles.filter((item) => item.category === current.category).sort((a, b) =>
    b.date.localeCompare(a.date) || a.sourceDirName.localeCompare(b.sourceDirName));
}

export function nextTopicArticle(articles, current) {
  const sequence = topicSequence(articles, current);
  const index = sequence.findIndex((item) => item.sourceDirName === current.sourceDirName);
  return index < 0 ? null : sequence[index + 1] ?? null;
}

function sharedTagCount(left, right) {
  const tags = new Set(left.tags ?? []);
  return (right.tags ?? []).reduce((count, tag) => count + Number(tags.has(tag)), 0);
}

function followsInArchive(candidate, current) {
  return candidate.date < current.date;
}

function relatedPastArticles(articles, current) {
  return articles
    .filter((item) => item.sourceDirName !== current.sourceDirName && followsInArchive(item, current))
    .map((article) => ({ article, sharedTags: sharedTagCount(current, article) }))
    .sort((left, right) =>
      right.sharedTags - left.sharedTags ||
      right.article.date.localeCompare(left.article.date) ||
      left.article.sourceDirName.localeCompare(right.article.sourceDirName));
}

// Keep a singleton topic from becoming a dead end. Follow same-topic history
// first, then articles with shared tags, then the nearest earlier archive item.
export function nextStreamArticle(articles, current) {
  const topic = nextTopicArticle(articles, current);
  if (topic) return { article: topic, relation: "topic" };
  const related = relatedPastArticles(articles, current);
  const candidate = related.find((item) => item.sharedTags > 0) ?? related[0];
  if (!candidate) return null;
  if (candidate.article.date === current.date) return { article: candidate.article, relation: "same-day" };
  return { article: candidate.article, relation: candidate.sharedTags > 0 ? "related" : "archive" };
}

export function readingSequence(articles, current) {
  const topic = topicSequence(articles, current);
  if (topic.length > 1) return topic;
  const related = relatedPastArticles(articles, current).slice(0, 5).map(({ article }) => article);
  return [current, ...related];
}
