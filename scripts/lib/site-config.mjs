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
    },
    archiveTitle: {
      ja: "公開レポートアーカイブ",
      en: "Research Briefing Archive"
    },
    archiveDescription: {
      ja: "公開済みの LLM・AI・AI Agent レポートを日付順に一覧化したアーカイブ。",
      en: "An archive of published LLM, AI, and AI agent briefings listed in reverse chronological order."
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
