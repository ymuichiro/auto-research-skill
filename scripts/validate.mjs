import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { loadArticles, publishedArticles } from "./lib/content.mjs";
import { absoluteUrl, siteConfig } from "./lib/site-config.mjs";
import { escapeHtml } from "./lib/utils.mjs";

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

async function readBuiltFile(relativePath) {
  return readFile(path.join(outputRoot, relativePath), "utf8");
}

function assertContains(markup, expected, message) {
  if (!markup.includes(expected)) {
    throw new Error(message);
  }
}

async function validateBuiltOutput(articles) {
  const requiredPages = [
    "index.html",
    "en/index.html",
    "feed.xml",
    "en/feed.xml",
    "sitemap.xml",
    "sitemap-pages.xml",
    "sitemap-articles.xml",
    "robots.txt",
    "site.webmanifest",
    ".nojekyll",
    "assets/site.css",
    "assets/article-share.js",
    "assets/og-twitter-card.png",
    "assets/og-default.svg",
    "assets/favicon.svg"
  ]
    .concat(siteConfig.cname ? ["CNAME"] : [])
    .concat(archivePagePaths(articles));

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

  const homeHtml = await readBuiltFile("index.html");
  const enHomeHtml = await readBuiltFile("en/index.html");
  const jaFeed = await readBuiltFile("feed.xml");
  const enFeed = await readBuiltFile("en/feed.xml");
  const robotsTxt = await readBuiltFile("robots.txt");
  const sitemapIndex = await readBuiltFile("sitemap.xml");
  const pageSitemap = await readBuiltFile("sitemap-pages.xml");
  const articleSitemap = await readBuiltFile("sitemap-articles.xml");
  const webManifest = await readBuiltFile("site.webmanifest");
  const rootPath = siteConfig.basePath ? `${siteConfig.basePath}/` : "/";

  if (siteConfig.cname) {
    const cname = (await readBuiltFile("CNAME")).trim();

    if (cname !== siteConfig.cname) {
      throw new Error(`Built CNAME does not match configured host: ${siteConfig.cname}`);
    }
  }

  for (const [markup, canonicalUrl, label] of [
    [homeHtml, absoluteUrl(""), "Japanese home page"],
    [enHomeHtml, absoluteUrl("en/"), "English home page"]
  ]) {
    assertContains(markup, `rel="canonical" href="${canonicalUrl}"`, `${label} is missing the expected canonical URL.`);
    assertContains(markup, `property="og:url" content="${canonicalUrl}"`, `${label} is missing the expected og:url.`);
    assertContains(markup, siteConfig.siteUrl, `${label} is not using the configured site URL.`);
    assertContains(markup, "application/ld+json", `${label} is missing JSON-LD metadata.`);
  }

  const sampleArticle = articles[0];

  if (sampleArticle) {
    const jaHtml = await readBuiltFile(sampleArticle.outputPaths.ja);
    const enHtml = await readBuiltFile(sampleArticle.outputPaths.en);
    const jaTitle = sampleArticle.titleJa;
    const enTitle = sampleArticle.titleEn;
    const jaUrl = absoluteUrl(sampleArticle.outputPaths.ja);
    const enUrl = absoluteUrl(sampleArticle.outputPaths.en);
    const jaXIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(jaTitle)}&url=${encodeURIComponent(jaUrl)}`;
    const enXIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(enTitle)}&url=${encodeURIComponent(enUrl)}`;

    for (const [markup, canonicalUrl, label] of [
      [jaHtml, absoluteUrl(sampleArticle.outputPaths.ja), "Japanese article"],
      [enHtml, absoluteUrl(sampleArticle.outputPaths.en), "English article"]
    ]) {
      assertContains(markup, `rel="canonical" href="${canonicalUrl}"`, `${label} is missing the expected canonical URL.`);
      assertContains(markup, `property="og:url" content="${canonicalUrl}"`, `${label} is missing the expected og:url.`);
      assertContains(markup, 'hreflang="ja"', `${label} is missing the ja hreflang link.`);
      assertContains(markup, 'hreflang="en"', `${label} is missing the en hreflang link.`);
      assertContains(markup, siteConfig.siteUrl, `${label} is not using the configured site URL.`);
      assertContains(markup, "application/ld+json", `${label} is missing JSON-LD metadata.`);
      assertContains(markup, 'class="article-share"', `${label} is missing the article share block.`);
      assertContains(markup, 'class="panel-block related-articles"', `${label} is missing the related articles block.`);
      assertContains(markup, 'data-native-share', `${label} is missing the native share trigger.`);
      assertContains(markup, 'data-copy-share', `${label} is missing the copy share trigger.`);
      assertContains(markup, 'assets/article-share.js', `${label} is missing the article share script.`);
    }

    assertContains(jaHtml, `href="${jaXIntent}"`, "Japanese article is missing the expected X share URL.");
    assertContains(enHtml, `href="${enXIntent}"`, "English article is missing the expected X share URL.");
    assertContains(jaHtml, `data-share-url="${jaUrl}"`, "Japanese article share block is missing the expected URL.");
    assertContains(enHtml, `data-share-url="${enUrl}"`, "English article share block is missing the expected URL.");
    assertContains(jaHtml, `data-share-title="${escapeHtml(jaTitle)}"`, "Japanese article share block is missing the expected title.");
    assertContains(enHtml, `data-share-title="${escapeHtml(enTitle)}"`, "English article share block is missing the expected title.");

    assertContains(
      articleSitemap,
      absoluteUrl(sampleArticle.outputPaths.ja),
      "Article sitemap is missing the Japanese article URL for the configured site."
    );
    assertContains(
      articleSitemap,
      absoluteUrl(sampleArticle.outputPaths.en),
      "Article sitemap is missing the English article URL for the configured site."
    );
  }

  assertContains(jaFeed, absoluteUrl("feed.xml"), "Japanese feed is missing the configured self URL.");
  assertContains(jaFeed, absoluteUrl(""), "Japanese feed is missing the configured home URL.");
  assertContains(enFeed, absoluteUrl("en/feed.xml"), "English feed is missing the configured self URL.");
  assertContains(enFeed, absoluteUrl("en/"), "English feed is missing the configured home URL.");
  assertContains(robotsTxt, `Sitemap: ${absoluteUrl("sitemap.xml")}`, "robots.txt is missing the configured sitemap URL.");
  assertContains(sitemapIndex, absoluteUrl("sitemap-pages.xml"), "Sitemap index is missing the configured page sitemap URL.");
  assertContains(
    sitemapIndex,
    absoluteUrl("sitemap-articles.xml"),
    "Sitemap index is missing the configured article sitemap URL."
  );
  assertContains(pageSitemap, absoluteUrl(""), "Page sitemap is missing the configured Japanese home URL.");
  assertContains(pageSitemap, absoluteUrl("en/"), "Page sitemap is missing the configured English home URL.");
  assertContains(webManifest, `"start_url": "${rootPath}"`, "Web manifest start_url does not match the configured base path.");
  assertContains(webManifest, `"scope": "${rootPath}"`, "Web manifest scope does not match the configured base path.");
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
