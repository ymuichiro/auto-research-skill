import path from "node:path";
import { mkdir } from "node:fs/promises";
import { loadArticles, publishedArticles } from "./lib/content.mjs";
import {
  renderArchivePage,
  renderArticlePage,
  renderAtomFeed,
  renderDefaultOgSvg,
  renderFaviconSvg,
  renderIndexPage,
  renderRobots,
  renderSitemap
} from "./lib/render.mjs";
import { writeTextFile } from "./lib/utils.mjs";

const outputRoot = path.resolve("public");

async function buildSite() {
  const { articles, errors } = await loadArticles();

  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n- ${errors.join("\n- ")}`);
  }

  const liveArticles = publishedArticles(articles);

  await mkdir(path.join(outputRoot, "assets"), { recursive: true });
  await mkdir(path.join(outputRoot, "archive"), { recursive: true });
  await mkdir(path.join(outputRoot, "en", "archive"), { recursive: true });

  await writeTextFile(path.join(outputRoot, "index.html"), renderIndexPage("ja", liveArticles));
  await writeTextFile(path.join(outputRoot, "archive", "index.html"), renderArchivePage("ja", liveArticles));
  await writeTextFile(path.join(outputRoot, "feed.xml"), renderAtomFeed("ja", liveArticles));

  await writeTextFile(path.join(outputRoot, "en", "index.html"), renderIndexPage("en", liveArticles));
  await writeTextFile(path.join(outputRoot, "en", "archive", "index.html"), renderArchivePage("en", liveArticles));
  await writeTextFile(path.join(outputRoot, "en", "feed.xml"), renderAtomFeed("en", liveArticles));

  for (const article of liveArticles) {
    await writeTextFile(path.join(outputRoot, article.outputPaths.ja), renderArticlePage(article, "ja"));
    await writeTextFile(path.join(outputRoot, article.outputPaths.en), renderArticlePage(article, "en"));
  }

  const latestUpdate = liveArticles[0]?.date ?? new Date().toISOString().slice(0, 10);
  const sitemapEntries = [
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
    },
    ...liveArticles.flatMap((article) => [
      {
        path: article.outputPaths.ja,
        lastModified: article.date,
        alternates: [
          { hreflang: "ja", path: article.outputPaths.ja },
          { hreflang: "en", path: article.outputPaths.en }
        ]
      },
      {
        path: article.outputPaths.en,
        lastModified: article.date,
        alternates: [
          { hreflang: "ja", path: article.outputPaths.ja },
          { hreflang: "en", path: article.outputPaths.en }
        ]
      }
    ])
  ];

  await writeTextFile(path.join(outputRoot, "sitemap.xml"), renderSitemap(sitemapEntries));
  await writeTextFile(path.join(outputRoot, "robots.txt"), renderRobots());
  await writeTextFile(path.join(outputRoot, ".nojekyll"), "");
  await writeTextFile(path.join(outputRoot, "404.html"), renderIndexPage("ja", liveArticles));
  await writeTextFile(path.join(outputRoot, "assets", "og-default.svg"), renderDefaultOgSvg());
  await writeTextFile(path.join(outputRoot, "assets", "favicon.svg"), renderFaviconSvg());
}

buildSite().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
