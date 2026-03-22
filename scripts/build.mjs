import path from "node:path";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { loadArticles, publishedArticles } from "./lib/content.mjs";
import {
  renderArchivePage,
  renderArticlePage,
  renderAtomFeed,
  renderDefaultOgSvg,
  renderFaviconSvg,
  renderIndexPage,
  renderNotFoundPage,
  renderRobots,
  renderSitemap,
  renderSitemapIndex,
  renderWebManifest
} from "./lib/render.mjs";
import { writeBufferFile, writeTextFile } from "./lib/utils.mjs";

const outputRoot = path.resolve("public");
const iconRoot = path.join(outputRoot, "assets");

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

async function buildSite() {
  const { articles, errors } = await loadArticles();

  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n- ${errors.join("\n- ")}`);
  }

  const liveArticles = publishedArticles(articles);

  await mkdir(iconRoot, { recursive: true });
  await mkdir(path.join(outputRoot, "archive"), { recursive: true });
  await mkdir(path.join(outputRoot, "en", "archive"), { recursive: true });

  await writeTextFile(path.join(outputRoot, "index.html"), renderIndexPage("ja", liveArticles));
  await writeTextFile(path.join(outputRoot, "archive", "index.html"), renderArchivePage("ja", liveArticles));
  await writeTextFile(path.join(outputRoot, "feed.xml"), renderAtomFeed("ja", liveArticles));

  await writeTextFile(path.join(outputRoot, "en", "index.html"), renderIndexPage("en", liveArticles));
  await writeTextFile(path.join(outputRoot, "en", "archive", "index.html"), renderArchivePage("en", liveArticles));
  await writeTextFile(path.join(outputRoot, "en", "feed.xml"), renderAtomFeed("en", liveArticles));
  await writeTextFile(path.join(outputRoot, "404.html"), renderNotFoundPage("ja", liveArticles));
  await writeTextFile(path.join(outputRoot, "en", "404.html"), renderNotFoundPage("en", liveArticles));

  for (const article of liveArticles) {
    await writeTextFile(path.join(outputRoot, article.outputPaths.ja), renderArticlePage(article, "ja"));
    await writeTextFile(path.join(outputRoot, article.outputPaths.en), renderArticlePage(article, "en"));
  }

  const latestUpdate =
    liveArticles
      .map((article) => article.lastModified)
      .sort((left, right) => right.localeCompare(left))[0] ?? new Date().toISOString();

  const pageSitemapEntries = [
    {
      path: "",
      lastModified: latestUpdate,
      alternates: [
        { hreflang: "ja", path: "" },
        { hreflang: "en", path: "en/" },
        { hreflang: "x-default", path: "" }
      ]
    },
    {
      path: "archive/",
      lastModified: latestUpdate,
      alternates: [
        { hreflang: "ja", path: "archive/" },
        { hreflang: "en", path: "en/archive/" }
      ]
    },
    {
      path: "en/",
      lastModified: latestUpdate,
      alternates: [
        { hreflang: "ja", path: "" },
        { hreflang: "en", path: "en/" },
        { hreflang: "x-default", path: "" }
      ]
    },
    {
      path: "en/archive/",
      lastModified: latestUpdate,
      alternates: [
        { hreflang: "ja", path: "archive/" },
        { hreflang: "en", path: "en/archive/" }
      ]
    }
  ];

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
  await writeTextFile(path.join(outputRoot, ".nojekyll"), "");
  await writeTextFile(path.join(outputRoot, "assets", "og-default.svg"), renderDefaultOgSvg());
  await buildFaviconAssets();
}

buildSite().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
