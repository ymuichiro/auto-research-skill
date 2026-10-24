import {illustrationPath} from './spatial-site.mjs';
import {
  absoluteUrl,
  assetPath,
  feedRelativePath,
  listingRelativePath,
  localizedPath,
  siteConfig,
  timelineRelativePath,
  topicHubRelativePath,
  topicIndexRelativePath,
} from "./site-config.mjs";
import { resolveArticleSeo } from "./seo-snippets.mjs";
import { buildTopicHubs } from "./topic-hubs.mjs";
import { escapeHtml, formatDisplayDate, formatXml } from "./utils.mjs";
import { prepareArticleBody, articleReadingMinutes, renderOutline, nextStreamArticle, readingSequence } from "./article-template.mjs";
import {spatialConfigScript} from './spatial-site.mjs';

const localeCopy = {
  ja: {
    homeTitle: "トップ",
    listingTitle: "公開レポート",
    listingIntro: "公開済みレポートを調査対象日が新しい順に一覧化しています。",
    articleUpdatedLabel: "最終更新",
    articleSnapshotLabel: "調査対象日",
    articlePublishedLabel: "初公開",
    rangeLabel: "表示範囲",
    paginationPrevious: "前へ",
    paginationNext: "次へ",
    paginationPage: "ページ",
    heroIntro:
      "公開資料と論文を基に、AIエージェントに任せる仕事、必要な評価、承認、運用条件を比較し、導入判断に必要な差を整理します。",
    sourceHeading: "公開根拠",
    sourceNote: "公開ページでは、公式ドキュメントまたは論文として確認できた根拠のみを掲載しています。",
    readReport: "レポートを開く",
    sourceCount: "根拠数",
    relatedHeading: "関連記事",
    newerArticle: "より新しい記事",
    olderArticle: "ひとつ古い記事",
    relatedArticle: "テーマが近い記事",
    tagHeading: "タグ",
    languageSwitch: "English",
    shareSectionLabel: "記事を共有",
    shareOnXLabel: "X で共有",
    nativeShareLabel: "共有メニューを開く",
    copyShareLabel: "記事タイトルとリンクをコピー",
    copySuccessLabel: "コピーしました",
    copyErrorLabel: "コピーに失敗しました",
    emptyState: "公開済みレポートはまだありません。",
    homePath: "",
    footerNavLabel: "フッターナビゲーション",
    openExternal: "開く",
    topicsTitle: "トピック",
    topicsIntro: "公開済みレポートを主要テーマごとにまとめています。新着だけでなく、カテゴリ単位で論点の流れをたどれます。",
    topicsKicker: "トピック案内",
    topicsOpenHub: "テーマハブを開く",
    topicsOpenIndex: "トピック一覧へ",
    topicsRepresentativeArticle: "代表記事",
    topicsLatestLabel: "最新更新",
    topicsCountLabel: "記事数",
    timelineTitle: "タイムライン",
    timelineIntro: "公開済みレポートを調査対象の月ごとに整理し、テーマの変化を追えるページです。",
    timelineStatArticles: "公開レポート",
    timelineStatMonths: "調査対象月",
    timelineStatTopics: "テーマ数",
    timelineStatLatest: "最新更新",
    timelineMonthCount: "公開本数",
    timelineMonthThemes: "主なテーマ",
    discoverySitePageLabel: "サイトページ",
  },
  en: {
    homeTitle: "Home",
    listingTitle: "Published Briefings",
    listingIntro: "Published briefings, ordered by their research cutoff.",
    articleUpdatedLabel: "Updated",
    articleSnapshotLabel: "Research cutoff",
    articlePublishedLabel: "First published",
    rangeLabel: "Showing",
    paginationPrevious: "Previous",
    paginationNext: "Next",
    paginationPage: "Page",
    heroIntro:
      "Using public documentation and papers to compare what work to delegate to AI agents and which evaluation, approval, and operating conditions matter before adoption.",
    sourceHeading: "Published evidence",
    sourceNote:
      "Public pages list only evidence that can be verified as official documentation or papers.",
    readReport: "Open briefing",
    sourceCount: "Sources",
    relatedHeading: "Continue reading",
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
    homePath: "en/",
    footerNavLabel: "Footer navigation",
    openExternal: "Open",
    topicsTitle: "Topics",
    topicsIntro: "Browse the published briefings by their main themes so readers can follow topic continuity beyond the latest post.",
    topicsKicker: "Topic navigation",
    topicsOpenHub: "Open topic hub",
    topicsOpenIndex: "Browse all topics",
    topicsRepresentativeArticle: "Representative article",
    topicsLatestLabel: "Latest update",
    topicsCountLabel: "Articles",
    timelineTitle: "Timeline",
    timelineIntro: "Published briefings grouped by research month to follow changes in their topics.",
    timelineStatArticles: "Briefings",
    timelineStatMonths: "Research months",
    timelineStatTopics: "Topics",
    timelineStatLatest: "Latest update",
    timelineMonthCount: "Briefings",
    timelineMonthThemes: "Main topics",
    discoverySitePageLabel: "Site page",
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

export function pageTitle(title, locale) {
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

function feedLinkTitle(locale) {
  return locale === "ja" ? `${siteConfig.name} RSS` : `${siteConfig.name} RSS`;
}

function renderSharedHeadAssets(locale) {
  const feedHref = localizedPath(locale, feedRelativePath(locale).replace(/^en\//, ""));

  return `    <link rel="icon" href="${assetPath("assets/favicon.ico")}" type="image/x-icon">
    <link rel="shortcut icon" href="${assetPath("assets/favicon.ico")}" type="image/x-icon">
    <link rel="icon" href="${assetPath("assets/favicon.svg")}" type="image/svg+xml" sizes="any">
    <link rel="icon" href="${assetPath("assets/favicon-32.png")}" type="image/png" sizes="32x32">
    <link rel="icon" href="${assetPath("assets/favicon-16.png")}" type="image/png" sizes="16x16">
    <link rel="apple-touch-icon" href="${assetPath("assets/apple-touch-icon.png")}" sizes="180x180">
    <link rel="manifest" href="${assetPath("site.webmanifest")}">
    <link rel="alternate" type="application/rss+xml" title="${escapeHtml(feedLinkTitle(locale))}" href="${feedHref}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${assetPath("assets/site.css")}">
    <link rel="stylesheet" href="${assetPath("assets/spatial-site.css")}">`;
}

function renderSharedPageScript() {
  return `    <script src="${assetPath('assets/site-ui.js')}" defer></script>
    <script id="spatial-entry" type="module" src="${assetPath('assets/spatial-site.js')}"></script>`;
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

function itemListPayload(locale, title, items) {
  if (!items?.length) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": item.schemaType ?? "WebPage",
        name: item.name,
        url: absoluteUrl(item.url),
        description: item.description,
        inLanguage: locale
      }
    }))
  };
}

function publisherSchema() {
  return {
    "@type": "Organization",
    name: siteConfig.owner,
    url: siteConfig.siteUrl,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("assets/favicon-512.png"),
      width: 512,
      height: 512
    }
  };
}

