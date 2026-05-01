import { absoluteUrl, assetPath, listingRelativePath, localizedPath, siteConfig } from "./site-config.mjs";
import { escapeHtml, formatDisplayDate, formatXml } from "./utils.mjs";

const localeCopy = {
  ja: {
    homeTitle: "トップ",
    listingTitle: "公開レポート",
    listingIntro: "公開済みレポートを新しい順に一覧化しています。",
    pageStatus: "ページ",
    rangeLabel: "表示範囲",
    paginationPrevious: "前へ",
    paginationNext: "次へ",
    paginationPage: "ページ",
    heroIntro:
      "主要な発表、論文、実装の動きを横断しながら、AI の実務トレンドを簡潔に追います。",
    sourceHeading: "公開根拠",
    sourceNote: "公開ページでは、公式ドキュメントまたは論文として確認できた根拠のみを掲載しています。",
    readReport: "レポートを開く",
    sourceCount: "根拠数",
    relatedHeading: "関連記事",
    relatedIntro: "前後の公開記事と、テーマの近い記事を自動表示しています。",
    newerArticle: "より新しい記事",
    olderArticle: "ひとつ古い記事",
    relatedArticle: "テーマが近い記事",
    tagHeading: "Tags",
    languageSwitch: "English",
    shareSectionLabel: "記事を共有",
    shareOnXLabel: "X で共有",
    nativeShareLabel: "共有メニューを開く",
    copyShareLabel: "記事タイトルとリンクをコピー",
    copySuccessLabel: "コピーしました",
    copyErrorLabel: "コピーに失敗しました",
    emptyState: "公開済みレポートはまだありません。",
    homePath: "",
  },
  en: {
    homeTitle: "Home",
    listingTitle: "Published Briefings",
    listingIntro: "Published briefings listed in reverse chronological order.",
    pageStatus: "Page",
    rangeLabel: "Showing",
    paginationPrevious: "Previous",
    paginationNext: "Next",
    paginationPage: "Page",
    heroIntro:
      "Tracking major launches, papers, and implementation signals to follow practical AI direction.",
    sourceHeading: "Published evidence",
    sourceNote:
      "Public pages list only evidence that can be verified as official documentation or papers.",
    readReport: "Open briefing",
    sourceCount: "Sources",
    relatedHeading: "Continue reading",
    relatedIntro: "Automatically showing the adjacent briefings plus one thematically related article.",
    newerArticle: "Newer briefing",
    olderArticle: "Older briefing",
    relatedArticle: "Related briefing",
    tagHeading: "Tags",
    languageSwitch: "日本語",
    shareSectionLabel: "Share article",
    shareOnXLabel: "Share on X",
    nativeShareLabel: "Open share menu",
    copyShareLabel: "Copy article title and link",
    copySuccessLabel: "Copied",
    copyErrorLabel: "Copy failed",
    emptyState: "No published briefings yet.",
    homePath: "en/"
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

function renderSharedHeadAssets() {
  return `    <link rel="icon" href="${assetPath("assets/favicon.ico")}" type="image/x-icon">
    <link rel="shortcut icon" href="${assetPath("assets/favicon.ico")}" type="image/x-icon">
    <link rel="icon" href="${assetPath("assets/favicon.svg")}" type="image/svg+xml" sizes="any">
    <link rel="icon" href="${assetPath("assets/favicon-32.png")}" type="image/png" sizes="32x32">
    <link rel="icon" href="${assetPath("assets/favicon-16.png")}" type="image/png" sizes="16x16">
    <link rel="apple-touch-icon" href="${assetPath("assets/apple-touch-icon.png")}" sizes="180x180">
    <link rel="manifest" href="${assetPath("site.webmanifest")}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${assetPath("assets/site.css")}">`;
}

function renderSharedPageScript(pageType) {
  if (pageType !== "article") {
    return "";
  }

  return `    <script src="${assetPath("assets/article-share.js")}" defer></script>`;
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
    <meta property="og:image:width" content="${siteConfig.ogImageWidth}">
    <meta property="og:image:height" content="${siteConfig.ogImageHeight}">
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
${renderSharedHeadAssets()}
${renderSharedPageScript(pageType)}
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
        <section class="hero-panel ${pageType === "home" ? "hero-panel-home" : ""}">
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

function renderArticleCard(article, locale, { featured = false, eyebrow = "", headingTag = "h2" } = {}) {
  const title = locale === "ja" ? article.titleJa : article.titleEn;
  const summary = locale === "ja" ? article.summaryJa : article.summaryEn;
  const path = locale === "ja" ? article.outputPaths.ja : article.outputPaths.en;
  const copy = localeCopy[locale];
  const href = localizedPath(locale, path.replace(/^en\//, ""));

  return `<a class="article-card ${featured ? "article-card-featured" : ""}" href="${href}" aria-label="${escapeHtml(title)}">
    <div class="article-card-main">
      ${eyebrow ? `<p class="section-kicker">${escapeHtml(eyebrow)}</p>` : ""}
      <div class="meta-row justify-between">
        <span class="meta-pill is-accent">${escapeHtml(article.category)}</span>
        <time class="mono-note" datetime="${article.date}">${escapeHtml(formatDisplayDate(article.date, locale))}</time>
      </div>
      <${headingTag} class="article-card-title">${escapeHtml(title)}</${headingTag}>
      <p class="article-card-copy">${escapeHtml(summary)}</p>
      <div class="meta-tags">${article.tags
        .map((tag) => `<span class="meta-chip">${escapeHtml(tag)}</span>`)
        .join("")}</div>
    </div>
    <div class="article-card-foot">
      <span class="mono-note">${copy.sourceCount}: ${article.publishedSources.length}</span>
      <span class="text-link">${escapeHtml(copy.readReport)}</span>
    </div>
  </a>`;
}

function sharedTagCount(left, right) {
  const rightTags = new Set(right.tags);
  return left.tags.reduce((count, tag) => count + (rightTags.has(tag) ? 1 : 0), 0);
}

function relationshipScore(currentArticle, candidateArticle) {
  const categoryScore = currentArticle.category === candidateArticle.category ? 8 : 0;
  const tagScore = sharedTagCount(currentArticle, candidateArticle) * 4;
  const dayDistance =
    Math.abs(Date.parse(`${currentArticle.date}T00:00:00Z`) - Date.parse(`${candidateArticle.date}T00:00:00Z`)) /
    86400000;
  const freshnessScore = Math.max(0, 45 - dayDistance) / 15;

  return categoryScore + tagScore + freshnessScore;
}

function relatedArticleLabel(locale, relation) {
  const copy = localeCopy[locale];

  if (relation === "newer") {
    return copy.newerArticle;
  }

  if (relation === "older") {
    return copy.olderArticle;
  }

  return copy.relatedArticle;
}

function selectRelatedArticles(articles, currentArticle) {
  const currentIndex = articles.findIndex((article) => article.sourceDirName === currentArticle.sourceDirName);

  if (currentIndex === -1) {
    return [];
  }

  const selected = [];

  if (currentIndex > 0) {
    selected.push({ article: articles[currentIndex - 1], relation: "newer" });
  }

  if (currentIndex < articles.length - 1) {
    selected.push({ article: articles[currentIndex + 1], relation: "older" });
  }

  const selectedIds = new Set([currentArticle.sourceDirName, ...selected.map(({ article }) => article.sourceDirName)]);
  const supplemental = articles
    .filter((article) => !selectedIds.has(article.sourceDirName))
    .map((article) => ({
      article,
      relation: "related",
      score: relationshipScore(currentArticle, article)
    }))
    .sort((left, right) => right.score - left.score || right.article.date.localeCompare(left.article.date))
    .slice(0, Math.max(0, 3 - selected.length))
    .map(({ article, relation }) => ({ article, relation }));

  return [...selected, ...supplemental];
}

function renderRelatedArticles(article, locale, articles) {
  const relatedArticles = selectRelatedArticles(articles, article);

  if (relatedArticles.length === 0) {
    return "";
  }

  const copy = localeCopy[locale];

  return `<section class="panel-block related-articles">
    <div>
      <p class="section-kicker">${escapeHtml(copy.relatedHeading)}</p>
      <h2 class="panel-title">${escapeHtml(copy.relatedHeading)}</h2>
      <p class="panel-copy">${escapeHtml(copy.relatedIntro)}</p>
    </div>
    <div class="mt-6 grid gap-5 xl:grid-cols-3">
      ${relatedArticles
        .map(({ article: relatedArticle, relation }) =>
          renderArticleCard(relatedArticle, locale, {
            eyebrow: relatedArticleLabel(locale, relation),
            headingTag: "h3"
          })
        )
        .join("")}
    </div>
  </section>`;
}

function listingPageHref(locale, pageNumber) {
  return localizedPath(locale, pageNumber <= 1 ? "" : `page/${pageNumber}/`);
}

function listingPageTitle(locale, pageNumber) {
  const baseTitle = siteConfig.seo.homeTitle[locale];

  if (pageNumber <= 1) {
    return baseTitle;
  }

  return locale === "ja" ? `${baseTitle} ${pageNumber}ページ` : `${baseTitle} Page ${pageNumber}`;
}

function listingRangeText(locale, startIndex, endIndex, totalArticles) {
  const copy = localeCopy[locale];

  if (totalArticles === 0) {
    return locale === "ja" ? `${copy.rangeLabel}: 0 / 0` : `${copy.rangeLabel} 0 of 0`;
  }

  if (locale === "ja") {
    return `${copy.rangeLabel}: ${startIndex}-${endIndex} / ${totalArticles}`;
  }

  return `${copy.rangeLabel} ${startIndex}-${endIndex} of ${totalArticles}`;
}

function renderPagination(locale, currentPage, totalPages) {
  if (totalPages <= 1) {
    return "";
  }

  const copy = localeCopy[locale];
  const pageLinks = [];
  const pagesToRender = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  let previousRenderedPage = 0;

  for (const page of [...pagesToRender].filter((page) => page >= 1 && page <= totalPages).sort((left, right) => left - right)) {
    if (previousRenderedPage !== 0 && page - previousRenderedPage > 1) {
      pageLinks.push('<span class="pagination-gap" aria-hidden="true">...</span>');
    }

    const isCurrent = page === currentPage;
    pageLinks.push(
      `<a class="pagination-link ${isCurrent ? "is-current" : ""}" href="${listingPageHref(locale, page)}" ${
        isCurrent ? 'aria-current="page"' : ""
      }>${page}</a>`
    );
    previousRenderedPage = page;
  }

  const previousLink =
    currentPage > 1
      ? `<a class="pagination-link pagination-edge" href="${listingPageHref(locale, currentPage - 1)}">${escapeHtml(copy.paginationPrevious)}</a>`
      : `<span class="pagination-link pagination-edge is-disabled" aria-disabled="true">${escapeHtml(copy.paginationPrevious)}</span>`;
  const nextLink =
    currentPage < totalPages
      ? `<a class="pagination-link pagination-edge" href="${listingPageHref(locale, currentPage + 1)}">${escapeHtml(copy.paginationNext)}</a>`
      : `<span class="pagination-link pagination-edge is-disabled" aria-disabled="true">${escapeHtml(copy.paginationNext)}</span>`;

  return `<nav class="pagination-nav" aria-label="${escapeHtml(copy.listingTitle)} ${escapeHtml(copy.paginationPage)}">
    ${previousLink}
    <div class="pagination-pages">${pageLinks.join("")}</div>
    ${nextLink}
  </nav>`;
}

export function renderIndexPage(locale, articles, pagination = {}) {
  const copy = localeCopy[locale];
  const currentPage = pagination.currentPage ?? 1;
  const totalPages = pagination.totalPages ?? 1;
  const totalArticles = pagination.totalArticles ?? articles.length;
  const rangeStart = articles.length > 0 ? (pagination.startIndex ?? 0) + 1 : 0;
  const rangeEnd = articles.length > 0 ? (pagination.startIndex ?? 0) + articles.length : 0;
  const cards = articles
    .map((article, index) =>
      renderArticleCard(article, locale, {
        featured: currentPage === 1 && index === 0
      })
    )
    .join("");
  const body = `<section class="panel-block">
    <div class="listing-panel-head">
      <div>
        <p class="section-kicker">${escapeHtml(copy.listingTitle)}</p>
        <h2 class="panel-title">${escapeHtml(copy.listingTitle)}</h2>
        <p class="panel-copy">${escapeHtml(copy.listingIntro)}</p>
      </div>
      <div class="listing-page-meta">
        <p class="search-count">${escapeHtml(copy.pageStatus)} ${currentPage} / ${totalPages}</p>
        <p class="search-hint">${escapeHtml(listingRangeText(locale, rangeStart, rangeEnd, totalArticles))}</p>
      </div>
    </div>
    <div class="mt-8 grid gap-5">${cards || `<div class="empty-state">${escapeHtml(copy.emptyState)}</div>`}</div>
    ${renderPagination(locale, currentPage, totalPages)}
  </section>`;

  return renderPage({
    locale,
    relativePath: listingRelativePath(locale, currentPage),
    title: listingPageTitle(locale, currentPage),
    description: currentPage <= 1 ? siteConfig.description[locale] : copy.listingIntro,
    pageHeading: siteConfig.taglines[locale],
    pageIntro: copy.heroIntro,
    body,
    currentNavPath: copy.homePath,
    breadcrumbs: [
      { name: copy.homeTitle, path: copy.homePath },
      ...(currentPage > 1
        ? [
            {
              name: locale === "ja" ? `${currentPage}ページ` : `Page ${currentPage}`,
              path: listingRelativePath(locale, currentPage)
            }
          ]
        : [])
    ],
    pageType: "home"
  });
}

function renderShareIconX() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M18.901 2.998H22.58L14.544 12.18L24 21.002H16.593L10.79 13.418L4.157 21.002H0.476L9.072 11.174L0 2.998H7.595L12.841 9.93L18.901 2.998ZM17.61 18.8H19.649L6.487 5.085H4.298L17.61 18.8Z"></path>
  </svg>`;
}

function renderShareIconNative() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.86L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.36C15.11 18.57 15.08 18.78 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z"></path>
  </svg>`;
}

function renderShareIconCopy() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M16 1H6C4.9 1 4 1.9 4 3V17H6V3H16V1ZM19 5H10C8.9 5 8 5.9 8 7V21C8 22.1 8.9 23 10 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H10V7H19V21Z"></path>
  </svg>`;
}

function renderShareIconCheck() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"></path>
  </svg>`;
}

function renderArticleShare(article, locale, relativePath) {
  const copy = localeCopy[locale];
  const title = locale === "ja" ? article.titleJa : article.titleEn;
  const shareUrl = absoluteUrl(relativePath);
  const xIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;

  return `<section class="article-share" aria-label="${escapeHtml(copy.shareSectionLabel)}">
    <a class="share-button" href="${xIntentUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(copy.shareOnXLabel)}">
      <span class="share-button-icon">${renderShareIconX()}</span>
    </a>
    <button
      class="share-button"
      type="button"
      aria-label="${escapeHtml(copy.nativeShareLabel)}"
      data-native-share
      data-share-title="${escapeHtml(title)}"
      data-share-text="${escapeHtml(title)}"
      data-share-url="${escapeHtml(shareUrl)}"
      hidden
    >
      <span class="share-button-icon">${renderShareIconNative()}</span>
    </button>
    <button
      class="share-button"
      type="button"
      aria-label="${escapeHtml(copy.copyShareLabel)}"
      data-copy-share
      data-state="idle"
      data-share-title="${escapeHtml(title)}"
      data-share-url="${escapeHtml(shareUrl)}"
      data-copy-label-default="${escapeHtml(copy.copyShareLabel)}"
      data-copy-label-success="${escapeHtml(copy.copySuccessLabel)}"
      data-copy-status-success="${escapeHtml(copy.copySuccessLabel)}"
      data-copy-status-error="${escapeHtml(copy.copyErrorLabel)}"
    >
      <span class="share-button-icon-stack" aria-hidden="true">
        <span class="share-button-icon share-button-icon-copy">${renderShareIconCopy()}</span>
        <span class="share-button-icon share-button-icon-success">${renderShareIconCheck()}</span>
      </span>
    </button>
    <span class="sr-only" data-share-status aria-live="polite" role="status"></span>
  </section>`;
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

export function renderArticlePage(article, locale, articles = []) {
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
    ${renderArticleShare(article, locale, relativePath)}
    <section class="article-body">${locale === "ja" ? article.bodies.ja : article.bodies.en}</section>
    ${renderRelatedArticles(article, locale, articles)}
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
      { name: title, path: relativePath }
    ],
    pageType: "article"
  });
}

export function renderNotFoundPage(locale) {
  const copy = localeCopy[locale];
  const body = `<section class="panel-block">
    <p class="section-kicker">404</p>
    <h2 class="panel-title">${locale === "ja" ? "ページが見つかりません" : "Page not found"}</h2>
    <p class="panel-copy">${locale === "ja"
      ? "指定された URL のページは見つかりませんでした。"
      : "The requested URL could not be found."}</p>
    <div class="mt-6">
      <a class="text-link" href="${localizedPath(locale, "")}">${locale === "ja" ? "ホームに戻る" : "Back to home"}</a>
    </div>
  </section>`;

  const relativePath = locale === "ja" ? "404.html" : "en/404.html";

  return renderPage({
    locale,
    relativePath,
    title: locale === "ja" ? "ページが見つかりません" : "Page not found",
    description:
      locale === "ja"
        ? "指定された URL のページは見つかりませんでした。"
        : "The requested URL could not be found.",
    pageHeading: locale === "ja" ? "ページが見つかりません" : "Page not found",
    pageIntro:
      locale === "ja"
        ? "ホームに戻って公開中のページを確認できます。"
        : "Return home to continue browsing the published site.",
    body,
    currentNavPath: copy.homePath,
    breadcrumbs: [
      { name: copy.homeTitle, path: copy.homePath },
      { name: "404", path: relativePath }
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
