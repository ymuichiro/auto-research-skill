import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { loadArticles, publishedArticles } from "./lib/content.mjs";
import { siteConfig } from "./lib/site-config.mjs";

const outputRoot = path.resolve("public");

function archivePagePaths(articles) {
  const totalPages = Math.max(1, Math.ceil(articles.length / siteConfig.pagination.archivePageSize));
  const paths = [];

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    if (pageNumber === 1) {
      paths.push("archive/index.html", "en/archive/index.html");
      continue;
    }

    paths.push(`archive/page/${pageNumber}/index.html`, `en/archive/page/${pageNumber}/index.html`);
  }

  return paths;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function validateBuiltOutput(articles) {
  const requiredPages = [
    "index.html",
    "en/index.html",
    "feed.xml",
    "en/feed.xml",
    "sitemap.xml",
    "robots.txt",
    ".nojekyll",
    "assets/site.css",
    "assets/og-twitter-card.png",
    "assets/og-default.svg",
    "assets/favicon.svg"
  ].concat(archivePagePaths(articles));

  const missing = [];

  for (const page of requiredPages) {
    if (!(await fileExists(path.join(outputRoot, page)))) {
      missing.push(page);
    }
  }

  for (const article of articles) {
    for (const outputPath of Object.values(article.outputPaths)) {
      if (!(await fileExists(path.join(outputRoot, outputPath)))) {
        missing.push(outputPath);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(`Built output is missing required files:\n- ${missing.join("\n- ")}`);
  }

  const sampleArticle = articles[0];

  if (sampleArticle) {
    const jaHtml = await readFile(path.join(outputRoot, sampleArticle.outputPaths.ja), "utf8");
    const enHtml = await readFile(path.join(outputRoot, sampleArticle.outputPaths.en), "utf8");

    for (const markup of [jaHtml, enHtml]) {
      if (!markup.includes('rel="canonical"')) {
        throw new Error("Built article is missing canonical metadata.");
      }

      if (!markup.includes('hreflang="ja"') || !markup.includes('hreflang="en"')) {
        throw new Error("Built article is missing hreflang links.");
      }

      if (!markup.includes("application/ld+json")) {
        throw new Error("Built article is missing JSON-LD metadata.");
      }
    }
  }
}

async function validate() {
  const { articles, errors } = await loadArticles();

  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n- ${errors.join("\n- ")}`);
  }

  if (await fileExists(outputRoot)) {
    await validateBuiltOutput(publishedArticles(articles));
  }
}

validate().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
