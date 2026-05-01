import path from "node:path";
import { mkdir, readFile } from "node:fs/promises";
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { loadArticles, publishedArticles } from "./lib/content.mjs";
import {
  renderArticlePage,
  renderDefaultOgSvg,
  renderFaviconSvg,
  renderIndexPage,
  renderNotFoundPage,
  renderRobots,
  renderSitemap,
  renderSitemapIndex,
  renderWebManifest
} from "./lib/render.mjs";
import { listingRelativePath, siteConfig } from "./lib/site-config.mjs";
import { writeBufferFile, writeTextFile } from "./lib/utils.mjs";

const outputRoot = path.resolve("public");
const iconRoot = path.join(outputRoot, "assets");

function paginateArticles(articles, pageSize) {
  const pages = [];

  for (let startIndex = 0; startIndex < articles.length; startIndex += pageSize) {
    pages.push({
      currentPage: pages.length + 1,
      startIndex,
      articles: articles.slice(startIndex, startIndex + pageSize)
    });
  }

  return pages.length > 0 ? pages : [{ currentPage: 1, startIndex: 0, articles: [] }];
}

async function buildFaviconAssets() {
  const faviconSvg = renderFaviconSvg();
  const faviconSvgPath = path.join(iconRoot, "favicon.svg");

  await writeTextFile(faviconSvgPath, faviconSvg);

  const svgBuffer = Buffer.from(faviconSvg);
  const sizes = [
    { name: "favicon-16.png", size: 16 },
    { name: "favicon-32.png", size: 32 },
    { name: "favicon-48.png", size: 48 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "favicon-192.png", size: 192 },
    { name: "favicon-512.png", size: 512 }
  ];

  const generated = new Map();

  for (const icon of sizes) {
    const buffer = await sharp(svgBuffer, { density: icon.size >= 180 ? 320 : 256 })
      .resize(icon.size, icon.size)
      .png({
        compressionLevel: 9,
        palette: icon.size <= 32,
        quality: 100
      })
      .toBuffer();

    generated.set(icon.name, buffer);
    await writeBufferFile(path.join(iconRoot, icon.name), buffer);
  }

  const icoBuffer = await pngToIco([
    generated.get("favicon-16.png"),
    generated.get("favicon-32.png"),
    generated.get("favicon-48.png")
  ]);

  await writeBufferFile(path.join(iconRoot, "favicon.ico"), icoBuffer);
}

async function buildSocialCardAsset() {
  const sourcePath = path.resolve("src/assets/og-twitter-card.png");
  const targetPath = path.join(outputRoot, siteConfig.ogImage);
  const imageBuffer = await readFile(sourcePath);
  await writeBufferFile(targetPath, imageBuffer);
}

async function buildArticleShareScript() {
  const sourcePath = path.resolve("src/assets/article-share.js");
  const targetPath = path.join(outputRoot, "assets", "article-share.js");
  const scriptText = await readFile(sourcePath, "utf8");
  await writeTextFile(targetPath, scriptText);
}

async function buildSite() {
  const { articles, errors } = await loadArticles();

  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n- ${errors.join("\n- ")}`);
  }

  const liveArticles = publishedArticles(articles);
  const listingPages = paginateArticles(liveArticles, siteConfig.pagination.articleListPageSize);
  const listingPagination = {
    totalArticles: liveArticles.length,
    totalPages: listingPages.length
  };

  await mkdir(iconRoot, { recursive: true });

  await writeTextFile(path.join(outputRoot, "404.html"), renderNotFoundPage("ja", liveArticles));
  await writeTextFile(path.join(outputRoot, "en", "404.html"), renderNotFoundPage("en", liveArticles));

  for (const locale of siteConfig.locales) {
    for (const page of listingPages) {
      await writeTextFile(
        path.join(outputRoot, listingRelativePath(locale, page.currentPage), "index.html"),
        renderIndexPage(locale, page.articles, {
          ...listingPagination,
          currentPage: page.currentPage,
          startIndex: page.startIndex
        })
      );
    }
  }

  for (const article of liveArticles) {
    await writeTextFile(path.join(outputRoot, article.outputPaths.ja), renderArticlePage(article, "ja", liveArticles));
    await writeTextFile(path.join(outputRoot, article.outputPaths.en), renderArticlePage(article, "en", liveArticles));
  }

  const latestUpdate =
    liveArticles
      .map((article) => article.lastModified)
      .sort((left, right) => right.localeCompare(left))[0] ?? new Date().toISOString();

  const pageSitemapEntries = [
    {
      path: listingRelativePath("ja"),
      lastModified: latestUpdate,
      alternates: [
        { hreflang: "ja", path: listingRelativePath("ja") },
        { hreflang: "en", path: listingRelativePath("en") },
        { hreflang: "x-default", path: listingRelativePath("ja") }
      ]
    },
    {
      path: listingRelativePath("en"),
      lastModified: latestUpdate,
      alternates: [
        { hreflang: "ja", path: listingRelativePath("ja") },
        { hreflang: "en", path: listingRelativePath("en") },
        { hreflang: "x-default", path: listingRelativePath("ja") }
      ]
    }
  ];

  for (const page of listingPages.filter(({ currentPage }) => currentPage > 1)) {
    pageSitemapEntries.push({
      path: listingRelativePath("ja", page.currentPage),
      lastModified: latestUpdate,
      alternates: [
        { hreflang: "ja", path: listingRelativePath("ja", page.currentPage) },
        { hreflang: "en", path: listingRelativePath("en", page.currentPage) }
      ]
    });
    pageSitemapEntries.push({
      path: listingRelativePath("en", page.currentPage),
      lastModified: latestUpdate,
      alternates: [
        { hreflang: "ja", path: listingRelativePath("ja", page.currentPage) },
        { hreflang: "en", path: listingRelativePath("en", page.currentPage) }
      ]
    });
  }

  const articleSitemapEntries = liveArticles.flatMap((article) => [
    {
      path: article.outputPaths.ja,
      lastModified: article.lastModified,
      alternates: [
        { hreflang: "ja", path: article.outputPaths.ja },
        { hreflang: "en", path: article.outputPaths.en }
      ]
    },
    {
      path: article.outputPaths.en,
      lastModified: article.lastModified,
      alternates: [
        { hreflang: "ja", path: article.outputPaths.ja },
        { hreflang: "en", path: article.outputPaths.en }
      ]
    }
  ]);

  const sitemapIndexEntries = [
    {
      path: "sitemap-pages.xml",
      lastModified: latestUpdate
    },
    {
      path: "sitemap-articles.xml",
      lastModified: latestUpdate
    }
  ];

  await writeTextFile(path.join(outputRoot, "sitemap.xml"), renderSitemapIndex(sitemapIndexEntries));
  await writeTextFile(path.join(outputRoot, "sitemap-pages.xml"), renderSitemap(pageSitemapEntries));
  await writeTextFile(path.join(outputRoot, "sitemap-articles.xml"), renderSitemap(articleSitemapEntries));
  await writeTextFile(path.join(outputRoot, "robots.txt"), renderRobots());
  await writeTextFile(path.join(outputRoot, "site.webmanifest"), renderWebManifest());
  if (siteConfig.cname) {
    await writeTextFile(path.join(outputRoot, "CNAME"), `${siteConfig.cname}\n`);
  }
  await writeTextFile(path.join(outputRoot, ".nojekyll"), "");
  await writeTextFile(path.join(outputRoot, "assets", "og-default.svg"), renderDefaultOgSvg());
  await buildSocialCardAsset();
  await buildArticleShareScript();
  await buildFaviconAssets();
}

buildSite().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
