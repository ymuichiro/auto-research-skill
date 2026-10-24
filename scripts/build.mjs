import path from "node:path";
import { mkdir, readFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import pngToIco from "png-to-ico";
import { loadArticles, publishedArticles } from "./lib/content.mjs";
import {
  renderArticlePage,
  renderReadingArticle,
  renderArticleContinuation,
  pageTitle,
  renderDefaultOgSvg,
  renderFaviconSvg,
  renderFeed,
  renderIndexPage,
  renderNotFoundPage,
  renderRobots,
  renderSitemap,
  renderSitemapIndex,
  renderTimelineRedirect,
  renderTopicHubPage,
  renderTopicsIndexPage,
  renderWebManifest
} from "./lib/render.mjs";
import {
  feedRelativePath,
  listingRelativePath,
  removedHtmlPages,
  siteConfig,
  timelineRelativePath,
  topicHubRelativePath,
  topicIndexRelativePath
} from "./lib/site-config.mjs";
import { buildTopicHubs } from "./lib/topic-hubs.mjs";
import {spatialCatalog} from './lib/spatial-site.mjs';
import {runtimeAssets} from './lib/runtime-assets.mjs';
import {prepareArticleBody} from './lib/article-template.mjs';
import { writeBufferFile, writeTextFile } from "./lib/utils.mjs";

const outputRoot = path.resolve(process.env.SITE_OUTPUT_DIR??"public");
const iconRoot = path.join(outputRoot, "assets");
const execFileAsync = promisify(execFile);
let sharpLoader = null;

async function loadSharp() {
  if (sharpLoader === null) {
    sharpLoader = import("sharp")
      .then((module) => module.default ?? module)
      .catch(() => null);
  }

  return sharpLoader;
}

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
  const sharp = await loadSharp();
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
    const targetPath = path.join(iconRoot, icon.name);
    const buffer = sharp
      ? await sharp(svgBuffer, { density: icon.size >= 180 ? 320 : 256 })
          .resize(icon.size, icon.size)
          .png({
            compressionLevel: 9,
            palette: icon.size <= 32,
            quality: 100
          })
          .toBuffer()
      : await (async () => {
          await execFileAsync("sips", [
            "-s",
            "format",
            "png",
            "-z",
            String(icon.size),
            String(icon.size),
            faviconSvgPath,
            "--out",
            targetPath
          ]);

          return readFile(targetPath);
        })();

    generated.set(icon.name, buffer);
    await writeBufferFile(targetPath, buffer);
  }

  const icoBuffer = await pngToIco([
    generated.get("favicon-16.png"),
    generated.get("favicon-32.png"),
    generated.get("favicon-48.png")
  ]);

  await writeBufferFile(path.join(iconRoot, "favicon.ico"), icoBuffer);
  // Browsers and older crawls can request the conventional root path.
  await writeBufferFile(path.join(outputRoot, "favicon.ico"), icoBuffer);
}

async function buildSocialCardAsset() {
  const sourcePath = path.resolve("src/assets/og-twitter-card.png");
  const targetPath = path.join(outputRoot, siteConfig.ogImage);
  const sharp = await loadSharp();
  const imageBuffer = sharp ? await sharp(Buffer.from(renderDefaultOgSvg())).png().toBuffer() : await readFile(sourcePath);
  await writeBufferFile(targetPath, imageBuffer);
  // Keep the previously published image URL usable for existing links.
  await writeBufferFile(path.join(outputRoot, "assets", "og-twitter-card.png"), imageBuffer);
}

async function buildSpatialAssets() {
  const illustrations=JSON.parse(await readFile('src/assets/illustrations/manifest.json','utf8'));
  for(const item of illustrations.items){const file=`${item.kind}/${item.id}.webp`;await writeBufferFile(path.join(outputRoot,'assets/illustrations',file),await readFile(path.resolve('src/assets/illustrations',file)));}
  for(const name of ['flow','execution'])await rm(path.join(outputRoot,`assets/topic-${name}.webp`),{force:true});
  for(const name of ['article-share.js','article-stream.js','article-motion.js','listing-motion.js']) {
    await rm(path.join(outputRoot,'assets',name),{force:true});
  }
  await writeTextFile(path.join(outputRoot,'assets/site-ui.js'),await readFile(path.resolve('src/assets/site-ui.js'),'utf8'));
  for(const name of ['spatial-site.js','spatial-copy.js','timeline-redirect.js']) {
    await writeTextFile(path.join(outputRoot,'assets',name),await readFile(path.resolve('src/assets',name),'utf8'));
  }
  await writeTextFile(path.join(outputRoot,'assets/spatial-site.css'),await readFile(path.resolve('src/styles/spatial-site.css'),'utf8'));
  for(const asset of runtimeAssets)await writeTextFile(path.join(outputRoot,'assets',asset.filename),asset.content);
}

