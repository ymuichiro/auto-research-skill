# Auto Research Digest Workflow

## 1. Canonical repo files

Read these first when the skill triggers:

- `/Users/you/github/ymuichiro/auto-research-skill/guidelines/information-sourcing-policy.md`
- `/Users/you/github/ymuichiro/auto-research-skill/guidelines/editorial-expression-guideline.md`
- `/Users/you/github/ymuichiro/auto-research-skill/scripts/new-article.mjs`
- `/Users/you/github/ymuichiro/auto-research-skill/package.json`
- `/Users/you/github/ymuichiro/auto-research-skill/scripts/lib/site-config.mjs`

## 2. Article contract

Each article lives in:

- `content/articles/<YYYY-MM-DD>-<slug>/meta.json`
- `content/articles/<YYYY-MM-DD>-<slug>/body.ja.html`
- `content/articles/<YYYY-MM-DD>-<slug>/body.en.html`

`meta.json` must include:

- `slug`
- `date`
- `titleJa`
- `titleEn`
- `summaryJa`
- `summaryEn`
- `category`
- `tags`
- `publishedSources`
- `draft`

`publishedSources` rules:

- show only official documentation or papers
- each item needs `label`, `url`, `type`
- `type` must be `official` or `paper`
- do not include news articles, blogs, recap pages, or other third-party copyrighted material

## 3. Research workflow

1. Clarify the article target:
   - update an existing article
   - create a new article
   - refresh a public article and redeploy
2. For unstable topics, browse first.
3. Use broad discovery to identify themes and likely official sources.
4. Build a research inventory of 20 or more official-doc or paper URLs before publishing a new article or substantial rewrite.
5. Narrow public evidence to sources you can verify directly.
6. If a source cannot be verified on its official page or paper page, exclude it from `publishedSources`.

Good official-source buckets:

- vendor docs: OpenAI, Anthropic, Google, Microsoft, AWS, standards bodies
- paper pages: arXiv, conference proceedings, official lab or university paper pages
- official repos only when they are clearly the primary source for the claim

Discovery-only sources:

- news sites
- blogs
- social posts
- commentary newsletters
- recap threads

Do not quote or cite discovery-only sources in the public evidence list.

## 4. Writing workflow

Update `meta.json`, `body.ja.html`, and `body.en.html` together.

For substantial pieces, prefer a structure like:

1. signal snapshot or top-line thesis
2. research shift or evidence pattern
3. platform convergence or vendor comparison
4. use-case archetypes
5. concrete scenarios
6. design, evaluation, and governance implications
7. executive takeaway

Depth rules:

- compare sources instead of listing them
- include concrete workflow examples, not only abstractions
- mention approval boundaries, tool access, or operational constraints where relevant
- keep Japanese and English versions aligned in meaning
- avoid exposing repo-internal policy wording in public copy

## 5. Build and verification

Core commands:

- `pnpm new:article --date YYYY-MM-DD --slug topic-slug`
- `pnpm build`
- `pnpm validate`

Useful checks:

- inspect the generated page in `public/`
- confirm new sections or keywords with `rg`
- verify the root page and article page after deploy with `curl`

## 6. Publish workflow

If the user wants publication:

1. `git status --short`
2. `git add ...`
3. `git commit -m "..."` with a clear summary
4. `git push origin main`
5. `gh run list -R ymuichiro/auto-research-skill -L 5`
6. `gh run watch -R ymuichiro/auto-research-skill <run-id> --exit-status`
7. verify the public page at `https://ymuichiro.github.io/auto-research-skill/`

## 7. Quality bar

Before you stop, check:

- official-doc or paper inventory reached 20 or more URLs for a new or heavily revised article
- `publishedSources` contains only official docs or papers
- the article has specific use cases and concrete scenarios
- the article reads like an executive briefing, not a source dump
- `pnpm build` succeeds
- if published, GitHub Actions deploy succeeds
