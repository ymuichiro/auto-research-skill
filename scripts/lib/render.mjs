import { absoluteUrl, assetPath, localizedPath, siteConfig } from "./site-config.mjs";
import { escapeHtml, formatDisplayDate, formatXml, stripHtml } from "./utils.mjs";

const localeCopy = {
  ja: {
    homeTitle: "トップ",
    archiveTitle: "アーカイブ",
    latestTitle: "最新レポート",
    archiveIntro: "公開済みレポートを日付順に一覧化しています。",
    latestIntro:
      "経営層向けに、AI の導入事例、ユースケース、技術トレンドをインフォグラフィック形式で整理しています。",
    sourceHeading: "公開根拠",
    sourceNote: "公開ページでは、公式ドキュメントまたは論文として確認できた根拠のみを掲載しています。",
    allReports: "すべてのレポートを見る",
    editorialCardTitle: "編集方針",
    editorialCardBody: "一次情報で話題を確認し、公開時は公式ドキュメントと論文だけに絞って根拠を提示します。",
    policyCardTitle: "配信契約",
    policyCardBody: "日英別ページ、SEO metadata、Atom feed、GitHub Pages 配信を標準化しています。",
    audienceCardTitle: "対象読者",
    audienceCardBody: "ビジネスの経営層が短時間で判断に使えるよう、論点と前提条件を分けて提示します。",
    readReport: "レポートを開く",
    sourceCount: "根拠数",
    tagHeading: "Tags",
    languageSwitch: "English",
    homePath: "",
    archivePath: "archive/"
  },
  en: {
    homeTitle: "Home",
    archiveTitle: "Archive",
    latestTitle: "Latest Briefings",
    archiveIntro: "Published briefings listed in reverse chronological order.",
    latestIntro:
      "Executive-oriented briefings on AI deployments, use cases, and technical direction, presented as static infographics.",
    sourceHeading: "Published evidence",
    sourceNote:
      "Public pages list only evidence that can be verified as official documentation or papers.",
    allReports: "Browse the archive",
    editorialCardTitle: "Editorial policy",
    editorialCardBody:
      "Topics can be discovered broadly, but publication evidence is restricted to official documentation and papers.",
    policyCardTitle: "Publishing contract",
    policyCardBody:
      "Bilingual pages, SEO metadata, Atom feeds, and GitHub Pages deployment are part of the default release flow.",
    audienceCardTitle: "Audience",
    audienceCardBody:
      "Each briefing is structured so executives can separate signals, caveats, and implications quickly.",
    readReport: "Open briefing",
    sourceCount: "Sources",
    tagHeading: "Tags",
    languageSwitch: "日本語",
    homePath: "en/",
    archivePath: "en/archive/"
  }
};

