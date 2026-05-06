import { slugify } from "./utils.mjs";

const topicDescriptions = {
  "ai-agents": {
    ja: "AI agent の実装、運用、評価、ガバナンス、プロトコルの変化を束ねる主要テーマです。",
    en: "The main topic for AI agent implementation, operations, evaluation, governance, and protocol shifts."
  },
  "ai-strategy": {
    ja: "AI プロダクトの体験設計、市場のまとまり方、導入判断の論点を整理するテーマです。",
    en: "A topic focused on AI product design patterns, market structure, and adoption decision points."
  }
};

function createStableSlugMap(categories) {
  const used = new Set();
  const slugMap = new Map();

  for (const category of [...categories].sort((left, right) => left.localeCompare(right))) {
    const baseSlug = slugify(category) || "topic";
    let slug = baseSlug;
    let suffix = 2;

    while (used.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    used.add(slug);
    slugMap.set(category, slug);
  }

  return slugMap;
}

function normalizedTopicToken(value) {
  return slugify(value).replace(/-agents$/, "-agent");
}

function isGenericTag(tag, category) {
  const normalizedTag = normalizedTopicToken(tag);
  const normalizedCategory = normalizedTopicToken(category);
  return normalizedTag === "roundup" || normalizedTag === normalizedCategory;
}

function representativeTags(articles, category) {
  const tagStats = new Map();

  for (const article of articles) {
    for (const tag of article.tags) {
      const current = tagStats.get(tag) ?? { count: 0, latestDate: article.date };
      tagStats.set(tag, {
        count: current.count + 1,
        latestDate: current.latestDate > article.date ? current.latestDate : article.date
      });
    }
  }

  const sorted = [...tagStats.entries()].sort(
    (left, right) =>
      right[1].count - left[1].count ||
      right[1].latestDate.localeCompare(left[1].latestDate) ||
      left[0].localeCompare(right[0])
  );
  const filtered = sorted.filter(([tag]) => !isGenericTag(tag, category));
  return (filtered.length > 0 ? filtered : sorted).slice(0, 6).map(([tag]) => tag);
}

function topicDescription(slug, category) {
  return (
    topicDescriptions[slug] ?? {
      ja: `${category} に関する公開レポートを、主要論点ごとにまとめたテーマハブです。`,
      en: `A topic hub grouping published briefings in ${category} around the main practical questions.`
    }
  );
}

export function buildTopicHubs(articles) {
  const categories = [...new Set(articles.map((article) => article.category))];
  const slugMap = createStableSlugMap(categories);

  return categories
    .map((category) => {
      const hubArticles = articles.filter((article) => article.category === category);
      const slug = slugMap.get(category);
      const latestArticle = hubArticles[0] ?? null;
      const latestModified =
        hubArticles.reduce(
          (latest, article) => (!latest || article.lastModified.localeCompare(latest) > 0 ? article.lastModified : latest),
          ""
        ) || latestArticle?.lastModified;

      return {
        category,
        slug,
        articles: hubArticles,
        articleCount: hubArticles.length,
        latestArticle,
        latestModified,
        representativeTags: representativeTags(hubArticles, category),
        descriptions: topicDescription(slug, category)
      };
    })
    .sort(
      (left, right) =>
        right.articleCount - left.articleCount ||
        right.latestModified.localeCompare(left.latestModified) ||
        left.category.localeCompare(right.category)
    );
}
