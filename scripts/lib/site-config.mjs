const repository = process.env.GITHUB_REPOSITORY ?? "ymuichiro/auto-research-skill";
const [defaultOwner, defaultRepo] = repository.split("/");

function normalizeSiteUrl(rawUrl) {
  const url = new URL(rawUrl);
  return url.toString().endsWith("/") ? url.toString() : `${url.toString()}/`;
}

const siteUrl = normalizeSiteUrl(
  process.env.SITE_URL ?? `https://${defaultOwner}.github.io/${defaultRepo}/`
);
const basePath = new URL(siteUrl).pathname.replace(/\/$/, "");

export const siteConfig = {
  name: "Auto Research Digest",
  owner: "Auto Research Digest Editorial Desk",
  defaultLocale: "ja",
  locales: ["ja", "en"],
  siteUrl,
  basePath,
  themeColor: "#132238",
  ogImage: "assets/og-default.svg",
  description: {
    ja: "LLM、AI、AI Agent の事例、ユースケース、技術トレンドを中立的に整理する経営層向けリサーチ配信サイト。",
    en: "A neutral executive briefing site on LLM, AI, and AI agent use cases, technical trends, and market direction."
  },
  heroKicker: {
    ja: "Executive Research Signal",
    en: "Executive Research Signal"
  },
  taglines: {
    ja: "公式ドキュメントと論文を根拠に、AI の実務トレンドを見える化する。",
    en: "Visualizing practical AI trends with official documentation and paper-backed evidence."
  },
  nav: {
    ja: [
      { label: "トップ", path: "" },
      { label: "アーカイブ", path: "archive/" },
      { label: "フィード", path: "feed.xml" }
    ],
    en: [
      { label: "Home", path: "en/" },
      { label: "Archive", path: "en/archive/" },
      { label: "Feed", path: "en/feed.xml" }
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

export function absoluteUrl(relativePath = "") {
  const normalized = relativePath.replace(/^\/+/, "");
  return new URL(normalized, siteConfig.siteUrl).toString();
}
