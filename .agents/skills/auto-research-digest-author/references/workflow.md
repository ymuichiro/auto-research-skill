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

Optional metadata for the public generator:

- `seoTitleJa` / `seoTitleEn` for shorter `<title>` and social titles when the editorial title is too long
- `seoDescriptionJa` / `seoDescriptionEn` for search and social description copy
- `teaserJa` / `teaserEn` for article cards and listing surfaces

Keep `titleJa` / `titleEn` as the article H1 and `summaryJa` / `summaryEn` as the editorial deck. Use the optional SEO fields only when a shorter public snippet is materially better.

`publishedSources` rules:

- show only official documentation, vendor-published announcement / release / launch / product update pages, or papers
- each item needs `label`, `url`, `type`
- `type` must be `official` or `paper`
- do not include news articles, blogs, recap pages, or other third-party copyrighted material

## 3. Research workflow

1. Clarify the article target:
   - update an existing article
   - create a new article
   - refresh a public article and redeploy
   - decide whether the weekly piece is a focused article or a roundup
2. For unstable topics, browse first.
3. Use broad discovery to identify themes and likely official sources.
4. Build a research inventory of 20 or more primary-source URLs before publishing a new article or substantial rewrite.
5. Treat the inventory as a research gate, not a public coverage quota. Rank sources by the claim they support and discard sources that add no new evidence, comparison, counterexample, or limit.
6. Narrow public evidence to sources you can verify directly.
7. If a source cannot be verified on its official page or paper page, exclude it from `publishedSources`.
8. For retrospective articles, only use sources that were publicly available on or before the article date.
9. For weekly publication, do not lower the quality bar to hit cadence. Use a roundup only when 2 to 4 signals converge on one thesis; source count alone is not a reason to widen scope.

Good official-source buckets:

- vendor docs: OpenAI, Anthropic, Google, Microsoft, AWS, standards bodies
- vendor announcement, release, launch, and product update pages on official domains
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

Before drafting, write an argument map containing:

- the question the article answers
- the article's one-sentence thesis
- the 3 to 5 claims needed to establish it
- the strongest primary evidence and concrete case for each claim
- the comparison or mechanism that connects the evidence to the claim
- the author's interpretation and its confidence level
- credible counterevidence, limits, and unresolved questions

Choose sections only after the argument map is complete. Evidence patterns, vendor comparisons, use cases, scenarios, governance implications, and takeaways are possible section roles, not a required template. Delete or merge any section that does not change the reader's answer to the central question.

For weekly pieces, prefer this decision rule:

- use a focused weekly article when one theme alone has enough verified primary material and concrete workflow implications
- use a roundup when several smaller signals jointly explain the week better than any single topic
- do not publish a thin single-topic article just to satisfy cadence

Depth rules:

- compare sources instead of listing them
- state the author's evidence-grounded conclusion instead of ending at source summary
- include sourced implementations, product behaviors, measured cases, or paper results where available
- label hypothetical scenarios and state what mechanism they illustrate
- connect every section to the previous question or claim; a connective word alone is not a logical bridge
- keep operational detail needed to understand actor, action, condition, evidence, and outcome
- mention approval boundaries, tool access, or operational constraints where relevant
- keep Japanese and English versions aligned in meaning
- avoid exposing repo-internal policy wording in public copy
- for retrospective month-start snapshots, write from the perspective of what was knowable at that time
- for retrospective or backfilled public articles, keep the narration in publication-day voice rather than hindsight voice
- for weekly posts, write from the perspective of what was knowable by that publication date

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
- retrospective articles only cite sources available by the article date
- `publishedSources` contains only official docs, official announcement / release pages, or papers
- the article has specific use cases and concrete scenarios
- the source inventory did not dictate the article structure and irrelevant sources were omitted from the narrative
- every major claim has evidence, a concrete case or mechanism, the author's interpretation, and an explicit limit where one exists
- hypothetical scenarios are labeled and are not presented as deployed implementations
- replacing the subject with an unrelated technology makes the central claims fail; otherwise the prose is too generic
- every section advances the central question and the article reads like a coherent argument, not a source dump or checklist
- `pnpm build` succeeds
- if published, GitHub Actions deploy succeeds
