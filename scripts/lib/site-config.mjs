function normalizeSiteUrl(rawUrl) {
  const url = new URL(rawUrl);
  return url.toString().endsWith("/") ? url.toString() : `${url.toString()}/`;
}

const siteUrl = normalizeSiteUrl(process.env.SITE_URL ?? "https://research.notelligent.app/");
const siteOrigin = new URL(siteUrl);
const basePath = siteOrigin.pathname.replace(/\/$/, "");
const cname = siteOrigin.hostname.endsWith(".github.io") ? null : siteOrigin.hostname;

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
  ogImage: "assets/og-twitter-card.png",
  ogImageWidth: 1536,
  ogImageHeight: 1024,
  defaultRobots: "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1",
  description: {
    ja: "LLM、AI、AI Agent の事例、ユースケース、技術トレンドを中立的に整理するリサーチ配信サイト。",
    en: "A neutral research publication on LLM, AI, and AI agent use cases, technical trends, and market direction."
  },
  seo: {
    homeTitle: {
      ja: "LLM・AI・AI Agent の調査レポート",
      en: "LLM, AI, and AI Agent Research Briefings"
    }
  },
  heroKicker: {
    ja: "Research Signal",
    en: "Research Signal"
  },
  taglines: {
    ja: "AI とエージェントの重要シグナルを、一次情報から読み解く。",
    en: "Reading the key signals in AI and agents through primary-source reporting."
  },
  nav: {
    ja: [{ label: "トップ", path: "" }],
    en: [{ label: "Home", path: "en/" }]
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

export function absoluteUrl(relativePath = "") {
  const normalized = relativePath.replace(/^\/+/, "");
  return new URL(normalized, siteConfig.siteUrl).toString();
}
