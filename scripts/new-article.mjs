import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    parsed[token.slice(2)] = argv[index + 1];
    index += 1;
  }

  return parsed;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const date = args.date;
  const slug = args.slug;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Pass --date YYYY-MM-DD.");
  }

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Pass --slug in lowercase kebab-case.");
  }

  const articleDir = path.resolve("content/articles", `${date}-${slug}`);
  await mkdir(articleDir, { recursive: false });

  const meta = {
    slug,
    date,
    titleJa: "日本語タイトルを記入",
    titleEn: "Add English title",
    summaryJa: "日本語要約を記入",
    summaryEn: "Add English summary",
    category: "AI Strategy",
    tags: ["LLM", "AI Agent"],
    publishedSources: [
      {
        label: "Add official documentation or paper URL",
        url: "https://example.com",
        type: "official"
      }
    ],
    draft: true
  };

  await writeFile(path.join(articleDir, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`, "utf8");
  await writeFile(
    path.join(articleDir, "body.ja.html"),
    `<section class="report-section">
  <p class="section-kicker">Overview</p>
  <h2>論点を記入</h2>
  <p>本文の下書きをここに追加します。</p>
</section>
`,
    "utf8"
  );
  await writeFile(
    path.join(articleDir, "body.en.html"),
    `<section class="report-section">
  <p class="section-kicker">Overview</p>
  <h2>Add the key question</h2>
  <p>Add the English draft body here.</p>
</section>
`,
    "utf8"
  );

  console.log(`Created ${articleDir}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
