function normalizeSiteUrl(rawUrl) {
  const url = new URL(rawUrl);
  return url.toString().endsWith("/") ? url.toString() : `${url.toString()}/`;
}

const siteUrl = normalizeSiteUrl(process.env.SITE_URL ?? "https://research.notelligent.app/");
const siteOrigin = new URL(siteUrl);
const basePath = siteOrigin.pathname.replace(/\/$/, "");
const cname = siteOrigin.hostname.endsWith(".github.io") ? null : siteOrigin.hostname;

export const trustPagePaths = {
  about: "about.html",
  editorialPolicy: "editorial-policy.html",
  contact: "contact.html",
  privacyPolicy: "privacy-policy.html",
  terms: "terms.html",
  disclaimer: "disclaimer.html",
  advertisingPolicy: "advertising-policy.html"
};

export const trustPageOrder = [
  "about",
  "editorialPolicy",
  "contact",
  "privacyPolicy",
  "terms",
  "disclaimer",
  "advertisingPolicy"
];

export const siteConfig = {
  name: "Auto Research Digest",
  owner: "Auto Research Digest Editorial Desk",
  defaultLocale: "ja",
  locales: ["ja", "en"],
  pagination: {
    articleListPageSize: 24
  },
  siteUrl,
  basePath,
  cname,
  themeColor: "#0d0f14",
  ogImage: "assets/og-twitter-card-1200x628.png",
  ogImageWidth: 1200,
  ogImageHeight: 628,
  defaultRobots: "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1",
  description: {
    ja: "LLM、生成AI、AIエージェントを業務に導入する際の設計、評価、承認、運用の判断を、一次情報と論文から整理するリサーチサイト。",
    en: "A research publication on the design, approval, evaluation, and operation of LLMs, generative AI, and AI agents in real work."
  },
  seo: {
    homeTitle: {
      ja: "AIエージェント・生成AIの導入、評価、運用を読む",
      en: "AI Agent and Generative AI Adoption, Evaluation, and Operations"
    }
  },
  heroKicker: {
    ja: "Research Signal",
    en: "Research Signal"
  },
  taglines: {
    ja: "AIエージェントと生成AIを業務へ導入する前に、任せる仕事、根拠、評価、承認を一次情報から判断する。",
    en: "Primary-source research for deciding what to delegate, evaluate, and approve before putting AI agents and generative AI into work."
  },
  nav: {
    ja: [
      { label: "トップ", path: "" },
      { label: "トピック", path: "topics/" },
      { label: "タイムライン", path: "timeline/" }
    ],
    en: [
      { label: "Home", path: "en/" },
      { label: "Topics", path: "en/topics/" },
      { label: "Timeline", path: "en/timeline/" }
    ]
  },
  footerNav: {
    ja: [
      { label: "トピック", path: "topics/" },
      { label: "サイトマップ", path: "sitemap.html" },
      { label: "このサイトについて", path: trustPagePaths.about },
      { label: "調査・編集方針", path: trustPagePaths.editorialPolicy },
      { label: "お問い合わせ", path: trustPagePaths.contact },
      { label: "プライバシーポリシー", path: trustPagePaths.privacyPolicy },
      { label: "利用規約", path: trustPagePaths.terms },
      { label: "免責事項", path: trustPagePaths.disclaimer },
      { label: "広告掲載方針", path: trustPagePaths.advertisingPolicy }
    ],
    en: [
      { label: "Topics", path: "topics/" },
      { label: "Sitemap", path: "sitemap.html" },
      { label: "About", path: trustPagePaths.about },
      { label: "Editorial Policy", path: trustPagePaths.editorialPolicy },
      { label: "Contact", path: trustPagePaths.contact },
      { label: "Privacy Policy", path: trustPagePaths.privacyPolicy },
      { label: "Terms", path: trustPagePaths.terms },
      { label: "Disclaimer", path: trustPagePaths.disclaimer },
      { label: "Advertising Policy", path: trustPagePaths.advertisingPolicy }
    ]
  }
};

export function assetPath(relativePath) {
  return `${siteConfig.basePath}/${relativePath}`.replace(/\/{2,}/g, "/");
}

export function localizedPath(locale, relativePath = "") {
  const normalized = relativePath.replace(/^\/+/, "");
  const localePrefix = locale === "ja" ? "" : "en/";
  return `${siteConfig.basePath}/${localePrefix}${normalized}`.replace(/\/{2,}/g, "/");
}

export function listingRelativePath(locale, pageNumber = 1) {
  if (pageNumber <= 1) {
    return locale === "ja" ? "" : "en/";
  }

  return locale === "ja" ? `page/${pageNumber}/` : `en/page/${pageNumber}/`;
}

export function topicIndexRelativePath(locale) {
  return locale === "ja" ? "topics/" : "en/topics/";
}

export function topicHubRelativePath(locale, slug) {
  return locale === "ja" ? `topics/${slug}/` : `en/topics/${slug}/`;
}

export function timelineRelativePath(locale) {
  return locale === "ja" ? "timeline/" : "en/timeline/";
}

export function sitemapHtmlRelativePath(locale) {
  return locale === "ja" ? "sitemap.html" : "en/sitemap.html";
}

export function feedRelativePath(locale) {
  return locale === "ja" ? "feed.xml" : "en/feed.xml";
}

export function absoluteUrl(relativePath = "") {
  const normalized = relativePath.replace(/^\/+/, "");
  return new URL(normalized, siteConfig.siteUrl).toString();
}