function languageToggle(locale, canonicalPath) {
  const opposite = locale === "ja" ? "en" : "ja";
  const oppositePath = locale === "ja" ? `en/${canonicalPath}` : canonicalPath.replace(/^en\//, "");
  return {
    label: localeCopy[locale].languageSwitch,
    href: localizedPath(opposite, oppositePath.replace(/^en\//, ""))
  };
}

function pageTitle(title, locale) {
  if (title === siteConfig.name) {
    return locale === "ja" ? siteConfig.name : `${siteConfig.name} EN`;
  }

  return `${title} | ${siteConfig.name} ${locale === "ja" ? "" : "EN"}`.trim();
}

function metaDescription(description, locale) {
  return description || siteConfig.description[locale];
}

function jsonLdBlock(payload) {
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}

function sourceTypeBadge(type) {
  return type === "official" ? "badge-primary" : "badge-secondary";
}

export function renderPage({
  locale,
  relativePath,
  title,
  description,
  pageHeading,
  pageIntro,
  body,
  currentNavPath,
  article,
  pageType = "website"
}) {
  const alternateRelativePath = locale === "ja" ? `en/${relativePath}` : relativePath.replace(/^en\//, "");
  const canonicalUrl = absoluteUrl(relativePath);
  const alternateUrl = absoluteUrl(alternateRelativePath);
  const defaultLocaleUrl = absoluteUrl(locale === "ja" ? relativePath : relativePath.replace(/^en\//, ""));
  const toggle = languageToggle(locale, relativePath);
  const copy = localeCopy[locale];
  const schema =
    pageType === "article" && article
      ? {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: locale === "ja" ? article.titleJa : article.titleEn,
          description: locale === "ja" ? article.summaryJa : article.summaryEn,
          datePublished: article.date,
          inLanguage: locale,
          mainEntityOfPage: canonicalUrl,
          publisher: {
            "@type": "Organization",
            name: siteConfig.owner
          },
          author: {
            "@type": "Organization",
            name: siteConfig.owner
          },
          url: canonicalUrl,
          image: absoluteUrl(siteConfig.ogImage)
        }
      : {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description: metaDescription(description, locale),
          inLanguage: locale,
          url: canonicalUrl
        };

  const navLinks = siteConfig.nav[locale]
    .map((item) => {
      const href = localizedPath(locale, item.path.replace(/^en\//, ""));
      const active = currentNavPath === item.path;
      return `<a class="btn btn-sm ${active ? "btn-primary" : "btn-ghost"} rounded-full" href="${href}">${escapeHtml(
        item.label
      )}</a>`;
    })
    .join("");

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(pageTitle(title, locale))}</title>
    <meta name="description" content="${escapeHtml(metaDescription(description, locale))}">
    <meta name="theme-color" content="${siteConfig.themeColor}">
    <meta property="og:type" content="${pageType === "article" ? "article" : "website"}">
    <meta property="og:site_name" content="${escapeHtml(siteConfig.name)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(metaDescription(description, locale))}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:image" content="${absoluteUrl(siteConfig.ogImage)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(metaDescription(description, locale))}">
    <meta name="twitter:image" content="${absoluteUrl(siteConfig.ogImage)}">
    <link rel="canonical" href="${canonicalUrl}">
    <link rel="alternate" hreflang="${locale}" href="${canonicalUrl}">
    <link rel="alternate" hreflang="${locale === "ja" ? "en" : "ja"}" href="${alternateUrl}">
    <link rel="alternate" hreflang="x-default" href="${defaultLocaleUrl}">
    <link rel="alternate" type="application/atom+xml" href="${absoluteUrl(locale === "ja" ? "feed.xml" : "en/feed.xml")}" title="${escapeHtml(
      siteConfig.name
    )}">
    <link rel="icon" href="${assetPath("assets/favicon.svg")}" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${assetPath("assets/site.css")}">
    ${jsonLdBlock(schema)}
  </head>
  <body class="min-h-screen bg-base-100 text-base-content">
    <div class="page-shell">
      <div class="hero-backdrop"></div>
      <header class="site-header">
        <a class="brand-mark" href="${localizedPath(locale, "")}">
          <span class="brand-badge">${locale === "ja" ? "AR" : "AR"}</span>
          <span>
            <span class="block text-xs uppercase tracking-[0.3em] text-secondary">${escapeHtml(
              siteConfig.heroKicker[locale]
            )}</span>
            <span class="block font-display text-lg font-bold text-primary">${escapeHtml(siteConfig.name)}</span>
          </span>
        </a>
        <nav class="flex flex-wrap items-center gap-2">${navLinks}</nav>
        <a class="btn btn-sm btn-outline rounded-full" href="${toggle.href}">${escapeHtml(toggle.label)}</a>
      </header>
      <main class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 pt-6 md:px-8">
        <section class="hero-panel">
          <div class="max-w-3xl">
            <p class="section-kicker">${escapeHtml(siteConfig.heroKicker[locale])}</p>
            <h1 class="font-display text-4xl font-bold tracking-tight text-primary md:text-6xl">${escapeHtml(
              pageHeading
            )}</h1>
            <p class="mt-4 max-w-2xl text-base leading-7 text-slate-700 md:text-lg">${escapeHtml(pageIntro)}</p>
          </div>
          <div class="hero-aside">
            <div class="metric-card">
              <p class="metric-label">Evidence rule</p>
              <p class="metric-value">Official docs / Papers</p>
            </div>
            <div class="metric-card">
              <p class="metric-label">Delivery</p>
              <p class="metric-value">Static HTML + GitHub Pages</p>
            </div>
            <div class="metric-card">
              <p class="metric-label">Format</p>
              <p class="metric-value">Executive infographic briefing</p>
            </div>
          </div>
        </section>
        ${body}
      </main>
      <footer class="footer-panel">
        <div>
          <p class="font-display text-lg font-semibold text-primary">${escapeHtml(siteConfig.name)}</p>
          <p class="mt-2 max-w-xl text-sm leading-6 text-slate-600">${escapeHtml(siteConfig.taglines[locale])}</p>
        </div>
        <div class="text-sm text-slate-600">
          <p>${escapeHtml(copy.sourceNote)}</p>
          <p class="mt-2">© ${new Date().getUTCFullYear()} ${escapeHtml(siteConfig.owner)}</p>
        </div>
      </footer>
    </div>
  </body>
</html>`;
}

function renderArticleCard(article, locale) {
  const title = locale === "ja" ? article.titleJa : article.titleEn;
  const summary = locale === "ja" ? article.summaryJa : article.summaryEn;
  const path = locale === "ja" ? article.outputPaths.ja : article.outputPaths.en;
  const copy = localeCopy[locale];

  return `<article class="article-card">
    <div class="flex items-center justify-between gap-3">
      <span class="badge badge-secondary badge-outline uppercase">${escapeHtml(article.category)}</span>
      <time class="text-sm text-slate-500" datetime="${article.date}">${escapeHtml(
        formatDisplayDate(article.date, locale)
      )}</time>
    </div>
    <h2 class="mt-4 font-display text-2xl font-semibold text-primary">${escapeHtml(title)}</h2>
    <p class="mt-3 text-sm leading-7 text-slate-700">${escapeHtml(summary)}</p>
    <div class="mt-5 flex flex-wrap gap-2">${article.tags
      .map((tag) => `<span class="badge badge-outline">${escapeHtml(tag)}</span>`)
      .join("")}</div>
    <div class="mt-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
      <span class="text-xs uppercase tracking-[0.25em] text-slate-500">${copy.sourceCount}: ${article.publishedSources.length}</span>
      <a class="btn btn-primary btn-sm rounded-full" href="${localizedPath(locale, path.replace(/^en\//, ""))}">${escapeHtml(
        copy.readReport
      )}</a>
    </div>
  </article>`;
}

export function renderIndexPage(locale, articles) {
  const copy = localeCopy[locale];
  const cards = articles.map((article) => renderArticleCard(article, locale)).join("");
  const body = `<section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
    <div class="panel-block">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="section-kicker">${escapeHtml(copy.latestTitle)}</p>
          <h2 class="panel-title">${escapeHtml(copy.latestTitle)}</h2>
        </div>
        <a class="btn btn-outline btn-sm rounded-full" href="${localizedPath(locale, copy.archivePath.replace(/^en\//, ""))}">${escapeHtml(
          copy.allReports
        )}</a>
      </div>
      <div class="mt-6 grid gap-5">${cards || '<div class="empty-state">No published reports yet.</div>'}</div>
    </div>
    <aside class="panel-stack">
      <section class="insight-panel">
        <p class="section-kicker">${escapeHtml(copy.editorialCardTitle)}</p>
        <h2 class="panel-title">${escapeHtml(copy.editorialCardTitle)}</h2>
        <p class="panel-copy">${escapeHtml(copy.editorialCardBody)}</p>
      </section>
      <section class="insight-panel">
        <p class="section-kicker">${escapeHtml(copy.policyCardTitle)}</p>
        <h2 class="panel-title">${escapeHtml(copy.policyCardTitle)}</h2>
        <p class="panel-copy">${escapeHtml(copy.policyCardBody)}</p>
      </section>
      <section class="insight-panel">
        <p class="section-kicker">${escapeHtml(copy.audienceCardTitle)}</p>
        <h2 class="panel-title">${escapeHtml(copy.audienceCardTitle)}</h2>
        <p class="panel-copy">${escapeHtml(copy.audienceCardBody)}</p>
      </section>
    </aside>
  </section>`;

  return renderPage({
    locale,
    relativePath: locale === "ja" ? "" : "en/",
    title: siteConfig.name,
    description: siteConfig.description[locale],
    pageHeading: siteConfig.taglines[locale],
    pageIntro: copy.latestIntro,
    body,
    currentNavPath: copy.homePath
  });
}

export function renderArchivePage(locale, articles) {
  const copy = localeCopy[locale];
  const body = `<section class="panel-block">
    <p class="section-kicker">${escapeHtml(copy.archiveTitle)}</p>
    <h2 class="panel-title">${escapeHtml(copy.archiveTitle)}</h2>
    <p class="panel-copy">${escapeHtml(copy.archiveIntro)}</p>
    <div class="mt-8 grid gap-5">${articles.map((article) => renderArticleCard(article, locale)).join("")}</div>
  </section>`;

  return renderPage({
    locale,
    relativePath: locale === "ja" ? "archive/index.html" : "en/archive/index.html",
    title: copy.archiveTitle,
    description: copy.archiveIntro,
    pageHeading: copy.archiveTitle,
    pageIntro: copy.archiveIntro,
    body,
    currentNavPath: copy.archivePath
  });
}

function renderSources(article, locale) {
  const copy = localeCopy[locale];

  return `<section class="panel-block">
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="section-kicker">${escapeHtml(copy.sourceHeading)}</p>
        <h2 class="panel-title">${escapeHtml(copy.sourceHeading)}</h2>
      </div>
      <p class="max-w-xl text-sm leading-6 text-slate-600">${escapeHtml(copy.sourceNote)}</p>
    </div>
    <div class="mt-6 grid gap-4">
      ${article.publishedSources
        .map((source) => {
          const publishedAt = source.publishedAt
            ? `<span class="text-sm text-slate-500">${escapeHtml(formatDisplayDate(source.publishedAt, locale))}</span>`
            : "";
          return `<a class="source-row" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <span class="badge ${sourceTypeBadge(source.type)}">${escapeHtml(source.type)}</span>
                ${publishedAt}
              </div>
              <p class="mt-2 text-base font-medium text-primary">${escapeHtml(source.label)}</p>
              <p class="mt-1 text-xs text-slate-500">${escapeHtml(source.url)}</p>
            </div>
            <span class="text-xs uppercase tracking-[0.25em] text-secondary">Open</span>
          </a>`;
        })
        .join("")}
    </div>
  </section>`;
}

export function renderArticlePage(article, locale) {
  const title = locale === "ja" ? article.titleJa : article.titleEn;
  const summary = locale === "ja" ? article.summaryJa : article.summaryEn;
  const relativePath = locale === "ja" ? article.outputPaths.ja : article.outputPaths.en;
  const body = `<article class="article-shell">
    <section class="article-meta">
      <div class="flex flex-wrap items-center gap-3">
        <span class="badge badge-secondary">${escapeHtml(article.category)}</span>
        <time class="text-sm text-slate-500" datetime="${article.date}">${escapeHtml(
          formatDisplayDate(article.date, locale)
        )}</time>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">${article.tags
        .map((tag) => `<span class="badge badge-outline">${escapeHtml(tag)}</span>`)
        .join("")}</div>
    </section>
    <section class="article-body">${locale === "ja" ? article.bodies.ja : article.bodies.en}</section>
    ${renderSources(article, locale)}
  </article>`;

  return renderPage({
    locale,
    relativePath,
    title,
    description: summary,
    pageHeading: title,
    pageIntro: summary,
    body,
    currentNavPath: localeCopy[locale].homePath,
    article,
    pageType: "article"
  });
}

export function renderAtomFeed(locale, articles) {
  const feedPath = locale === "ja" ? "feed.xml" : "en/feed.xml";
  const updated = articles[0]?.date ?? new Date().toISOString().slice(0, 10);
  const entries = articles
    .map((article) => {
      const title = locale === "ja" ? article.titleJa : article.titleEn;
      const summary = locale === "ja" ? article.summaryJa : article.summaryEn;
      const relativePath = locale === "ja" ? article.outputPaths.ja : article.outputPaths.en;
      return `<entry>
  <title>${formatXml(title)}</title>
  <link href="${formatXml(absoluteUrl(relativePath))}"/>
  <id>${formatXml(absoluteUrl(relativePath))}</id>
  <updated>${article.date}T00:00:00Z</updated>
  <summary>${formatXml(summary)}</summary>
  <content type="html">${formatXml(stripHtml(locale === "ja" ? article.bodies.ja : article.bodies.en))}</content>
</entry>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${formatXml(siteConfig.name)}${locale === "en" ? " EN" : ""}</title>
  <subtitle>${formatXml(siteConfig.description[locale])}</subtitle>
  <link href="${formatXml(absoluteUrl(feedPath))}" rel="self"/>
  <link href="${formatXml(absoluteUrl(locale === "ja" ? "" : "en/"))}"/>
  <updated>${updated}T00:00:00Z</updated>
  <id>${formatXml(absoluteUrl(feedPath))}</id>
  ${entries}
</feed>`;
}

export function renderSitemap(entries) {
  return `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${formatXml(absoluteUrl(entry.path))}</loc>
    <lastmod>${entry.lastModified}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;
}

export function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("sitemap.xml")}
`;
}

export function renderDefaultOgSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">Auto Research Digest</title>
  <desc id="desc">Executive Research Signal</desc>
  <defs>
    <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
      <stop offset="0%" stop-color="#f7f1e6"/>
      <stop offset="100%" stop-color="#efe5d5"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g stroke="#132238" stroke-opacity="0.15">
    <path d="M120 120H1080"/>
    <path d="M120 210H1080"/>
    <path d="M120 300H1080"/>
    <path d="M120 390H1080"/>
    <path d="M120 480H1080"/>
    <path d="M120 120V510"/>
    <path d="M300 120V510"/>
    <path d="M480 120V510"/>
    <path d="M660 120V510"/>
    <path d="M840 120V510"/>
    <path d="M1020 120V510"/>
  </g>
  <rect x="120" y="140" width="360" height="160" rx="28" fill="#132238"/>
  <rect x="510" y="140" width="560" height="110" rx="24" fill="#ffffff" fill-opacity="0.85"/>
  <rect x="510" y="280" width="250" height="160" rx="24" fill="#d14c2f" fill-opacity="0.12"/>
  <rect x="790" y="280" width="280" height="160" rx="24" fill="#132238" fill-opacity="0.08"/>
  <text x="160" y="210" fill="#f7f1e6" font-size="28" font-family="'IBM Plex Sans', sans-serif" letter-spacing="8">EXECUTIVE RESEARCH SIGNAL</text>
  <text x="160" y="260" fill="#f7f1e6" font-size="64" font-weight="700" font-family="'Space Grotesk', sans-serif">Auto Research Digest</text>
  <text x="550" y="200" fill="#132238" font-size="34" font-weight="700" font-family="'Space Grotesk', sans-serif">LLM • AI • AI Agents</text>
  <text x="550" y="238" fill="#132238" font-size="24" font-family="'IBM Plex Sans', sans-serif">Static executive briefings backed by official docs and papers.</text>
  <text x="550" y="350" fill="#132238" font-size="22" font-family="'IBM Plex Sans', sans-serif">Neutral tone</text>
  <text x="550" y="386" fill="#132238" font-size="22" font-family="'IBM Plex Sans', sans-serif">Infographic HTML</text>
  <text x="550" y="422" fill="#132238" font-size="22" font-family="'IBM Plex Sans', sans-serif">GitHub Pages delivery</text>
  <text x="830" y="350" fill="#132238" font-size="22" font-family="'IBM Plex Sans', sans-serif">Bilingual output</text>
  <text x="830" y="386" fill="#132238" font-size="22" font-family="'IBM Plex Sans', sans-serif">SEO metadata</text>
  <text x="830" y="422" fill="#132238" font-size="22" font-family="'IBM Plex Sans', sans-serif">Atom feed</text>
</svg>`;
}

export function renderFaviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#132238"/>
  <path d="M26 88V40h18l20 28 20-28h18v48H84V68L64 94 44 68v20H26z" fill="#f7f1e6"/>
</svg>`;
}