function authorSchema() {
  return {
    "@type": "Organization",
    name: siteConfig.owner
  };
}

function pageSchemas({
  locale,
  title,
  description,
  canonicalUrl,
  article,
  pageType,
  breadcrumbs,
  schemaType,
  listItems = []
}) {
  const payloads = [];

  if (pageType === "article" && article) {
    payloads.push({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: locale === "ja" ? article.titleJa : article.titleEn,
      description: metaDescription(description, locale),
      datePublished: article.publishedAtIso,
      dateModified: article.lastModified,
      inLanguage: locale,
      isAccessibleForFree: true,
      articleSection: article.category,
      keywords: article.tags.join(", "),
      mainEntityOfPage: canonicalUrl,
      publisher: publisherSchema(),
      author: authorSchema(),
      url: canonicalUrl
    });
  } else {
    const collectionPayload = {
      "@context": "https://schema.org",
      "@type": schemaType ?? "CollectionPage",
      name: title,
      description: metaDescription(description, locale),
      inLanguage: locale,
      url: canonicalUrl,
      isPartOf: {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.siteUrl
      },
      publisher: publisherSchema()
    };
    const listPayload = itemListPayload(locale, title, listItems);
    if (listPayload) {
      collectionPayload.mainEntity = listPayload;
    }

    payloads.push(collectionPayload);
  }

  if (breadcrumbs?.length) {
    payloads.push(breadcrumbPayload(locale, breadcrumbs));
  }

  return payloads.map((payload) => jsonLdBlock(payload)).join("\n    ");
}

function renderPageHeading(text, locale) {
  if (locale !== "ja") return escapeHtml(text);
  // Keep the site's key terms together while balancing the heading. The
  // wrapper can still shrink at large text sizes; it never forces overflow.
  const terms = new Set(["AIエージェント", "生成AI", "一次情報"]);
  return text.split(/(AIエージェント|生成AI|一次情報)/).map(part => terms.has(part)
    ? `<span class="hero-term">${escapeHtml(part)}</span>` : escapeHtml(part)).join("");
}

export function renderPage({
  locale,
  relativePath,
  title,
  description,
  pageHeading,
  pageIntro,
  pageMeta = "",
  body,
  currentNavPath,
  article,
  pageType = "website",
  breadcrumbs = [],
  robotsContent = siteConfig.defaultRobots,
  imagePath = siteConfig.ogImage,
  schemaType,
  listItems = [],
  spatial = {mode:'document'}
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
    schemaType,
    listItems
  });

  const navLinks = siteConfig.nav[locale]
    .map((item) => {
      const href = localizedPath(locale, item.path.replace(/^en\//, ""));
      const active = currentNavPath === item.path;
      return `<a class="nav-link ${active ? "is-active" : ""}" href="${href}">${escapeHtml(item.label)}</a>`;
    })
    .join("");
  const footerLinks = siteConfig.footerNav[locale]
    .map((item) => `<a class="footer-link" href="${localizedPath(locale, item.path)}">${escapeHtml(item.label)}</a>`)
    .join("");

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(pageTitle(title, locale))}</title>
    <meta name="description" content="${escapeHtml(metaDescription(description, locale))}">
    <meta name="robots" content="${process.env.PREVIEW_ARTICLE ? "noindex,nofollow" : escapeHtml(robotsContent)}">
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
${renderSharedHeadAssets(locale)}
${renderSharedPageScript()}
    ${pageType === "article" && article
      ? `${article.publishedAtIso ? `<meta property="article:published_time" content="${escapeHtml(article.publishedAtIso)}">\n    ` : ""}<meta property="article:modified_time" content="${article.lastModified}">
    <meta property="article:section" content="${escapeHtml(article.category)}">
    ${article.tags
      .map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}">`)
      .join("\n    ")}`
      : ""}
    ${schemaBlocks}
  </head>
  <body data-page-type="${pageType}">
    ${spatial ? spatialConfigScript(spatial,locale,relativePath,pageHeading) : ''}
    <section id="spatial-startup" role="status" hidden data-error="${locale==='ja'?'表示の切り替えに失敗しました。記事やリンクはこのまま利用できます。':'The interactive view could not load. You can still read the page and follow its links.'}">
      <p id="spatial-startup-message"></p>
      <button id="spatial-startup-retry" type="button" hidden>${locale==='ja'?'再試行':'Retry'}</button>
    </section>
    <div class="page-shell">
      <div class="hero-backdrop"></div>
      <a class="skip-link" href="#main">${locale === "ja" ? "本文へ" : "Skip to content"}</a>
      <header class="site-header">
        <a class="brand-mark" href="${localizedPath(locale, "")}">
          <img class="brand-logo" src="${assetPath('assets/favicon.svg')}" width="28" height="28" alt="" aria-hidden="true">
          <span class="brand-copy">${escapeHtml(siteConfig.name)}</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" hidden>${locale === "ja" ? "メニュー" : "Menu"}</button>
        <nav class="site-nav" id="site-navigation" aria-label="${locale === "ja" ? "メインナビゲーション" : "Main navigation"}">${navLinks}</nav>
        <a class="lang-switch" href="${toggle.href}">${escapeHtml(toggle.label)}</a>
      </header>
      <main class="site-main" id="main">
        ${pageType === "article" ? "" : `<section class="hero-panel ${pageType === "home" ? "hero-panel-home" : ""}">
          <h1 class="hero-title">${renderPageHeading(pageHeading, locale)}</h1>
          ${pageIntro ? `<p class="hero-copy">${escapeHtml(pageIntro)}</p>` : ""}
          ${pageMeta}
        </section>`}
        <div class="content-stack">
          ${body}
        </div>
      </main>
      <footer class="footer-panel">
        <div class="footer-meta">
          <a class="footer-brand" href="${localizedPath(locale, "")}">${escapeHtml(siteConfig.name)}</a>
        </div>
        <nav class="footer-links" aria-label="${escapeHtml(copy.footerNavLabel)}">${footerLinks}</nav>
      </footer>
    </div>
  </body>
</html>`;
}

