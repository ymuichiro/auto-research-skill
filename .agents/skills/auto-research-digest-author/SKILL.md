---
name: auto-research-digest-author
description: Research, write, and update Auto Research Digest articles about LLM, AI, and AI agents for this repository. Use this whenever the user asks to investigate the latest AI or agent trends, gather official docs or papers, expand an article in content/articles/, create a new bilingual research briefing, publish an infographic-style HTML report for this site, or create retrospective snapshot articles. Always browse for current information, collect at least 20 primary-source URLs before publishing a new or substantially revised article, keep public evidence limited to official docs, official announcements, and papers, update both Japanese and English article files plus meta.json, and preserve the weekly publishing cadence without lowering the evidence bar.
compatibility: Requires repo write access, shell commands, and web research.
---

# Auto Research Digest Author

Use this skill for the repository at `/Users/you/github/ymuichiro/auto-research-skill`.

## Read First

Before writing, read these files:

- `/Users/you/github/ymuichiro/auto-research-skill/guidelines/information-sourcing-policy.md`
- `/Users/you/github/ymuichiro/auto-research-skill/guidelines/editorial-expression-guideline.md`
- `/Users/you/github/ymuichiro/auto-research-skill/guidelines/design-system.md`
- `/Users/you/github/ymuichiro/auto-research-skill/.agents/skills/auto-research-digest-author/references/workflow.md`

When updating an existing article, also read that article's `meta.json`, `body.ja.html`, and `body.en.html`.

## Default Workflow

1. Identify whether you are updating an existing article or creating a new one.
2. If this is part of the weekly publishing cadence, decide early whether the piece should be:
   - a focused weekly article on one theme, or
   - a weekly roundup that bundles 2 to 4 converging signals
3. For new or time-sensitive topics, browse the web first. Do not rely on memory for "latest" questions.
4. Start broad to map the topic, then narrow to official documentation and papers for anything that will appear in the public article.
5. Build a research inventory of at least 20 primary-source URLs before publishing a new article or substantially rewriting an existing one.
6. For retrospective or backfilled articles, use only sources that were publicly available on or before the article date.
7. Write or revise all three article files together:
   - `meta.json`
   - `body.ja.html`
   - `body.en.html`
8. Run `pnpm build` after edits. Use `pnpm validate` if you need a separate validation pass.
9. If the user wants the change published, commit, push, watch GitHub Actions, and verify the public page.

## Weekly Publishing Rules

- The default operating cadence is one public article per week.
- Weekly cadence does not relax the evidence bar. New weekly articles still need a 20+ primary-source inventory.
- If one weekly topic is too thin to clear the quality bar, broaden it into a weekly roundup rather than publishing a shallow single-theme piece.
- Weekly roundups should still have a clear thesis, not a loose list of headlines.
- For weekly articles, treat the article date as the publication-date snapshot and use only primary sources that were public on or before that date.
- If a week does not have enough verified primary material for publication, prefer delaying or reframing the piece over padding with third-party coverage.

## Source Rules

- Public evidence must be limited to official documentation, vendor-published announcement / release / launch / product update pages, or papers.
- `publishedSources` must never include news sites, blogs, social posts, recap articles, or other third-party copyrighted articles.
- You may use broader sources for discovery, but do not surface them in the article body as public evidence and do not add them to `publishedSources`.
- If a claim is materially time-sensitive, verify it against the current official page or paper page before publishing.
- For retrospective articles, verify that every cited official page or paper existed on or before the article date.

## Writing Rules

