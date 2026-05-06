const snippetLengthLimits = {
  description: {
    ja: 130,
    en: 170
  },
  teaser: {
    ja: 110,
    en: 150
  }
};

const segmenters = new Map();

function normalizedLocale(locale) {
  return locale === "ja" ? "ja" : "en";
}

export function snippetLengthLimit(kind, locale) {
  return snippetLengthLimits[kind][normalizedLocale(locale)];
}

export function normalizeSnippetText(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

export function snippetTextLength(value) {
  return Array.from(normalizeSnippetText(value)).length;
}

function cleanupSnippetEnding(value) {
  return value
    .replace(/[\s,:;/-]+$/u, "")
    .replace(/[、・]+$/u, "")
    .trim();
}

function preferredBoundaryMatchers(locale) {
  if (normalizedLocale(locale) === "ja") {
    return [/[。！？]/gu, /[、]/gu];
  }

  return [/[.!?](?=\s|$)/gu, /[:;](?=\s|$)/gu, /,(?=\s)/gu];
}

function minimumNaturalLength(locale, maxChars) {
  return Math.min(maxChars, Math.max(normalizedLocale(locale) === "ja" ? 24 : 40, Math.floor(maxChars * 0.55)));
}

function findBoundaryCutoff(text, locale, maxChars) {
  const minimum = minimumNaturalLength(locale, maxChars);
  let bestCutoff = 0;

  for (const matcher of preferredBoundaryMatchers(locale)) {
    for (const match of text.matchAll(matcher)) {
      const cutoff = match.index + match[0].length;
      if (cutoff > maxChars) {
        break;
      }

      if (cutoff >= minimum && cutoff > bestCutoff) {
        bestCutoff = cutoff;
      }
    }
  }

  return bestCutoff;
}

function getSegmenter(locale) {
  const key = normalizedLocale(locale);

  if (!segmenters.has(key)) {
    segmenters.set(key, new Intl.Segmenter(key === "ja" ? "ja-JP" : "en-US", { granularity: "word" }));
  }

  return segmenters.get(key);
}

function truncateByWordBoundary(text, locale, maxChars) {
  let output = "";

  for (const part of getSegmenter(locale).segment(text)) {
    const candidate = output + part.segment;
    if (snippetTextLength(candidate) > maxChars) {
      break;
    }
    output = candidate;
  }

  return cleanupSnippetEnding(output);
}

export function shortenSnippet(text, locale, maxChars) {
  const normalized = normalizeSnippetText(text);

  if (!normalized) {
    return "";
  }

  if (snippetTextLength(normalized) <= maxChars) {
    return normalized;
  }

  const boundaryCutoff = findBoundaryCutoff(normalized, locale, maxChars);
  if (boundaryCutoff > 0) {
    return cleanupSnippetEnding(normalized.slice(0, boundaryCutoff));
  }

  const segmented = truncateByWordBoundary(normalized, locale, maxChars);
  if (segmented) {
    return segmented;
  }

  return cleanupSnippetEnding(Array.from(normalized).slice(0, maxChars).join(""));
}

function localizedField(article, locale, fieldStem) {
  const suffix = normalizedLocale(locale) === "ja" ? "Ja" : "En";
  return normalizeSnippetText(article?.[`${fieldStem}${suffix}`]);
}

export function resolveArticleSeoTitle(article, locale) {
  return localizedField(article, locale, "seoTitle") || localizedField(article, locale, "title");
}

export function resolveArticleSeoDescription(article, locale) {
  return (
    localizedField(article, locale, "seoDescription") ||
    shortenSnippet(localizedField(article, locale, "summary"), locale, snippetLengthLimit("description", locale))
  );
}

export function resolveArticleTeaser(article, locale) {
  return (
    localizedField(article, locale, "teaser") ||
    shortenSnippet(localizedField(article, locale, "summary"), locale, snippetLengthLimit("teaser", locale))
  );
}

export function resolveArticleSeo(article) {
  return {
    ja: {
      title: resolveArticleSeoTitle(article, "ja"),
      description: resolveArticleSeoDescription(article, "ja"),
      teaser: resolveArticleTeaser(article, "ja")
    },
    en: {
      title: resolveArticleSeoTitle(article, "en"),
      description: resolveArticleSeoDescription(article, "en"),
      teaser: resolveArticleTeaser(article, "en")
    }
  };
}
