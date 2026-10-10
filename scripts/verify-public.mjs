import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { siteConfig } from "./lib/site-config.mjs";

// Compare the deployed bytes with this checkout's built output, not just HTTP 200.
// This verifies publication. It does not verify Google's indexing or ranking.
const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1];
}
const base = new URL(option("--base-url", siteConfig.siteUrl));
const attempts = Number(option("--attempts", "1"));
const delay = Number(option("--delay-ms", "20000"));
const output = option("--output", "output/public-verification.json");
if (!Number.isInteger(attempts) || attempts < 1 || attempts > 15 || !Number.isFinite(delay) || delay < 0 || delay > 60000) {
  throw new Error("Invalid retry options.");
}
const sitemapPaths = ["sitemap.xml", "sitemap-pages.xml", "sitemap-articles.xml"];
const sitemaps = await Promise.all(sitemapPaths.map((file) => readFile(path.join("public", file), "utf8")));
const pages = [...new Set(sitemaps.slice(1).flatMap((xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])))];
const paths = [...pages.map((url) => new URL(url).pathname.slice(new URL(siteConfig.siteUrl).pathname.length)), ...sitemapPaths,
  "robots.txt", "favicon.ico", "assets/favicon.ico", "assets/og-twitter-card.png", siteConfig.ogImage, "assets/site.css", "assets/article-share.js"];
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
let report;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const results = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < paths.length) {
      const relativePath = paths[cursor++];
      const file = relativePath === "" || relativePath.endsWith("/") ? `${relativePath}index.html` : relativePath;
      const url = new URL(relativePath, base).toString();
      try {
        const expected = await readFile(path.join("public", file));
        const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: "manual" });
        const bytes = Buffer.from(await response.arrayBuffer());
        const actual = digest(bytes);
        const expectedHash = digest(expected);
        results.push({ url, status: response.status, bytes: bytes.length, sha256: actual, expected_sha256: expectedHash,
          ok: response.status === 200 && actual === expectedHash });
      } catch (error) {
        results.push({ url, ok: false, error: error.message });
      }
    }
  }));
  report = { checked_at: new Date().toISOString(), base_url: base.toString(), attempt, page_count: pages.length,
    check_count: results.length, passed: results.every((item) => item.ok),
    evidence_boundary: "Public delivery and exact built bytes only; not Google indexing or ranking.", results };
  console.log(`Public verification ${attempt}/${attempts}: ${results.filter((item) => item.ok).length}/${results.length} match.`);
  if (report.passed || attempt === attempts) break;
  await new Promise((resolve) => setTimeout(resolve, delay));
}
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
if (!report.passed) {
  console.error(JSON.stringify(report.results.filter((item) => !item.ok).map(({ url, status, error }) => ({ url, status, error }))));
  process.exitCode = 1;
}