- Keep the tone neutral and evidence-led.
- Distinguish clearly between fact, observed pattern, and inference.
- Avoid thin articles. Compare and synthesize sources; do not merely list them.
- Always include concrete use cases or operating scenarios so the article is not purely conceptual.
- Keep Japanese and English versions aligned in meaning and confidence level.
- In Japanese copy, prefer natural Japanese for general concepts and workflow terms. Keep English only when it is the product name, paper title, protocol name, API name, or another identifier that would become less clear if translated.
- Before finalizing Japanese copy, do one cleanup pass specifically for language mixing. Replace avoidable English nouns and adjective phrases such as workflow, control surface, progress, deliverable, or chat-only when clear Japanese equivalents exist.
- If an English technical term is important and likely familiar in the source material, either translate it into Japanese or use a brief first-use pairing such as `日本語（English term）`, then stay consistent.
- For retrospective or backfilled articles, write as if the piece were published on that article date. Avoid wording that exposes hindsight or backfill status, such as "その時点では", "at the time", or "viewed from".
- Do not expose internal workflow language such as "配信契約", internal audience notes, or repo-only operating details on public pages.
- Do not introduce audience-label wording such as "経営層向け", "エグゼクティブ", or "executive" into public pages unless the user explicitly asks for it.
- For layout and styling, rely on the shared template and shared CSS. Do not add page-specific CSS for ordinary article additions.
- New article content should inherit the shared design system automatically. Only add new shared semantic blocks when the existing classes are not enough.

## Title Rules

- Do not let article titles converge on one repeated ending pattern across consecutive weeks.
- Before finalizing a title, check the latest 2 to 4 published articles and avoid reusing the same Japanese ending pattern or the same English framing if it already appeared repeatedly.
- In particular, avoid chaining too many titles that end with forms such as `〜し始めた`, `〜へ移り始めた`, `is shifting`, `are shifting`, `is becoming`, or `are becoming`.
- When the core idea is similar, vary the title structure on purpose. Alternate between patterns such as:
  - `Xの主戦場はYにある`
  - `Xを比較する軸はYになった`
  - `なぜ今週XはYとして読むべきか`
  - `Xを支える条件はYである`
  - `X now competes as Y`
  - `The real comparison axis for X is now Y`
  - `Why X should now be read as Y`
- Favor titles that state the changed comparison axis, operating constraint, or decision surface, rather than relying on vague momentum wording.
- If a draft title feels too close in cadence or ending to the previous few articles, rewrite it even if the wording is technically correct.

## Minimum Article Depth

Unless the user explicitly asks for a shorter format, aim to cover:

- What changed and why it matters now
- What the papers and official docs jointly indicate
- Concrete use-case archetypes
- Concrete operational scenarios or workflow examples
- Design, evaluation, and governance implications
- A short takeaway

If the article still reads like an outline, add specifics:

- named benchmarks, platforms, or official products
- task examples with tools, approvals, and failure boundaries
- comparisons across vendors or research tracks
- implications for rollout, cost, evaluation, or oversight

For retrospective monthly series, also make sure each article answers:

- what was already visible by that month
- which signals were still early versus already converging
- what concrete workflows were realistic at that time

For the normal weekly cadence, also make sure each article answers:

- why this specific week changed the story
- whether the article is a focused theme or a roundup and why
- which workflows became more realistic that week
- what remains too early or too weak to state confidently

## File Contract

- Article files live in `content/articles/<YYYY-MM-DD>-<slug>/`.
- Required files:
  - `meta.json`
  - `body.ja.html`
  - `body.en.html`
- Output pages are generated to:
  - `public/YYYY-MM-DD-slug.html`
  - `public/en/YYYY-MM-DD-slug.html`
- New article content should fit the shared design system automatically. Only add new reusable semantic blocks when the existing shared classes are insufficient.

For exact commands, file fields, and publish steps, read `/Users/you/github/ymuichiro/auto-research-skill/.agents/skills/auto-research-digest-author/references/workflow.md`.

## Commands

- Create a draft: `pnpm new:article --date YYYY-MM-DD --slug topic-slug`
- Build and validate: `pnpm build`
- Validate only: `pnpm validate`

## Example Triggers

- "最新の AI Agent 動向を調べて新規記事を書いて"
- "この既存記事を一次情報で厚くして"
- "OpenAI / Google / Microsoft の公式 docs と論文を調べて中立的にまとめて"
- "このトピックを Auto Research Digest の記事として公開して"
