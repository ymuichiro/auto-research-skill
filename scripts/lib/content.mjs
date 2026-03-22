import { readdir, readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { readJson, sortedByDateDesc } from "./utils.mjs";

const contentRoot = path.resolve("content/articles");
const execFileAsync = promisify(execFile);
const requiredFields = [
  "slug",
  "date",
  "titleJa",
  "titleEn",
  "summaryJa",
  "summaryEn",
  "category",
  "tags",
  "publishedSources",
  "draft"
];

function validateSource(source, index, articleId, errors) {
  if (!source || typeof source !== "object") {
    errors.push(`${articleId}: publishedSources[${index}] must be an object.`);
    return;
  }

  if (!source.label || typeof source.label !== "string") {
    errors.push(`${articleId}: publishedSources[${index}].label is required.`);
  }

  if (!source.url || typeof source.url !== "string") {
    errors.push(`${articleId}: publishedSources[${index}].url is required.`);
  } else {
    try {
      const parsedUrl = new URL(source.url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        errors.push(`${articleId}: publishedSources[${index}].url must be http or https.`);
      }
    } catch {
      errors.push(`${articleId}: publishedSources[${index}].url must be a valid URL.`);
    }
  }

  if (!["official", "paper"].includes(source.type)) {
    errors.push(`${articleId}: publishedSources[${index}].type must be "official" or "paper".`);
  }

  if (source.publishedAt && !/^\d{4}-\d{2}-\d{2}$/.test(source.publishedAt)) {
    errors.push(`${articleId}: publishedSources[${index}].publishedAt must use YYYY-MM-DD.`);
  }
}

function validateMeta(meta, articleDirName, errors) {
  const articleId = `${articleDirName}/meta.json`;

  for (const field of requiredFields) {
    if (!(field in meta)) {
      errors.push(`${articleId}: missing required field "${field}".`);
    }
  }

  if (typeof meta.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug)) {
    errors.push(`${articleId}: slug must be lowercase kebab-case.`);
  }

  if (typeof meta.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) {
    errors.push(`${articleId}: date must use YYYY-MM-DD.`);
  }

  const expectedDirName = `${meta.date}-${meta.slug}`;
  if (meta.date && meta.slug && articleDirName !== expectedDirName) {
    errors.push(`${articleId}: directory name must be "${expectedDirName}".`);
  }

  for (const field of ["titleJa", "titleEn", "summaryJa", "summaryEn", "category"]) {
    if (typeof meta[field] !== "string" || meta[field].trim().length === 0) {
      errors.push(`${articleId}: ${field} must be a non-empty string.`);
    }
  }

  if (!Array.isArray(meta.tags) || meta.tags.length === 0 || meta.tags.some((tag) => typeof tag !== "string")) {
    errors.push(`${articleId}: tags must be a non-empty string array.`);
  }

  if (!Array.isArray(meta.publishedSources) || meta.publishedSources.length === 0) {
    errors.push(`${articleId}: publishedSources must be a non-empty array.`);
  } else {
    meta.publishedSources.forEach((source, index) => validateSource(source, index, articleId, errors));
  }

  if (typeof meta.draft !== "boolean") {
    errors.push(`${articleId}: draft must be a boolean.`);
  }
}

function validateBodies(articleDirName, bodies, errors) {
  if (!bodies.ja.trim()) {
    errors.push(`${articleDirName}/body.ja.html: file must not be empty.`);
  }

  if (!bodies.en.trim()) {
    errors.push(`${articleDirName}/body.en.html: file must not be empty.`);
  }
}

function computeOutputPaths(meta) {
  return {
    ja: `${meta.date}-${meta.slug}.html`,
    en: `en/${meta.date}-${meta.slug}.html`
  };
}

function fallbackArticleDateTime(date) {
  return `${date}T00:00:00+09:00`;
}

async function resolveLastModified(articleDir, meta) {
  const trackedFiles = ["meta.json", "body.ja.html", "body.en.html"].map((fileName) =>
    path.join(articleDir, fileName)
  );

  try {
    const { stdout } = await execFileAsync("git", ["log", "-1", "--format=%cI", "--", ...trackedFiles], {
      cwd: contentRoot
    });
    const value = stdout.trim();
    return value || fallbackArticleDateTime(meta.date);
  } catch {
    return fallbackArticleDateTime(meta.date);
  }
}

export async function loadArticles() {
  let articleDirectoryNames = [];

  try {
    articleDirectoryNames = (await readdir(contentRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return { articles: [], errors: [] };
  }

  const errors = [];
  const articles = [];

  for (const articleDirName of articleDirectoryNames) {
    const articleDir = path.join(contentRoot, articleDirName);
    const meta = await readJson(path.join(articleDir, "meta.json")).catch(() => null);
    const bodies = {
      ja: await readFile(path.join(articleDir, "body.ja.html"), "utf8").catch(() => ""),
      en: await readFile(path.join(articleDir, "body.en.html"), "utf8").catch(() => "")
    };

    if (!meta) {
      errors.push(`${articleDirName}: meta.json is missing or invalid JSON.`);
      continue;
    }

    validateMeta(meta, articleDirName, errors);
    validateBodies(articleDirName, bodies, errors);

    const outputPaths = computeOutputPaths(meta);
    const lastModified = await resolveLastModified(articleDir, meta);
    articles.push({
      ...meta,
      sourceDir: articleDir,
      sourceDirName: articleDirName,
      bodies,
      publishedAtIso: fallbackArticleDateTime(meta.date),
      lastModified,
      outputPaths
    });
  }

  const seenOutputs = new Map();

  for (const article of articles) {
    for (const [locale, outputPath] of Object.entries(article.outputPaths)) {
      const existing = seenOutputs.get(outputPath);
      if (existing) {
        errors.push(
          `${article.sourceDirName}: ${locale} output path "${outputPath}" collides with ${existing}.`
        );
      } else {
        seenOutputs.set(outputPath, article.sourceDirName);
      }
    }

    if (!article.draft && article.publishedSources.length === 0) {
      errors.push(`${article.sourceDirName}: published article must include publishedSources.`);
    }
  }

  return {
    articles: sortedByDateDesc(articles),
    errors
  };
}

export function publishedArticles(articles) {
  return articles.filter((article) => !article.draft);
}
