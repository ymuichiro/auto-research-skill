import { absoluteUrl, assetPath, localizedPath, siteConfig } from "./site-config.mjs";
import { escapeHtml, formatDisplayDate, formatXml, stripHtml } from "./utils.mjs";

const localeCopy = {
  ja: {
    homeTitle: "トップ",
    archiveTitle: "アーカイブ",
    latestTitle: "最新レポート",
    archiveIntro: "公開済みレポートを日付順に一覧化しています。",
    latestIntro:
      "AI の導入事例、ユースケース、技術トレンドをインフォグラフィック形式で整理しています。",
    sourceHeading: "公開根拠",
    sourceNote: "公開ページでは、公式ドキュメントまたは論文として確認できた根拠のみを掲載しています。",
    allReports: "すべてのレポートを見る",
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
      "Static infographic briefings on AI deployments, use cases, and technical direction.",
    sourceHeading: "Published evidence",
    sourceNote:
      "Public pages list only evidence that can be verified as official documentation or papers.",
    allReports: "Browse the archive",
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
      return `<a class="nav-link ${active ? "is-active" : ""}" href="${href}">${escapeHtml(item.label)}</a>`;
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
    <meta name="google-site-verification" content="pGpaqomDQhOY9S0FpVai7gdUDKDtDe-g0eMbrpNUkTs">
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
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${assetPath("assets/site.css")}">
    ${jsonLdBlock(schema)}
  </head>
  <body>
    <div class="page-shell">
      <div class="hero-backdrop"></div>
      <header class="site-header">
        <a class="brand-mark" href="${localizedPath(locale, "")}">
          <span class="brand-badge">AR /</span>
          <span class="brand-copy">${escapeHtml(siteConfig.name)}</span>
        </a>
        <nav class="site-nav">${navLinks}</nav>
        <a class="lang-switch" href="${toggle.href}">${escapeHtml(toggle.label)}</a>
      </header>
      <main class="site-main">
        <section class="hero-panel">
          <p class="section-kicker">${escapeHtml(siteConfig.heroKicker[locale])}</p>
          <h1 class="hero-title">${escapeHtml(pageHeading)}</h1>
          <p class="hero-copy">${escapeHtml(pageIntro)}</p>
        </section>
        <div class="content-stack">
          ${body}
        </div>
      </main>
      <footer class="footer-panel">
        <p class="footer-brand">AR / ${escapeHtml(siteConfig.name)}</p>
        <p class="footer-copy">${escapeHtml(siteConfig.taglines[locale])}</p>
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
    <div class="meta-row justify-between">
      <span class="meta-pill is-accent">${escapeHtml(article.category)}</span>
      <time class="mono-note" datetime="${article.date}">${escapeHtml(formatDisplayDate(article.date, locale))}</time>
    </div>
    <h2 class="article-card-title">${escapeHtml(title)}</h2>
    <p class="article-card-copy">${escapeHtml(summary)}</p>
    <div class="meta-tags">${article.tags
      .map((tag) => `<span class="meta-chip">${escapeHtml(tag)}</span>`)
      .join("")}</div>
    <div class="article-card-foot">
      <span class="mono-note">${copy.sourceCount}: ${article.publishedSources.length}</span>
      <a class="text-link" href="${localizedPath(locale, path.replace(/^en\//, ""))}">${escapeHtml(copy.readReport)}</a>
    </div>
  </article>`;
}

export function renderIndexPage(locale, articles) {
  const copy = localeCopy[locale];
  const cards = articles.map((article) => renderArticleCard(article, locale)).join("");
  const body = `<section class="panel-block">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="section-kicker">${escapeHtml(copy.latestTitle)}</p>
          <h2 class="panel-title">${escapeHtml(copy.latestTitle)}</h2>
        </div>
        <a class="text-link" href="${localizedPath(locale, copy.archivePath.replace(/^en\//, ""))}">${escapeHtml(copy.allReports)}</a>
      </div>
      <div class="mt-6 grid gap-5">${cards || '<div class="empty-state">No published reports yet.</div>'}</div>
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
      <p class="panel-copy max-w-xl md:mt-0">${escapeHtml(copy.sourceNote)}</p>
    </div>
    <div class="mt-6 grid gap-4">
      ${article.publishedSources
        .map((source) => {
          const publishedAt = source.publishedAt
            ? `<span class="mono-note">${escapeHtml(formatDisplayDate(source.publishedAt, locale))}</span>`
            : "";
          return `<a class="source-row" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
            <div>
              <div class="meta-row">
                <span class="source-kind ${source.type === "official" ? "is-official" : ""}">${escapeHtml(source.type)}</span>
                ${publishedAt}
              </div>
              <p class="source-title">${escapeHtml(source.label)}</p>
              <p class="source-url">${escapeHtml(source.url)}</p>
            </div>
            <span class="source-action">Open</span>
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
      <div class="meta-row">
        <span class="meta-pill is-accent">${escapeHtml(article.category)}</span>
        <time class="mono-note" datetime="${article.date}">${escapeHtml(formatDisplayDate(article.date, locale))}</time>
      </div>
      <div class="meta-tags">${article.tags
        .map((tag) => `<span class="meta-chip">${escapeHtml(tag)}</span>`)
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
  const normalizeLastModified = (value) => {
    if (!value) {
      return new Date().toISOString();
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return `${value}T00:00:00Z`;
    }

    return value;
  };

  return `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map(
    (entry) => `  <url>
    <loc>${formatXml(absoluteUrl(entry.path))}</loc>
${(entry.alternates ?? [])
  .map(
    (alternate) =>
      `    <xhtml:link rel="alternate" hreflang="${formatXml(alternate.hreflang)}" href="${formatXml(
        absoluteUrl(alternate.path)
      )}"/>`
  )
  .join("\n")}
    <lastmod>${normalizeLastModified(entry.lastModified)}</lastmod>
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
  <desc id="desc">Research Signal</desc>
  <defs>
    <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse">
      <path d="M 42 0 L 0 0 0 42" fill="none" stroke="#1f2433" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#0d0f14"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect x="104" y="116" width="992" height="392" rx="28" fill="#13161f" stroke="#1f2433"/>
  <text x="138" y="168" fill="#4af0d4" font-size="24" font-family="'DM Mono', monospace" letter-spacing="10">RESEARCH SIGNAL</text>
  <text x="138" y="248" fill="#eef2ff" font-size="66" font-weight="500" font-family="'Noto Sans JP', sans-serif">Auto Research Digest</text>
  <text x="138" y="316" fill="#c0cce0" font-size="28" font-family="'Noto Sans JP', sans-serif">Neutral research briefings for LLM, AI, and AI agents.</text>
  <rect x="138" y="378" width="282" height="96" rx="18" fill="#10131b" stroke="#1f2433"/>
  <rect x="454" y="378" width="282" height="96" rx="18" fill="#10131b" stroke="#1f2433"/>
  <rect x="770" y="378" width="282" height="96" rx="18" fill="#10131b" stroke="#1f2433"/>
  <text x="166" y="415" fill="#4af0d4" font-size="18" font-family="'DM Mono', monospace" letter-spacing="4">SIGNAL</text>
  <text x="166" y="450" fill="#eef2ff" font-size="26" font-family="'Noto Sans JP', sans-serif">Official docs / Papers</text>
  <text x="482" y="415" fill="#4af0d4" font-size="18" font-family="'DM Mono', monospace" letter-spacing="4">FORMAT</text>
  <text x="482" y="450" fill="#eef2ff" font-size="26" font-family="'Noto Sans JP', sans-serif">Static HTML editorial pages</text>
  <text x="798" y="415" fill="#4af0d4" font-size="18" font-family="'DM Mono', monospace" letter-spacing="4">OUTPUT</text>
  <text x="798" y="450" fill="#eef2ff" font-size="26" font-family="'Noto Sans JP', sans-serif">Bilingual research briefings</text>
</svg>`;
}

export function renderFaviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#0d0f14"/>
  <path d="M26 88V40h16l22 27 21-27h17v48H84V66L64 92 44 66v22H26z" fill="#eef2ff"/>
  <path d="M18 24H110" stroke="#4af0d4" stroke-width="4" stroke-linecap="round"/>
</svg>`;
}