function localizedArticleHref(article, locale) {
  const path = locale === "ja" ? article.outputPaths.ja : article.outputPaths.en;
  return localizedPath(locale, path.replace(/^en\//, ""));
}

function renderTopicPill(locale, category, href = "") {
  const label = escapeHtml(category);

  if (!href) {
    return `<span class="meta-pill is-accent">${label}</span>`;
  }

  return `<a class="meta-pill is-accent article-topic-link" href="${href}">${label}</a>`;
}

function renderTagRow(tags, limit = tags.length) {
  const selectedTags = tags.slice(0, limit);

  if (!selectedTags.length) {
    return "";
  }

  return `<div class="meta-tags">${selectedTags.map((tag) => `<span class="meta-chip">${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function renderEditorialBriefing(
  article,
  locale,
  {
    headingTag = "h2",
    panelClassName = "",
    categoryHref = ""
  } = {}
) {
  const copy = localeCopy[locale];
  const seo = article.seo?.[locale] ?? resolveArticleSeo(article)[locale];
  const articleHref = localizedArticleHref(article, locale);
  const articleTitle = locale === "ja" ? article.titleJa : article.titleEn;

  return `<div class="listing-stage"><div data-listing-motion="featured"><section class="panel-block editorial-briefing${panelClassName ? ` ${panelClassName}` : ""}">
    <div class="editorial-briefing-grid">
      <div class="editorial-briefing-main">
        <div class="meta-row justify-between">
          ${renderTopicPill(locale, article.category, categoryHref)}
          <time class="mono-note" datetime="${article.date}">${escapeHtml(localeCopy[locale].articleSnapshotLabel)} ${escapeHtml(formatDisplayDate(article.date, locale))}</time>
        </div>
        <${headingTag} class="editorial-briefing-title">
          <a class="editorial-briefing-link" href="${articleHref}">${escapeHtml(articleTitle)}</a>
        </${headingTag}>
        <p class="editorial-briefing-copy">${escapeHtml(seo.teaser)}</p>
        ${renderTagRow(article.tags, 5)}
      </div>
      <div class="editorial-briefing-side">
        <div class="editorial-briefing-stat">
          <span class="mono-note">${escapeHtml(copy.sourceCount)}</span>
          <p class="editorial-briefing-stat-value">${article.publishedSources.length}</p>
        </div>
        <a class="text-link" href="${articleHref}">${escapeHtml(copy.readReport)}</a>
      </div>
    </div>
  </section></div></div>`;
}

function renderArticleCard(article, locale, { featured = false, eyebrow = "", headingTag = "h2" } = {}) {
  const title = locale === "ja" ? article.titleJa : article.titleEn;
  const seo = article.seo?.[locale] ?? resolveArticleSeo(article)[locale];
  const copy = localeCopy[locale];
  const href = localizedArticleHref(article, locale);

  return `<div class="listing-stage"><a class="article-card ${featured ? "article-card-featured" : ""}" href="${href}" aria-label="${escapeHtml(title)}" data-listing-motion="card">
    <div class="article-card-main">
      ${eyebrow ? `<p class="section-kicker">${escapeHtml(eyebrow)}</p>` : ""}
      <div class="meta-row justify-between">
        <span class="meta-pill is-accent">${escapeHtml(article.category)}</span>
        <time class="mono-note" datetime="${article.date}">${escapeHtml(localeCopy[locale].articleSnapshotLabel)} ${escapeHtml(formatDisplayDate(article.date, locale))}</time>
      </div>
      <${headingTag} class="article-card-title">${escapeHtml(title)}</${headingTag}>
      <p class="article-card-copy">${escapeHtml(seo.teaser)}</p>
      ${renderTagRow(article.tags)}
    </div>
    <div class="article-card-foot">
      <span class="mono-note">${copy.sourceCount}: ${article.publishedSources.length}</span>
      <span class="text-link">${escapeHtml(copy.readReport)}</span>
    </div>
  </a></div>`;
}

function topicHubHref(locale, hub) {
  return localizedPath(locale, topicHubRelativePath(locale, hub.slug).replace(/^en\//, ""));
}

function renderNewsSequence(feature, cards, locale) {
  return `<section class="news-sequence" data-news-sequence aria-label="${escapeHtml(localeCopy[locale].listingTitle)}">
    <div class="news-viewport"><div class="news-deck">${feature}${cards}</div></div>
  </section>`;
}

function renderTopicCard(hub, locale, { headingTag = "h3" } = {}) {
  const copy = localeCopy[locale];
  const hubHref = topicHubHref(locale, hub);
  const representativeArticle = hub.latestArticle;
  const representativeHref = representativeArticle
    ? localizedPath(locale, (locale === "ja" ? representativeArticle.outputPaths.ja : representativeArticle.outputPaths.en).replace(/^en\//, ""))
    : null;
  const representativeTitle =
    representativeArticle && (locale === "ja" ? representativeArticle.titleJa : representativeArticle.titleEn);

  return `<article class="article-card topic-card">
    <div class="article-card-main">
      <div class="meta-row justify-between">
        <span class="mono-note">${escapeHtml(copy.topicsCountLabel)}: ${hub.articleCount}</span>
      </div>
      <${headingTag} class="article-card-title">${escapeHtml(hub.category)}</${headingTag}>
      <p class="article-card-copy">${escapeHtml(hub.descriptions[locale])}</p>
      <div class="topic-card-stats">
        <p class="mono-note">${escapeHtml(copy.topicsLatestLabel)}: ${escapeHtml(
          formatDisplayDate(hub.latestModified.slice(0, 10), locale)
        )}</p>
      </div>
    </div>
    <div class="article-card-foot topic-card-foot">
      <a class="text-link" href="${hubHref}">${escapeHtml(copy.topicsOpenHub)}</a>
      ${
        representativeHref
          ? `<a class="text-link" href="${representativeHref}">${escapeHtml(copy.topicsRepresentativeArticle)}: ${escapeHtml(representativeTitle)}</a>`
          : ""
      }
    </div>
  </article>`;
}

function renderTopicsOverview(locale, topicHubs) {
  if (!topicHubs.length) {
    return "";
  }

  const copy = localeCopy[locale];
  const topicsIndexHref = localizedPath(locale, topicIndexRelativePath(locale).replace(/^en\//, ""));

  return `<section class="panel-block">
    <div class="listing-panel-head">
      <div>
        <h2 class="panel-title">${escapeHtml(copy.topicsTitle)}</h2>
      </div>
      <div class="listing-page-meta">
        <a class="text-link" href="${topicsIndexHref}">${escapeHtml(copy.topicsOpenIndex)}</a>
      </div>
    </div>
    <div class="mt-8 grid gap-5 xl:grid-cols-2">
      ${topicHubs.map((hub) => renderTopicCard(hub, locale)).join("")}
    </div>
  </section>`;
}

function buildTopicHubMap(topicHubs) {
  return new Map(topicHubs.map((hub) => [hub.category, hub]));
}

function formatMonthLabel(monthKey, locale) {
  const date = new Date(`${monthKey}-01T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long",
    timeZone: "UTC"
  }).format(date);
}

function joinInlineList(items, locale) {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  if (locale === "ja") {
    return items.length === 2 ? `${items[0]} と ${items[1]}` : `${items.slice(0, -1).join("、")}、${items.at(-1)}`;
  }

  return items.length === 2 ? `${items[0]} and ${items[1]}` : `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function groupArticlesByMonth(articles) {
  const monthMap = new Map();

  for (const article of articles) {
    const monthKey = article.date.slice(0, 7);
    const group = monthMap.get(monthKey) ?? {
      monthKey,
      year: article.date.slice(0, 4),
      articles: [],
      categoryCounts: new Map(),
      tagCounts: new Map()
    };

    group.articles.push(article);
    group.categoryCounts.set(article.category, (group.categoryCounts.get(article.category) ?? 0) + 1);

    for (const tag of article.tags) {
      group.tagCounts.set(tag, (group.tagCounts.get(tag) ?? 0) + 1);
    }

    monthMap.set(monthKey, group);
  }

  return [...monthMap.values()]
    .sort((left, right) => right.monthKey.localeCompare(left.monthKey))
    .map((group) => ({
      ...group,
      articleCount: group.articles.length,
      categories: [...group.categoryCounts.entries()]
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .map(([category, count]) => ({ category, count })),
      tags: [...group.tagCounts.entries()]
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .map(([tag]) => tag)
        .slice(0, 4)
    }));
}

function groupMonthsByYear(monthGroups) {
  const yearMap = new Map();

  for (const group of monthGroups) {
    const months = yearMap.get(group.year) ?? [];
    months.push(group);
    yearMap.set(group.year, months);
  }

  return [...yearMap.entries()]
    .sort((left, right) => right[0].localeCompare(left[0]))
    .map(([year, months]) => ({ year, months }));
}

function summarizeMonthGroup(group, locale) {
  const leadingCategories = group.categories.slice(0, 2).map(({ category }) => category);
  const leadingTags = group.tags.slice(0, 3);

  if (locale === "ja") {
    const categorySentence = leadingCategories.length ? `主なテーマは ${joinInlineList(leadingCategories, locale)}。` : "";
    const tagSentence = leadingTags.length ? `目立つタグは ${joinInlineList(leadingTags, locale)}。` : "";
    return `${categorySentence}${tagSentence}`.trim();
  }

  const categorySentence = leadingCategories.length ? `The month centered on ${joinInlineList(leadingCategories, locale)}.` : "";
  const tagSentence = leadingTags.length ? `Notable tags: ${joinInlineList(leadingTags, locale)}.` : "";
  return `${categorySentence} ${tagSentence}`.trim();
}

function renderDiscoveryArticleRow(article, locale, topicHubMap) {
  const copy = localeCopy[locale];
  const seo = article.seo?.[locale] ?? resolveArticleSeo(article)[locale];
  const title = locale === "ja" ? article.titleJa : article.titleEn;
  const href = localizedArticleHref(article, locale);
  const topicHub = topicHubMap.get(article.category);
  const topicHref = topicHub ? topicHubHref(locale, topicHub) : "";

  return `<article class="discovery-entry">
    <div class="meta-row justify-between">
      ${renderTopicPill(locale, article.category, topicHref)}
      <time class="mono-note" datetime="${article.date}">${escapeHtml(localeCopy[locale].articleSnapshotLabel)} ${escapeHtml(formatDisplayDate(article.date, locale))}</time>
    </div>
    <h3 class="discovery-entry-title">
      <a class="discovery-entry-link" href="${href}">${escapeHtml(title)}</a>
    </h3>
    <p class="discovery-entry-copy">${escapeHtml(seo.teaser)}</p>
    <div class="discovery-entry-foot">
      <span class="mono-note">${escapeHtml(copy.sourceCount)}: ${article.publishedSources.length}</span>
      <a class="text-link" href="${href}">${escapeHtml(copy.readReport)}</a>
    </div>
  </article>`;
}

function renderChronologySections(locale, monthGroups, topicHubMap) {
  const copy = localeCopy[locale];

  if (!monthGroups.length) {
    return `<section class="panel-block">
      <div class="empty-state">${escapeHtml(copy.emptyState)}</div>
    </section>`;
  }

  return groupMonthsByYear(monthGroups)
    .map(({ year, months }) => {
      const articleCount = months.reduce((sum, month) => sum + month.articleCount, 0);

      return `<section class="panel-block chronology-group">
        <div class="listing-panel-head">
          <div>
            <h2 class="panel-title">${escapeHtml(year)}</h2>
            <p class="panel-copy">${escapeHtml(
              locale === "ja"
                ? `${months.length} か月分・${articleCount} 本の公開をまとめています。`
                : `Grouping ${months.length} publishing months and ${articleCount} briefings in this year.`
            )}</p>
          </div>
        </div>
        <div class="timeline chronology-timeline">
          ${months
            .map((group) => {
              return `<div class="timeline-item chronology-item">
                <div class="timeline-year">${escapeHtml(formatMonthLabel(group.monthKey, locale))}</div>
                <div>
                  <h3>${escapeHtml(
                    locale === "ja" ? `${group.articleCount} 本の公開` : `${group.articleCount} published briefings`
                  )}</h3>
                  <p>${escapeHtml(summarizeMonthGroup(group, locale))}</p>
                  <div class="chronology-entry-list">
                    ${group.articles.map((article) => renderDiscoveryArticleRow(article, locale, topicHubMap)).join("")}
                  </div>
                </div>
              </div>`;
            })
            .join("")}
        </div>
      </section>`;
    })
    .join("");
}

function renderTimelineStats(locale, articles, monthGroups, topicHubs) {
  const copy = localeCopy[locale];
  const stats = [
    [copy.timelineStatArticles, String(articles.length)],
    [copy.timelineStatMonths, String(monthGroups.length)],
    [copy.timelineStatTopics, String(topicHubs.length)],
    [copy.timelineStatLatest, articles[0] ? formatMonthLabel(articles[0].date.slice(0, 7), locale) : "—"]
  ];
  return `<div class="timeline-overview">
    <dl class="timeline-stats">${stats.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
  </div>`;
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

function renderTopicGuide(locale, guide) {
  if (!guide) {
    return "";
  }

  return `<section class="panel-block topic-guide" id="topic-guide">
    <div>
      <p class="section-kicker">${escapeHtml(guide.kicker)}</p>
      <h2 class="panel-title">${escapeHtml(guide.title)}</h2>
      <p class="panel-copy">${escapeHtml(guide.intro)}</p>
    </div>
    <div class="comparison-grid mt-6">
      ${guide.points
        .map(
          (point) => `<article class="comparison-card">
        <h3>${escapeHtml(point.title)}</h3>
        <p>${escapeHtml(point.body)}</p>
      </article>`
        )
        .join("")}
    </div>
  </section>`;
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

  return `<div class="related-articles">
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
  </div>`;
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

function articleListItems(locale, articles) {
  return articles.map((article) => {
    const seo = article.seo?.[locale] ?? resolveArticleSeo(article)[locale];

    return {
      name: locale === "ja" ? article.titleJa : article.titleEn,
      url: localizedArticleHref(article, locale),
      description: seo.teaser
    };
  });
}

function topicHubListItems(locale, topicHubs) {
  return topicHubs.map((hub) => ({
    name: hub.category,
    url: topicHubHref(locale, hub),
    description: hub.descriptions[locale]
  }));
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
      : "";
  const nextLink =
    currentPage < totalPages
      ? `<a class="pagination-link pagination-edge" href="${listingPageHref(locale, currentPage + 1)}">${escapeHtml(copy.paginationNext)}</a>`
      : "";

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
  const topicHubs = pagination.topicHubs ?? [];
  const featuredArticle = currentPage === 1 ? articles[0] ?? null : null;
  const featuredTopicHub = featuredArticle ? topicHubs.find((hub) => hub.category === featuredArticle.category) : null;
  const listingArticles = featuredArticle ? articles.slice(1) : articles;
  const listingOffset = pagination.startIndex ?? 0;
  const rangeStart = articles.length > 0 ? listingOffset + 1 : 0;
  const rangeEnd = articles.length > 0 ? listingOffset + articles.length : 0;
  const cards = listingArticles.map((article) => renderArticleCard(article, locale)).join("") || (!featuredArticle ? `<div class="empty-state">${escapeHtml(copy.emptyState)}</div>` : "");
  const listItems = articleListItems(locale, featuredArticle ? [featuredArticle, ...listingArticles] : listingArticles);
  const feature = featuredArticle
    ? renderEditorialBriefing(featuredArticle, locale, {
        panelClassName: "home-featured-briefing",
        categoryHref: featuredTopicHub ? topicHubHref(locale, featuredTopicHub) : ""
      })
    : "";
  const footer = articles.length ? `<div class="listing-footer">
    <p class="listing-count mono-note">${escapeHtml(listingRangeText(locale, rangeStart, rangeEnd, totalArticles))}</p>
    ${renderPagination(locale, currentPage, totalPages)}
  </div>` : "";
  const body = `${renderNewsSequence(feature, cards, locale)}${footer}${currentPage <= 1 ? renderTopicsOverview(locale, topicHubs) : ""}`;

  return renderPage({
    locale,
    relativePath: listingRelativePath(locale, currentPage),
    title: listingPageTitle(locale, currentPage),
    description: currentPage <= 1 ? siteConfig.description[locale] : copy.listingIntro,
    pageHeading: currentPage <= 1 ? siteConfig.taglines[locale] : copy.listingTitle,
    pageIntro: currentPage <= 1 ? copy.heroIntro : "",
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
    pageType: "home",
    spatial: {mode:currentPage===1?'timeline':'feed',list:articles.map(a=>a.sourceDirName),page:currentPage},
    listItems
  });
}

export function renderTopicsIndexPage(locale, topicHubs) {
  const copy = localeCopy[locale];
  const relativePath = topicIndexRelativePath(locale);
  const listItems = topicHubListItems(locale, topicHubs);
  const body = `<div class="grid gap-5 xl:grid-cols-2">
    ${topicHubs.map((hub) => renderTopicCard(hub, locale, {headingTag:"h2"})).join("")}
  </div>`;

  return renderPage({
    locale,
    relativePath,
    title: copy.topicsTitle,
    description: copy.topicsIntro,
    pageHeading: copy.topicsTitle,
    spatial: {mode:'topics'},
    pageIntro: copy.topicsIntro,
    body,
    currentNavPath: locale === "ja" ? "topics/" : "en/topics/",
    breadcrumbs: [
      { name: copy.homeTitle, path: copy.homePath },
      { name: copy.topicsTitle, path: relativePath }
    ],
    pageType: "page",
    schemaType: "CollectionPage",
    listItems
  });
}

export function renderTopicHubPage(locale, hub) {
  const copy = localeCopy[locale];
  const relativePath = topicHubRelativePath(locale, hub.slug);
  const featuredArticle = hub.articles[0];
  const remainingArticles = hub.articles.slice(1);
  const topicIndexPath = topicIndexRelativePath(locale);
  const listItems = articleListItems(locale, hub.articles);
  const overview = `<div class="topic-summary mono-note">
    <span>${escapeHtml(copy.topicsCountLabel)} ${hub.articleCount}</span>
    <span>${escapeHtml(copy.topicsLatestLabel)} ${escapeHtml(formatDisplayDate(hub.latestModified.slice(0, 10), locale))}</span>
  </div>`;
  const feature = featuredArticle
    ? renderEditorialBriefing(featuredArticle, locale, {
        panelClassName: "topic-featured-briefing"
      })
    : "";
  const cards = remainingArticles.map(article => renderArticleCard(article, locale)).join("");
  const body = renderNewsSequence(feature, cards, locale) + renderTopicGuide(locale, hub.guide?.[locale]);

  return renderPage({
    locale,
    relativePath,
    title: hub.category,
    description: hub.descriptions[locale],
    pageHeading: hub.category,
    spatial: {mode:'feed',topic:hub.category,list:hub.articles.map(a=>a.sourceDirName)},
    pageIntro: hub.descriptions[locale],
    pageMeta: overview,
    body,
    currentNavPath: locale === "ja" ? "topics/" : "en/topics/",
    breadcrumbs: [
      { name: copy.homeTitle, path: copy.homePath },
      { name: copy.topicsTitle, path: topicIndexPath },
      { name: hub.category, path: relativePath }
    ],
    pageType: "page",
    schemaType: "CollectionPage",
    listItems
  });
}

export function renderTimelineRedirect(locale) {
  const home=localizedPath(locale,'');
  return `<!doctype html><html lang="${locale}"><head>
    <meta charset="utf-8"><meta name="robots" content="noindex,follow">
    <title>${escapeHtml(siteConfig.name)}</title>
    <link rel="canonical" href="${absoluteUrl(locale==='en'?'en/':'')}">
    <script src="${assetPath('assets/timeline-redirect.js')}" defer></script>
  </head><body><noscript><a href="${home}">${locale==='ja'?'トップ':'Home'}</a></noscript></body></html>`;
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
            <span class="source-action">${escapeHtml(copy.openExternal)}</span>
          </a>`;
        })
        .join("")}
    </div>
  </section>`;
}

function renderTopicBacklink(article, locale, hub) {
  if (!hub) {
    return "";
  }

  const copy = localeCopy[locale];
  const hubHref = topicHubHref(locale, hub);

  return `<section class="panel-block topic-backlink">
    <div class="topic-backlink-actions">
      <span class="meta-pill is-accent">${escapeHtml(article.category)}</span>
      <span class="mono-note">${escapeHtml(copy.topicsCountLabel)}: ${hub.articleCount}</span>
      <a class="text-link" href="${hubHref}">${escapeHtml(copy.topicsOpenHub)}</a>
    </div>
  </section>`;
}

export function renderReadingArticle(article, locale, articles = [], { initial = false } = {}) {
  const copy = localeCopy[locale];
  const title = locale === "ja" ? article.titleJa : article.titleEn;
  const summary = locale === "ja" ? article.summaryJa : article.summaryEn;
  const body = locale === "ja" ? article.bodies.ja : article.bodies.en;
  const relativePath = article.outputPaths[locale];
  const topicHub = buildTopicHubs(articles).find((hub) => hub.category === article.category);
  const topicHubLink = topicHub ? topicHubHref(locale, topicHub) : localizedPath(locale, topicIndexRelativePath(locale).replace(/^en\//, ""));
  const updatedAt = article.lastModified.slice(0, 10);
  const minutes = articleReadingMinutes(body, locale);
  const sequence = readingSequence(articles, article);
  return `<article class="reading-article" data-article-id="${escapeHtml(article.sourceDirName)}" data-article-path="${localizedArticleHref(article, locale)}">
    <header class="reading-header">
      <div class="reading-actions"><a class="text-link" href="${topicHubLink}">${locale === "ja" ? "← テーマへ" : "← Back to topic"}</a><button class="reading-related-button" data-open-related type="button" hidden>${locale === "ja" ? "関連の流れ" : "Related timeline"}</button></div>
      <div class="meta-row">
        ${renderTopicPill(locale, article.category, topicHubLink)}
        <time class="mono-note" datetime="${article.date}">${escapeHtml(copy.articleSnapshotLabel)} ${escapeHtml(formatDisplayDate(article.date, locale))}</time>
        ${article.publishedAtIso ? `<time class="mono-note" datetime="${escapeHtml(article.publishedAtIso)}">${escapeHtml(copy.articlePublishedLabel)} ${escapeHtml(formatDisplayDate(article.publishedAtIso.slice(0, 10), locale))}</time>` : ""}
        ${updatedAt !== article.date ? `<time class="mono-note" datetime="${updatedAt}">${escapeHtml(copy.articleUpdatedLabel)} ${escapeHtml(formatDisplayDate(updatedAt, locale))}</time>` : ""}
      </div>
      <${initial ? "h1" : "h2"} class="reading-title">${escapeHtml(title)}</${initial ? "h1" : "h2"}>
      <p class="reading-duration">${locale === "ja" ? `読了目安 ${minutes}分` : `${minutes} min read`}</p>
      <p class="reading-lead">${escapeHtml(summary)}</p>
      ${renderOutline(body, locale)}
      ${renderArticleShare(article, locale, relativePath)}
    </header>
    <div class="article-body">${illustrationPath('article',article.sourceDirName)?`<figure class="article-illustration"><img src="${illustrationPath('article',article.sourceDirName)}" width="1200" height="800" alt="" loading="lazy" decoding="async"></figure>`:''}${prepareArticleBody(body)}</div>
    <details class="reading-evidence"><summary>${locale === "ja" ? "出典と編集責任" : "Sources and editorial review"} <span>${article.publishedSources.length}</span></summary>
      ${renderSources(article, locale)}
    </details>
    <details class="reading-evidence"><summary>${escapeHtml(copy.relatedHeading)}</summary>${renderTopicBacklink(article, locale, topicHub)}${renderRelatedArticles(article, locale, articles)}</details>
    <dialog class="related-dialog" data-related-dialog aria-label="${locale === "ja" ? "関連の流れ" : "Related timeline"}">
      <div class="related-dialog-head"><h2>${locale === "ja" ? "関連の流れ" : "Related timeline"}</h2><form method="dialog"><button class="reading-related-button" type="submit">${locale === "ja" ? "閉じる" : "Close"}</button></form></div>
      <p class="panel-copy">${escapeHtml(article.category)}</p><ol class="related-flow">${sequence.map((item) => {
        const isCurrent = item.sourceDirName === article.sourceDirName;
        const relation = isCurrent ? (locale === "ja" ? "閲覧中" : "Reading") : item.category === article.category
          ? (locale === "ja" ? "同じテーマ" : "Same topic")
          : item.date === article.date ? (locale === "ja" ? "同じ調査日" : "Same date")
            : (locale === "ja" ? "関連テーマ" : "Related topic");
        return `<li${isCurrent ? ' class="is-current"' : ""}><a href="${localizedArticleHref(item, locale)}"${isCurrent ? ' aria-current="page"' : ""}><span class="related-flow-relation">${relation}</span><time datetime="${item.date}">${escapeHtml(formatDisplayDate(item.date, locale))}</time><h3>${escapeHtml(locale === "ja" ? item.titleJa : item.titleEn)}</h3><p>${escapeHtml(item.seo?.[locale]?.teaser ?? (locale === "ja" ? item.summaryJa : item.summaryEn))}</p></a></li>`;
      }).join("")}</ol>
    </dialog>
  </article>`;
}

export function renderArticleContinuation(article, locale, articles) {
  const selection = nextStreamArticle(articles, article);
  if (!selection) return `<div class="stream-end"><p>${locale === "ja" ? "公開済みの記事をすべて読みました" : "You have reached the end of the archive"}</p><a class="text-link" href="${localizedPath(locale, topicIndexRelativePath(locale).replace(/^en\//, ""))}">${locale === "ja" ? "ほかのテーマを探す" : "Explore other topics"}</a></div>`;
  const { article: next, relation } = selection;
  const relationLabel = locale === "ja"
    ? ({ topic: "このテーマのひとつ前の記事", "same-day": "同じ調査日の関連記事", related: "関連する過去の記事", archive: "続いて読める過去の記事" }[relation])
    : ({ topic: "Earlier in this topic", "same-day": "Related briefing from the same research date", related: "An earlier article on a related topic", archive: "Continue into the archive" }[relation]);
  return `<section class="article-continuation" data-next-url="${assetPath(`assets/articles/${locale}/${next.sourceDirName}.json`)}" data-next-id="${escapeHtml(next.sourceDirName)}">
    <p class="stream-boundary">${relationLabel}</p>
    <div class="article-mount"><a class="next-article-preview" href="${localizedArticleHref(next, locale)}"><time datetime="${next.date}">${escapeHtml(formatDisplayDate(next.date, locale))}</time><h2>${escapeHtml(locale === "ja" ? next.titleJa : next.titleEn)}</h2><p>${escapeHtml(next.seo?.[locale]?.teaser ?? (locale === "ja" ? next.summaryJa : next.summaryEn))}</p><span class="text-link">${locale === "ja" ? "記事を読む" : "Read briefing"}</span></a></div>
    <p class="stream-status" role="status" aria-live="polite"></p><button class="reading-related-button" type="button" data-stream-retry hidden>${locale === "ja" ? "再試行" : "Retry"}</button>
  </section>`;
}

export function renderArticlePage(article, locale, articles = []) {
  const title = locale === "ja" ? article.titleJa : article.titleEn;
  const seo = article.seo?.[locale] ?? resolveArticleSeo(article)[locale];
  const relativePath = article.outputPaths[locale];
  const topicHub = buildTopicHubs(articles).find((hub) => hub.category === article.category);
  const topicHubPath = topicHub ? topicHubRelativePath(locale, topicHub.slug) : null;
  return renderPage({
    locale, relativePath, title: seo.title, description: seo.description,
    pageHeading: title, pageIntro: locale === "ja" ? article.summaryJa : article.summaryEn,
    body: `<div class="article-stream" data-article-stream data-locale="${locale}">${renderReadingArticle(article, locale, articles, { initial: true })}${renderArticleContinuation(article, locale, articles)}</div>`,
    currentNavPath: localeCopy[locale].homePath, article, imagePath: siteConfig.ogImage,
    breadcrumbs: [{ name: localeCopy[locale].homeTitle, path: localeCopy[locale].homePath }, ...(topicHubPath ? [{ name: localeCopy[locale].topicsTitle, path: topicIndexRelativePath(locale) }, { name: article.category, path: topicHubPath }] : []), { name: title, path: relativePath }],
    pageType: "article",
    spatial: {mode:'read',article:article.sourceDirName}
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

export function renderFeed(locale, articles, latestUpdate) {
  const feedUrl = absoluteUrl(feedRelativePath(locale));
  const siteTitle = locale === "ja" ? siteConfig.name : `${siteConfig.name} EN`;
  const channelTitle = locale === "ja" ? `${siteTitle} RSS` : `${siteTitle} RSS`;
  const channelDescription = siteConfig.description[locale];
  const feedLanguage = locale === "ja" ? "ja" : "en";
  const buildDate = latestUpdate ? new Date(latestUpdate) : new Date();
  const feedItems = articles.slice(0, 20);

  return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${formatXml(channelTitle)}</title>
    <link>${formatXml(absoluteUrl(locale === "ja" ? "" : "en/"))}</link>
    <description>${formatXml(channelDescription)}</description>
    <language>${formatXml(feedLanguage)}</language>
    <lastBuildDate>${formatXml(buildDate.toUTCString())}</lastBuildDate>
    <atom:link href="${formatXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${feedItems
  .map((article) => {
    const title = locale === "ja" ? article.titleJa : article.titleEn;
    const seo = article.seo?.[locale] ?? resolveArticleSeo(article)[locale];
    const link = absoluteUrl(locale === "ja" ? article.outputPaths.ja : article.outputPaths.en);
    const pubDate = article.publishedAtIso ? new Date(article.publishedAtIso) : null;

    return `    <item>
      <title>${formatXml(title)}</title>
      <link>${formatXml(link)}</link>
      <guid isPermaLink="true">${formatXml(link)}</guid>
      ${pubDate ? `<pubDate>${formatXml(pubDate.toUTCString())}</pubDate>` : ""}
      <description>${formatXml(seo.description)}</description>
      <category>${formatXml(article.category)}</category>
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>`;
}

export function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("sitemap.xml")}
Sitemap: ${absoluteUrl("sitemap-articles.xml")}
Sitemap: ${absoluteUrl("sitemap-pages.xml")}
`;
}

export function renderDefaultOgSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628" viewBox="0 0 1200 628" role="img" aria-labelledby="title desc">
    <title id="title">Auto Research Digest</title><desc id="desc">Research briefings connected through time.</desc>
    <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#e8f1f7"/><stop offset="1" stop-color="#edf7f3"/></linearGradient></defs>
    <rect width="1200" height="628" fill="url(#bg)"/>
    <rect x="180" y="75" width="840" height="445" rx="24" fill="#fff" opacity=".42"/>
    <rect x="140" y="105" width="920" height="445" rx="24" fill="#fff" opacity=".64"/>
    <rect x="90" y="145" width="1020" height="395" rx="24" fill="#fff" stroke="#c9dfe7"/>
    <text x="145" y="215" fill="#267f82" font-size="22" font-family="sans-serif" letter-spacing="4">RESEARCH / EVIDENCE / CONTEXT</text>
    <text x="145" y="316" fill="#172b3d" font-size="62" font-family="'Noto Sans JP',sans-serif">Auto Research Digest</text>
    <text x="148" y="378" fill="#51697b" font-size="25" font-family="sans-serif">LLM, AI, and agents. Primary sources. Clear perspectives.</text>
    <path d="M150 451H1040" stroke="#ccdfe7"/><circle cx="150" cy="451" r="7" fill="#2a8d83"/><circle cx="470" cy="451" r="5" fill="#87b1c4"/><circle cx="750" cy="451" r="4" fill="#afccd7"/>
    <text x="150" y="492" fill="#567587" font-size="18" font-family="sans-serif">Japanese / English</text>
  </svg>`;
}

export function renderFaviconSvg() {
  // The same vector is used in the site header and every generated app icon.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
    <title id="title">Auto Research Digest</title><desc id="desc">Three flowing research signals.</desc>
    <rect width="256" height="256" rx="56" fill="#eef5f8"/>
    <g fill="none" stroke="#39878d" stroke-width="17" stroke-linecap="round">
      <path d="M46 83C72 58 98 58 128 78S184 103 210 78"/>
      <path d="M46 127C72 102 98 102 128 122S184 147 210 122"/>
      <path d="M46 171C72 146 98 146 128 166S184 191 210 166"/>
    </g>
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