async function buildSite() {
  const { articles, errors } = await loadArticles();

  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n- ${errors.join("\n- ")}`);
  }

  const liveArticles = publishedArticles(articles);
  const topicHubs = buildTopicHubs(liveArticles);
  const listingPages = paginateArticles(liveArticles, siteConfig.pagination.articleListPageSize);
  const listingPagination = {
    totalArticles: liveArticles.length,
    totalPages: listingPages.length
  };
  const latestUpdate =
    liveArticles.map((article) => article.lastModified).sort((left, right) =>
      right.localeCompare(left)
    )[0] ?? new Date().toISOString();

  await mkdir(iconRoot, { recursive: true });
  await Promise.all(removedHtmlPages.map(page=>rm(path.join(outputRoot,page),{force:true})));
  for(const locale of siteConfig.locales) {
    await writeTextFile(path.join(outputRoot,'assets/spatial',`${locale}.json`),JSON.stringify(spatialCatalog(liveArticles,topicHubs,locale)));
  }

  await writeTextFile(path.join(outputRoot, "404.html"), renderNotFoundPage("ja", liveArticles));
  await writeTextFile(path.join(outputRoot, "en", "404.html"), renderNotFoundPage("en", liveArticles));

  for (const locale of siteConfig.locales) {
    for (const page of listingPages) {
      await writeTextFile(
        path.join(outputRoot, listingRelativePath(locale, page.currentPage), "index.html"),
        renderIndexPage(locale, page.articles, {
          ...listingPagination,
          currentPage: page.currentPage,
          startIndex: page.startIndex,
          topicHubs
        })
      );
    }
  }

  for (const locale of siteConfig.locales) {
    await writeTextFile(path.join(outputRoot, topicIndexRelativePath(locale), "index.html"), renderTopicsIndexPage(locale, topicHubs));

    for (const hub of topicHubs) {
      await writeTextFile(
        path.join(outputRoot, topicHubRelativePath(locale, hub.slug), "index.html"),
        renderTopicHubPage(locale, hub)
      );
    }

    await writeTextFile(path.join(outputRoot, timelineRelativePath(locale), "index.html"), renderTimelineRedirect(locale));
  }

  for (const article of liveArticles) {
    for (const locale of siteConfig.locales) {
      const markup = renderArticlePage(article, locale, liveArticles);
      await writeTextFile(path.join(outputRoot, article.outputPaths[locale]), markup);
      const headMarkup = markup.match(/<head>([\s\S]*?)<\/head>/)[1];
      const nodes = [...headMarkup.matchAll(/<meta\s[^>]*(?:name="(?:description|twitter:[^"]+)"|property="(?:og:|article:)[^"]+")[^>]*>|<link\s[^>]*(?:rel="canonical"|hreflang="[^"]+")[^>]*>|<script type="application\/ld\+json">[\s\S]*?<\/script>/g)].map((match) => match[0]).join("");
      await writeTextFile(path.join(outputRoot, "assets/articles", locale, `${article.sourceDirName}.json`), JSON.stringify({
        id: article.sourceDirName, locale,
        body: prepareArticleBody(article.bodies[locale]),
        head: { title: pageTitle(article.seo[locale].title, locale), nodes },
        html: renderReadingArticle(article, locale, liveArticles,{initial:true}),
        continuation: renderArticleContinuation(article, locale, liveArticles)
      }));
    }
  }

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

  pageSitemapEntries.push({
    path: topicIndexRelativePath("ja"),
    lastModified: latestUpdate,
    alternates: [
      { hreflang: "ja", path: topicIndexRelativePath("ja") },
      { hreflang: "en", path: topicIndexRelativePath("en") },
      { hreflang: "x-default", path: topicIndexRelativePath("ja") }
    ]
  });
  pageSitemapEntries.push({
    path: topicIndexRelativePath("en"),
    lastModified: latestUpdate,
    alternates: [
      { hreflang: "ja", path: topicIndexRelativePath("ja") },
      { hreflang: "en", path: topicIndexRelativePath("en") },
      { hreflang: "x-default", path: topicIndexRelativePath("ja") }
    ]
  });

  for (const hub of topicHubs) {
    pageSitemapEntries.push({
      path: topicHubRelativePath("ja", hub.slug),
      lastModified: hub.latestModified,
      alternates: [
        { hreflang: "ja", path: topicHubRelativePath("ja", hub.slug) },
        { hreflang: "en", path: topicHubRelativePath("en", hub.slug) },
        { hreflang: "x-default", path: topicHubRelativePath("ja", hub.slug) }
      ]
    });
    pageSitemapEntries.push({
      path: topicHubRelativePath("en", hub.slug),
      lastModified: hub.latestModified,
      alternates: [
        { hreflang: "ja", path: topicHubRelativePath("ja", hub.slug) },
        { hreflang: "en", path: topicHubRelativePath("en", hub.slug) },
        { hreflang: "x-default", path: topicHubRelativePath("ja", hub.slug) }
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
  await writeTextFile(path.join(outputRoot, feedRelativePath("ja")), renderFeed("ja", liveArticles, latestUpdate));
  await writeTextFile(path.join(outputRoot, feedRelativePath("en")), renderFeed("en", liveArticles, latestUpdate));
  await writeTextFile(path.join(outputRoot, "robots.txt"), renderRobots());
  await writeTextFile(path.join(outputRoot, "site.webmanifest"), renderWebManifest());
  if (siteConfig.cname) {
    await writeTextFile(path.join(outputRoot, "CNAME"), `${siteConfig.cname}\n`);
  }
  await writeTextFile(path.join(outputRoot, ".nojekyll"), "");
  await writeTextFile(path.join(outputRoot, "assets", "og-default.svg"), renderDefaultOgSvg());
  await buildSocialCardAsset();
  await buildSpatialAssets();
  await buildFaviconAssets();
}

buildSite().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
