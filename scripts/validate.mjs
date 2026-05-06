import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { loadArticles, publishedArticles } from "./lib/content.mjs";
import {
  absoluteUrl,
  localizedPath,
  siteConfig,
  topicHubRelativePath,
  topicIndexRelativePath,
  trustPageOrder,
  trustPagePaths
} from "./lib/site-config.mjs";
import { snippetLengthLimit, snippetTextLength } from "./lib/seo-snippets.mjs";
import { buildTopicHubs } from "./lib/topic-hubs.mjs";
import { renderIndexPage } from "./lib/render.mjs";
import { escapeHtml } from "./lib/utils.mjs";

const outputRoot = path.resolve("public");
function listingPagePaths(articles) {
  const totalPages = Math.max(1, Math.ceil(articles.length / siteConfig.pagination.articleListPageSize));
  const paths = [];

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
    paths.push(`page/${pageNumber}/index.html`, `en/page/${pageNumber}/index.html`);
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

function trustPageBuiltPaths() {
  return trustPageOrder.flatMap((pageId) => [trustPagePaths[pageId], `en/${trustPagePaths[pageId]}`]);
}

function topicBuiltPaths(topicHubs) {
  return [
    topicIndexRelativePath("ja"),
    topicIndexRelativePath("en"),
    ...topicHubs.flatMap((hub) => [topicHubRelativePath("ja", hub.slug), topicHubRelativePath("en", hub.slug)])
  ].map((page) => `${page}index.html`);
}

function assertContains(markup, expected, message) {
  if (!markup.includes(expected)) {
    throw new Error(message);
  }
}

function assertNotContains(markup, unexpected, message) {
  if (markup.includes(unexpected)) {
    throw new Error(message);
  }
}

function expectedPageTitle(title, locale) {
  if (title === siteConfig.name) {
    return locale === "ja" ? siteConfig.name : `${siteConfig.name} EN`;
  }

  return `${title} | ${siteConfig.name} ${locale === "ja" ? "" : "EN"}`.trim();
}

function collectSnippetErrors(articles) {
  const errors = [];

  for (const article of articles) {
    for (const locale of ["ja", "en"]) {
      const description = article.seo?.[locale]?.description ?? "";
      const teaser = article.seo?.[locale]?.teaser ?? "";
      const descriptionLimit = snippetLengthLimit("description", locale);
      const teaserLimit = snippetLengthLimit("teaser", locale);

      if (snippetTextLength(description) > descriptionLimit) {
        errors.push(
          `${article.sourceDirName}/meta.json: ${locale} description must stay within ${descriptionLimit} characters.`
        );
      }

      if (snippetTextLength(teaser) > teaserLimit) {
        errors.push(`${article.sourceDirName}/meta.json: ${locale} teaser must stay within ${teaserLimit} characters.`);
      }
    }
  }

  return errors;
}

function validateSingleArticleHomepageRender() {
  const singleArticle = {
    category: "AI Agents",
    date: "2026-05-01",
    outputPaths: {
      ja: "articles/single-homepage-boundary/index.html",
      en: "en/articles/single-homepage-boundary/index.html"
    },
    publishedSources: [
      {
        label: "Example source",
        description: "Synthetic validation source",
        url: "https://example.com/source"
      }
    ],
    seo: {
      ja: {
        teaser: "単一記事ホームの境界ケースを検証するための合成ティーザーです。"
      },
      en: {
        teaser: "A synthetic teaser for validating the single-article homepage boundary."
      }
    },
    tags: ["validation", "homepage"],
    titleJa: "単一記事ホームの検証",
    titleEn: "Single-article homepage validation"
  };
  const pagination = { currentPage: 1, totalPages: 1, totalArticles: 1, topicHubs: [] };
  const jaMarkup = renderIndexPage("ja", [singleArticle], pagination);
  const enMarkup = renderIndexPage("en", [singleArticle], pagination);

  assertContains(
    jaMarkup,
    'class="panel-block editorial-briefing home-featured-briefing"',
    "Japanese single-article homepage should still render the featured briefing."
  );
  assertContains(
    enMarkup,
    'class="panel-block editorial-briefing home-featured-briefing"',
    "English single-article homepage should still render the featured briefing."
  );
  assertNotContains(
    jaMarkup,
    "公開済みレポートはまだありません。",
    "Japanese single-article homepage should not render a false empty-state message."
  );
  assertNotContains(
    jaMarkup,
    'class="empty-state"',
    "Japanese single-article homepage should not render an empty-state container."
  );
  assertNotContains(
    enMarkup,
    "No published briefings yet.",
    "English single-article homepage should not render a false empty-state message."
  );
  assertNotContains(
    enMarkup,
    'class="empty-state"',
    "English single-article homepage should not render an empty-state container."
  );
  assertNotContains(
    jaMarkup,
    "表示範囲: 0-0 / 1",
    "Japanese single-article homepage should not render a 0-0 listing range."
  );
  assertNotContains(
    enMarkup,
    "Showing 0-0 of 1",
    "English single-article homepage should not render a 0-0 listing range."
  );
}

async function validateBuiltOutput(articles) {
  const topicHubs = buildTopicHubs(articles);
  const requiredPages = [
    "index.html",
    "en/index.html",
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
    .concat(listingPagePaths(articles))
    .concat(topicBuiltPaths(topicHubs))
    .concat(trustPageBuiltPaths());
  const unexpectedPages = ["feed.xml", "en/feed.xml", "archive/index.html", "en/archive/index.html"];

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

  const unexpected = [];

  for (const page of unexpectedPages) {
    if (await fileExists(path.join(outputRoot, page))) {
      unexpected.push(page);
    }
  }

  if (unexpected.length > 0) {
    throw new Error(`Built output still contains removed legacy files:\n- ${unexpected.join("\n- ")}`);
  }

  const homeHtml = await readBuiltFile("index.html");
  const enHomeHtml = await readBuiltFile("en/index.html");
  const robotsTxt = await readBuiltFile("robots.txt");
  const sitemapIndex = await readBuiltFile("sitemap.xml");
  const pageSitemap = await readBuiltFile("sitemap-pages.xml");
  const articleSitemap = await readBuiltFile("sitemap-articles.xml");
  const webManifest = await readBuiltFile("site.webmanifest");
  const jaAboutHtml = await readBuiltFile(trustPagePaths.about);
  const enAboutHtml = await readBuiltFile(`en/${trustPagePaths.about}`);
  const jaTopicsHtml = await readBuiltFile(`${topicIndexRelativePath("ja")}index.html`);
  const enTopicsHtml = await readBuiltFile(`${topicIndexRelativePath("en")}index.html`);
  const rootPath = siteConfig.basePath ? `${siteConfig.basePath}/` : "/";
  const totalPages = Math.max(1, Math.ceil(articles.length / siteConfig.pagination.articleListPageSize));

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
    assertNotContains(markup, 'type="application/atom+xml"', `${label} should not advertise a removed feed.`);
  }

  assertNotContains(homeHtml, `href="${localizedPath("ja", "archive/")}"`, "Japanese home page still links to the removed archive.");
  assertNotContains(enHomeHtml, `href="${localizedPath("en", "archive/")}"`, "English home page still links to the removed archive.");
  assertNotContains(homeHtml, `href="${localizedPath("ja", "feed.xml")}"`, "Japanese home page still links to the removed feed.");
  assertNotContains(enHomeHtml, `href="${localizedPath("en", "feed.xml")}"`, "English home page still links to the removed feed.");

  for (const [markup, relativePath, canonicalUrl, label] of [
    [jaAboutHtml, trustPagePaths.about, absoluteUrl(trustPagePaths.about), "Japanese about page"],
    [enAboutHtml, `en/${trustPagePaths.about}`, absoluteUrl(`en/${trustPagePaths.about}`), "English about page"],
    [jaTopicsHtml, topicIndexRelativePath("ja"), absoluteUrl(topicIndexRelativePath("ja")), "Japanese topics index"],
    [enTopicsHtml, topicIndexRelativePath("en"), absoluteUrl(topicIndexRelativePath("en")), "English topics index"]
  ]) {
    assertContains(markup, `rel="canonical" href="${canonicalUrl}"`, `${label} is missing the expected canonical URL.`);
    assertContains(markup, `property="og:url" content="${canonicalUrl}"`, `${label} is missing the expected og:url.`);
    assertContains(markup, 'hreflang="ja"', `${label} is missing the ja hreflang link.`);
    assertContains(markup, 'hreflang="en"', `${label} is missing the en hreflang link.`);
    assertContains(markup, "application/ld+json", `${label} is missing JSON-LD metadata.`);
    assertNotContains(markup, 'content="noindex', `${label} should not be noindex.`);
    assertContains(markup, `href="${absoluteUrl(relativePath)}"`, `${label} should contain its canonical URL in the markup.`);
  }

  for (const [markup, locale, label] of [
    [homeHtml, "ja", "Japanese home page"],
    [enHomeHtml, "en", "English home page"],
    [jaAboutHtml, "ja", "Japanese about page"],
    [enAboutHtml, "en", "English about page"],
    [jaTopicsHtml, "ja", "Japanese topics index"],
    [enTopicsHtml, "en", "English topics index"]
  ]) {
    for (const link of siteConfig.footerNav[locale]) {
      assertContains(markup, `href="${localizedPath(locale, link.path)}"`, `${label} is missing footer link ${link.path}.`);
    }
  }

  for (const [markup, locale, label] of [
    [homeHtml, "ja", "Japanese home page"],
    [enHomeHtml, "en", "English home page"]
  ]) {
    assertContains(
      markup,
      `href="${localizedPath(locale, "topics/")}"`,
      `${label} is missing a visible route into the topics section.`
    );
  }

  if (totalPages > 1) {
    const jaPageTwo = await readBuiltFile("page/2/index.html");
    const enPageTwo = await readBuiltFile("en/page/2/index.html");

    for (const [markup, canonicalUrl, label] of [
      [jaPageTwo, absoluteUrl("page/2/"), "Japanese page 2"],
      [enPageTwo, absoluteUrl("en/page/2/"), "English page 2"]
    ]) {
      assertContains(markup, `rel="canonical" href="${canonicalUrl}"`, `${label} is missing the expected canonical URL.`);
      assertContains(markup, `property="og:url" content="${canonicalUrl}"`, `${label} is missing the expected og:url.`);
      assertContains(markup, "application/ld+json", `${label} is missing JSON-LD metadata.`);
    }
  }

  const sampleArticle = articles[0];
  const sampleHub = topicHubs[0];

  if (sampleHub) {
    const jaHubPath = topicHubRelativePath("ja", sampleHub.slug);
    const enHubPath = topicHubRelativePath("en", sampleHub.slug);
    const jaHubHtml = await readBuiltFile(`${jaHubPath}index.html`);
    const enHubHtml = await readBuiltFile(`${enHubPath}index.html`);

    for (const [markup, relativePath, canonicalUrl, label] of [
      [jaHubHtml, jaHubPath, absoluteUrl(jaHubPath), "Japanese topic hub"],
      [enHubHtml, enHubPath, absoluteUrl(enHubPath), "English topic hub"]
    ]) {
      assertContains(markup, `rel="canonical" href="${canonicalUrl}"`, `${label} is missing the expected canonical URL.`);
      assertContains(markup, `property="og:url" content="${canonicalUrl}"`, `${label} is missing the expected og:url.`);
      assertContains(markup, 'hreflang="ja"', `${label} is missing the ja hreflang link.`);
      assertContains(markup, 'hreflang="en"', `${label} is missing the en hreflang link.`);
      assertContains(markup, "application/ld+json", `${label} is missing JSON-LD metadata.`);
      assertContains(markup, escapeHtml(sampleHub.category), `${label} is missing the hub category heading.`);
    }

    assertContains(
      pageSitemap,
      absoluteUrl(jaHubPath),
      "Page sitemap is missing the configured Japanese topic hub URL."
    );
    assertContains(
      pageSitemap,
      absoluteUrl(enHubPath),
      "Page sitemap is missing the configured English topic hub URL."
    );
    assertContains(
      pageSitemap,
      `hreflang="ja" href="${absoluteUrl(jaHubPath)}"`,
      "Page sitemap is missing the Japanese hreflang alternate for a topic hub."
    );
    assertContains(
      pageSitemap,
      `hreflang="en" href="${absoluteUrl(enHubPath)}"`,
      "Page sitemap is missing the English hreflang alternate for a topic hub."
    );
  }

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
      jaHtml,
      `<meta name="description" content="${escapeHtml(sampleArticle.seo.ja.description)}">`,
      "Japanese article is missing the resolved SEO description."
    );
    assertContains(
      enHtml,
      `<meta name="description" content="${escapeHtml(sampleArticle.seo.en.description)}">`,
      "English article is missing the resolved SEO description."
    );
    assertContains(
      homeHtml,
      `<section class="panel-block editorial-briefing home-featured-briefing">`,
      "Japanese home page is missing the featured briefing block."
    );
    assertContains(
      enHomeHtml,
      `<section class="panel-block editorial-briefing home-featured-briefing">`,
      "English home page is missing the featured briefing block."
    );
    assertContains(
      homeHtml,
      `<p class="editorial-briefing-copy">${escapeHtml(sampleArticle.seo.ja.teaser)}</p>`,
      "Japanese home page is missing the resolved teaser in the featured briefing."
    );
    assertContains(
      enHomeHtml,
      `<p class="editorial-briefing-copy">${escapeHtml(sampleArticle.seo.en.teaser)}</p>`,
      "English home page is missing the resolved teaser in the featured briefing."
    );
    assertNotContains(
      homeHtml,
      `class="article-card " href="${localizedPath("ja", sampleArticle.outputPaths.ja)}" aria-label="${escapeHtml(sampleArticle.titleJa)}"`,
      "Japanese home page should not repeat the featured article as a standard list card."
    );
    assertNotContains(
      enHomeHtml,
      `class="article-card " href="${localizedPath("en", sampleArticle.outputPaths.en.replace(/^en\//, ""))}" aria-label="${escapeHtml(sampleArticle.titleEn)}"`,
      "English home page should not repeat the featured article as a standard list card."
    );

    const articleHub = topicHubs.find((hub) => hub.category === sampleArticle.category);
    if (articleHub) {
      const jaHubHtml = await readBuiltFile(`${topicHubRelativePath("ja", articleHub.slug)}index.html`);
      const enHubHtml = await readBuiltFile(`${topicHubRelativePath("en", articleHub.slug)}index.html`);

      assertContains(
        jaHtml,
        `class="meta-pill is-accent article-topic-link" href="${localizedPath("ja", topicHubRelativePath("ja", articleHub.slug))}"`,
        "Japanese article is missing the topic hub category link."
      );
      assertContains(
        enHtml,
        `class="meta-pill is-accent article-topic-link" href="${localizedPath("en", topicHubRelativePath("en", articleHub.slug).replace(/^en\//, ""))}"`,
        "English article is missing the topic hub category link."
      );
      assertContains(jaHtml, 'class="panel-block topic-backlink"', "Japanese article is missing the topic backlink block.");
      assertContains(enHtml, 'class="panel-block topic-backlink"', "English article is missing the topic backlink block.");
      assertContains(jaHtml, 'class="panel-block briefing-summary"', "Japanese article is missing the briefing summary block.");
      assertContains(enHtml, 'class="panel-block briefing-summary"', "English article is missing the briefing summary block.");
      assertContains(
        jaHtml,
        `<p class="briefing-summary-copy">${escapeHtml(sampleArticle.seo.ja.teaser)}</p>`,
        "Japanese article is missing the resolved teaser in the briefing summary."
      );
      assertContains(
        enHtml,
        `<p class="briefing-summary-copy">${escapeHtml(sampleArticle.seo.en.teaser)}</p>`,
        "English article is missing the resolved teaser in the briefing summary."
      );
      assertContains(
        jaHubHtml,
        'class="panel-block editorial-briefing topic-featured-briefing"',
        "Japanese topic hub is missing the latest briefing editorial block."
      );
      assertContains(
        enHubHtml,
        'class="panel-block editorial-briefing topic-featured-briefing"',
        "English topic hub is missing the latest briefing editorial block."
      );
      assertContains(
        jaHubHtml,
        `<p class="editorial-briefing-copy">${escapeHtml(sampleArticle.seo.ja.teaser)}</p>`,
        "Japanese topic hub is missing the resolved teaser in the latest briefing block."
      );
      assertContains(
        enHubHtml,
        `<p class="editorial-briefing-copy">${escapeHtml(sampleArticle.seo.en.teaser)}</p>`,
        "English topic hub is missing the resolved teaser in the latest briefing block."
      );
      assertNotContains(
        jaHubHtml,
        `class="article-card " href="${localizedPath("ja", sampleArticle.outputPaths.ja)}" aria-label="${escapeHtml(sampleArticle.titleJa)}"`,
        "Japanese topic hub should not repeat the latest article as a standard list card."
      );
      assertNotContains(
        enHubHtml,
        `class="article-card " href="${localizedPath("en", sampleArticle.outputPaths.en.replace(/^en\//, ""))}" aria-label="${escapeHtml(sampleArticle.titleEn)}"`,
        "English topic hub should not repeat the latest article as a standard list card."
      );
    }

    const articleWithCustomSeoTitle = articles.find(
      (article) => article.seo.ja.title !== article.titleJa || article.seo.en.title !== article.titleEn
    );

    if (articleWithCustomSeoTitle) {
      const jaSeoHtml = await readBuiltFile(articleWithCustomSeoTitle.outputPaths.ja);
      const enSeoHtml = await readBuiltFile(articleWithCustomSeoTitle.outputPaths.en);

      assertContains(
        jaSeoHtml,
        `<title>${escapeHtml(expectedPageTitle(articleWithCustomSeoTitle.seo.ja.title, "ja"))}</title>`,
        "Japanese article is missing the custom SEO title in the document title."
      );
      assertContains(
        enSeoHtml,
        `<title>${escapeHtml(expectedPageTitle(articleWithCustomSeoTitle.seo.en.title, "en"))}</title>`,
        "English article is missing the custom SEO title in the document title."
      );
      assertContains(
        jaSeoHtml,
        `<meta property="og:title" content="${escapeHtml(expectedPageTitle(articleWithCustomSeoTitle.seo.ja.title, "ja"))}">`,
        "Japanese article is missing the custom SEO title in og:title."
      );
      assertContains(
        enSeoHtml,
        `<meta property="og:title" content="${escapeHtml(expectedPageTitle(articleWithCustomSeoTitle.seo.en.title, "en"))}">`,
        "English article is missing the custom SEO title in og:title."
      );
      assertContains(
        jaSeoHtml,
        `<meta name="twitter:title" content="${escapeHtml(expectedPageTitle(articleWithCustomSeoTitle.seo.ja.title, "ja"))}">`,
        "Japanese article is missing the custom SEO title in twitter:title."
      );
      assertContains(
        enSeoHtml,
        `<meta name="twitter:title" content="${escapeHtml(expectedPageTitle(articleWithCustomSeoTitle.seo.en.title, "en"))}">`,
        "English article is missing the custom SEO title in twitter:title."
      );
    }

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

  assertContains(robotsTxt, `Sitemap: ${absoluteUrl("sitemap.xml")}`, "robots.txt is missing the configured sitemap URL.");
  assertContains(sitemapIndex, absoluteUrl("sitemap-pages.xml"), "Sitemap index is missing the configured page sitemap URL.");
  assertContains(
    sitemapIndex,
    absoluteUrl("sitemap-articles.xml"),
    "Sitemap index is missing the configured article sitemap URL."
  );
  assertContains(pageSitemap, absoluteUrl(""), "Page sitemap is missing the configured Japanese home URL.");
  assertContains(pageSitemap, absoluteUrl("en/"), "Page sitemap is missing the configured English home URL.");
  assertContains(pageSitemap, absoluteUrl(topicIndexRelativePath("ja")), "Page sitemap is missing the Japanese topics index URL.");
  assertContains(pageSitemap, absoluteUrl(topicIndexRelativePath("en")), "Page sitemap is missing the English topics index URL.");
  assertContains(
    pageSitemap,
    `hreflang="ja" href="${absoluteUrl(topicIndexRelativePath("ja"))}"`,
    "Page sitemap is missing the Japanese hreflang alternate for the topics index."
  );
  assertContains(
    pageSitemap,
    `hreflang="en" href="${absoluteUrl(topicIndexRelativePath("en"))}"`,
    "Page sitemap is missing the English hreflang alternate for the topics index."
  );
  assertNotContains(pageSitemap, absoluteUrl("archive/"), "Page sitemap should not contain the removed archive URL.");
  assertNotContains(pageSitemap, absoluteUrl("en/archive/"), "Page sitemap should not contain the removed English archive URL.");
  for (const pageId of trustPageOrder) {
    assertContains(pageSitemap, absoluteUrl(trustPagePaths[pageId]), `Page sitemap is missing ${trustPagePaths[pageId]}.`);
    assertContains(
      pageSitemap,
      absoluteUrl(`en/${trustPagePaths[pageId]}`),
      `Page sitemap is missing en/${trustPagePaths[pageId]}.`
    );
  }
  if (totalPages > 1) {
    assertContains(pageSitemap, absoluteUrl("page/2/"), "Page sitemap is missing the configured Japanese page 2 URL.");
    assertContains(pageSitemap, absoluteUrl("en/page/2/"), "Page sitemap is missing the configured English page 2 URL.");
  }
  for (const hub of topicHubs) {
    assertContains(pageSitemap, absoluteUrl(topicHubRelativePath("ja", hub.slug)), `Page sitemap is missing topics/${hub.slug}/.`);
    assertContains(
      pageSitemap,
      absoluteUrl(topicHubRelativePath("en", hub.slug)),
      `Page sitemap is missing en/topics/${hub.slug}/.`
    );
  }
  assertContains(webManifest, `"start_url": "${rootPath}"`, "Web manifest start_url does not match the configured base path.");
  assertContains(webManifest, `"scope": "${rootPath}"`, "Web manifest scope does not match the configured base path.");
}

async function validate() {
  const { articles, errors } = await loadArticles();
  const snippetErrors = collectSnippetErrors(articles);

  if (errors.length > 0 || snippetErrors.length > 0) {
    throw new Error(`Content validation failed:\n- ${errors.concat(snippetErrors).join("\n- ")}`);
  }

  validateSingleArticleHomepageRender();

  if (await fileExists(outputRoot)) {
    await validateBuiltOutput(publishedArticles(articles));
  }
}

validate().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
