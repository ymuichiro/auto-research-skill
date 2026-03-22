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

function localeTag(locale) {
  return locale === "ja" ? "ja_JP" : "en_US";
}

function breadcrumbPayload(locale, items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    })),
    inLanguage: locale
  };
}

function pageSchemas({ locale, title, description, canonicalUrl, article, pageType, breadcrumbs, imageUrl }) {
  const payloads = [];

  if (pageType === "article" && article) {
    payloads.push({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: locale === "ja" ? article.titleJa : article.titleEn,
      description: locale === "ja" ? article.summaryJa : article.summaryEn,
      datePublished: article.publishedAtIso,
      dateModified: article.lastModified,
      inLanguage: locale,
      isAccessibleForFree: true,
      articleSection: article.category,
      keywords: article.tags.join(", "),
      mainEntityOfPage: canonicalUrl,
      publisher: {
        "@type": "Organization",
        name: siteConfig.owner,
        url: siteConfig.siteUrl
      },
      author: {
        "@type": "Organization",
        name: siteConfig.owner,
        url: siteConfig.siteUrl
      },
      url: canonicalUrl,
      image: [imageUrl]
    });
  } else {
    payloads.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description: metaDescription(description, locale),
      inLanguage: locale,
      url: canonicalUrl
    });
  }

  if (breadcrumbs?.length) {
    payloads.push(breadcrumbPayload(locale, breadcrumbs));
  }

  return payloads.map((payload) => jsonLdBlock(payload)).join("\n    ");
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
  pageType = "website",
  breadcrumbs = [],
  robotsContent = siteConfig.defaultRobots,
  imagePath = siteConfig.ogImage
}) {
  const alternateRelativePath = locale === "ja" ? `en/${relativePath}` : relativePath.replace(/^en\//, "");
  const canonicalUrl = absoluteUrl(relativePath);
  const alternateUrl = absoluteUrl(alternateRelativePath);
  const defaultLocaleUrl = absoluteUrl(locale === "ja" ? relativePath : relativePath.replace(/^en\//, ""));
  const pageImageUrl = absoluteUrl(imagePath);
  const toggle = languageToggle(locale, relativePath);
  const copy = localeCopy[locale];
  const schemaBlocks = pageSchemas({
    locale,
    title,
    description,
    canonicalUrl,
    article,
    pageType,
    breadcrumbs,
    imageUrl: pageImageUrl
  });

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
    <meta name="robots" content="${escapeHtml(robotsContent)}">
    <meta name="author" content="${escapeHtml(siteConfig.owner)}">
    <meta name="theme-color" content="${siteConfig.themeColor}">
    <meta name="google-site-verification" content="pGpaqomDQhOY9S0FpVai7gdUDKDtDe-g0eMbrpNUkTs">
    <meta property="og:type" content="${pageType === "article" ? "article" : "website"}">
    <meta property="og:locale" content="${localeTag(locale)}">
    <meta property="og:locale:alternate" content="${localeTag(locale === "ja" ? "en" : "ja")}">
    <meta property="og:site_name" content="${escapeHtml(siteConfig.name)}">
    <meta property="og:title" content="${escapeHtml(pageTitle(title, locale))}">
    <meta property="og:description" content="${escapeHtml(metaDescription(description, locale))}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:image" content="${pageImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(pageTitle(title, locale))}">
    <meta name="twitter:description" content="${escapeHtml(metaDescription(description, locale))}">
    <meta name="twitter:image" content="${pageImageUrl}">
    <meta name="twitter:image:alt" content="${escapeHtml(title)}">
    <link rel="canonical" href="${canonicalUrl}">
    <link rel="alternate" hreflang="${locale}" href="${canonicalUrl}">
    <link rel="alternate" hreflang="${locale === "ja" ? "en" : "ja"}" href="${alternateUrl}">
    <link rel="alternate" hreflang="x-default" href="${defaultLocaleUrl}">
    <link rel="alternate" type="application/atom+xml" href="${absoluteUrl(locale === "ja" ? "feed.xml" : "en/feed.xml")}" title="${escapeHtml(
      siteConfig.name
    )}">
    <link rel="icon" href="${assetPath("assets/favicon.ico")}" sizes="any">
    <link rel="shortcut icon" href="${assetPath("assets/favicon.ico")}">
    <link rel="icon" href="${assetPath("assets/favicon.svg")}" type="image/svg+xml" sizes="any">
    <link rel="icon" href="${assetPath("assets/favicon-32.png")}" type="image/png" sizes="32x32">
    <link rel="icon" href="${assetPath("assets/favicon-16.png")}" type="image/png" sizes="16x16">
    <link rel="apple-touch-icon" href="${assetPath("assets/apple-touch-icon.png")}" sizes="180x180">
    <link rel="manifest" href="${assetPath("site.webmanifest")}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${assetPath("assets/site.css")}">
    ${pageType === "article" && article
      ? `<meta property="article:published_time" content="${article.publishedAtIso}">
    <meta property="article:modified_time" content="${article.lastModified}">
    <meta property="article:section" content="${escapeHtml(article.category)}">
    ${article.tags
      .map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}">`)
      .join("\n    ")}`
      : ""}
    ${schemaBlocks}
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
    title: siteConfig.seo.homeTitle[locale],
    description: siteConfig.description[locale],
    pageHeading: siteConfig.taglines[locale],
    pageIntro: copy.latestIntro,
    body,
    currentNavPath: copy.homePath,
    breadcrumbs: [{ name: copy.homeTitle, path: copy.homePath }]
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
    relativePath: locale === "ja" ? "archive/" : "en/archive/",
    title: siteConfig.seo.archiveTitle[locale],
    description: siteConfig.seo.archiveDescription[locale],
    pageHeading: copy.archiveTitle,
    pageIntro: copy.archiveIntro,
    body,
    currentNavPath: copy.archivePath,
    breadcrumbs: [
      { name: copy.homeTitle, path: copy.homePath },
      { name: copy.archiveTitle, path: copy.archivePath }
    ]
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
    imagePath: siteConfig.ogImage,
    breadcrumbs: [
      { name: localeCopy[locale].homeTitle, path: localeCopy[locale].homePath },
      { name: localeCopy[locale].archiveTitle, path: localeCopy[locale].archivePath },
      { name: title, path: relativePath }
    ],
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

export function renderNotFoundPage(locale, articles) {
  const copy = localeCopy[locale];
  const cards = articles.slice(0, 3).map((article) => renderArticleCard(article, locale)).join("");
  const body = `<section class="panel-block">
    <p class="section-kicker">404</p>
    <h2 class="panel-title">${locale === "ja" ? "ページが見つかりません" : "Page not found"}</h2>
    <p class="panel-copy">${locale === "ja"
      ? "指定された URL のページは見つかりませんでした。公開済みのレポート一覧から目的の記事を探せます。"
      : "The requested URL could not be found. You can continue from the published briefing archive below."}</p>
    <div class="mt-6 flex flex-wrap gap-3">
      <a class="text-link" href="${localizedPath(locale, "")}">${escapeHtml(copy.homeTitle)}</a>
      <a class="text-link" href="${localizedPath(locale, copy.archivePath.replace(/^en\//, ""))}">${escapeHtml(copy.archiveTitle)}</a>
    </div>
    <div class="mt-8 grid gap-5">${cards}</div>
  </section>`;

  return renderPage({
    locale,
    relativePath: "404.html",
    title: locale === "ja" ? "ページが見つかりません" : "Page not found",
    description: locale === "ja" ? "404 エラーのページです。" : "404 error page.",
    pageHeading: locale === "ja" ? "ページが見つかりません" : "Page not found",
    pageIntro:
      locale === "ja"
        ? "公開済みのレポート一覧から目的の記事を探せます。"
        : "Continue from the published archive to find the article you wanted.",
    body,
    currentNavPath: copy.homePath,
    breadcrumbs: [
      { name: copy.homeTitle, path: copy.homePath },
      { name: "404", path: "404.html" }
    ],
    robotsContent: "noindex,follow"
  });
}

export function renderSitemapIndex(entries) {
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
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <sitemap>
    <loc>${formatXml(absoluteUrl(entry.path))}</loc>
    <lastmod>${normalizeLastModified(entry.lastModified)}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">Auto Research Digest favicon</title>
  <desc id="desc">AR monogram on a dark grid with a cyan signal slash.</desc>
  <defs>
    <linearGradient id="bg" x1="32" y1="22" x2="224" y2="232" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#071018"/>
      <stop offset="0.55" stop-color="#0a1822"/>
      <stop offset="1" stop-color="#08111b"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="44%" r="72%">
      <stop offset="0" stop-color="#0f3342" stop-opacity="0.75"/>
      <stop offset="0.62" stop-color="#0a1822" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#08111b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="metal" x1="70" y1="70" x2="198" y2="192" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.38" stop-color="#f2f7ff"/>
      <stop offset="1" stop-color="#cfd7e6"/>
    </linearGradient>
    <linearGradient id="slash" x1="84" y1="162" x2="208" y2="110" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#00a9b0"/>
      <stop offset="0.5" stop-color="#12d9df"/>
      <stop offset="1" stop-color="#66ffe8"/>
    </linearGradient>
    <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
      <path d="M 26 0 L 0 0 0 26" fill="none" stroke="#1a4b61" stroke-width="1.2" opacity="0.85"/>
    </pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
    <filter id="slashGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#25f4ee" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#bg)"/>
  <rect width="256" height="256" rx="56" fill="url(#glow)"/>
  <rect width="256" height="256" rx="56" fill="url(#grid)" opacity="0.92"/>
  <g fill="#2df7ff" opacity="0.9">
    <circle cx="48" cy="54" r="2.7"/>
    <circle cx="78" cy="158" r="2.3"/>
    <circle cx="124" cy="112" r="1.9"/>
    <circle cx="186" cy="76" r="2.2"/>
    <circle cx="208" cy="164" r="2.4"/>
  </g>
  <g fill="#2df7ff" opacity="0.45">
    <circle cx="66" cy="92" r="1.1"/>
    <circle cx="96" cy="66" r="1"/>
    <circle cx="164" cy="54" r="1"/>
    <circle cx="214" cy="104" r="1.1"/>
    <circle cx="168" cy="188" r="1.2"/>
  </g>
  <g filter="url(#shadow)">
    <path d="M44 188 102 80h24l-58 108Z" fill="url(#metal)"/>
    <path d="m122 80 22 45-18 8-22-53Z" fill="url(#metal)"/>
    <path d="M132 188 105 135l21-10 31 63Z" fill="url(#metal)"/>
    <path d="M138 80h58c24 0 38 13 38 34v11c0 19-10 31-28 35l31 28h-31l-29-28h-19v28h-25Zm25 20v40h31c10 0 15-3 19-8 4-4 6-10 6-16v-2c0-10-5-14-10-16-4-2-9-2-16-2Z" fill="url(#metal)"/>
  </g>
  <path d="m82 162 118-49 14 10-118 49Z" fill="url(#slash)" filter="url(#slashGlow)"/>
  <rect x="0.75" y="0.75" width="254.5" height="254.5" rx="55.25" fill="none" stroke="#08121c" stroke-width="1.5"/>
</svg>`;
}

export function renderWebManifest() {
  const rootPath = siteConfig.basePath ? `${siteConfig.basePath}/` : "/";

  return JSON.stringify(
    {
      name: siteConfig.name,
      short_name: "ARD",
      icons: [
        {
          src: assetPath("assets/favicon-192.png"),
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: assetPath("assets/favicon-512.png"),
          sizes: "512x512",
          type: "image/png"
        }
      ],
      theme_color: siteConfig.themeColor,
      background_color: siteConfig.themeColor,
      display: "standalone",
      start_url: rootPath,
      scope: rootPath
    },
    null,
    2
  );
}
