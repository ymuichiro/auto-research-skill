---
name: auto-research-digest-author
description: Research, write, and update Auto Research Digest articles about LLM, AI, and AI agents for this repository. Use this whenever the user asks to investigate the latest AI or agent trends, gather official docs or papers, expand an article in content/articles/, create a new bilingual executive briefing, or publish an infographic-style HTML report for this site. Always browse for current information, collect at least 20 official-doc or paper URLs before publishing a new or substantially revised article, keep public evidence limited to official docs and papers, and update both Japanese and English article files plus meta.json.
compatibility: Requires repo write access, shell commands, and web research.
---

# Auto Research Digest Author

Use this skill for the repository at `/Users/you/github/ymuichiro/auto-research-skill`.

## Read First

Before writing, read these files:

- `/Users/you/github/ymuichiro/auto-research-skill/guidelines/information-sourcing-policy.md`
- `/Users/you/github/ymuichiro/auto-research-skill/guidelines/editorial-expression-guideline.md`
- `/Users/you/github/ymuichiro/auto-research-skill/.agents/skills/auto-research-digest-author/references/workflow.md`

When updating an existing article, also read that article's `meta.json`, `body.ja.html`, and `body.en.html`.

## Default Workflow

1. Identify whether you are updating an existing article or creating a new one.
2. For new or time-sensitive topics, browse the web first. Do not rely on memory for "latest" questions.
3. Start broad to map the topic, then narrow to official documentation and papers for anything that will appear in the public article.
4. Build a research inventory of at least 20 official-doc or paper URLs before publishing a new article or substantially rewriting an existing one.
5. Write or revise all three article files together:
   - `meta.json`
   - `body.ja.html`
   - `body.en.html`
6. Run `pnpm build` after edits. Use `pnpm validate` if you need a separate validation pass.
7. If the user wants the change published, commit, push, watch GitHub Actions, and verify the public page.

## Source Rules

- Public evidence must be limited to official documentation or papers.
- `publishedSources` must never include news sites, blogs, social posts, recap articles, or other third-party copyrighted articles.
- You may use broader sources for discovery, but do not surface them in the article body as public evidence and do not add them to `publishedSources`.
- If a claim is materially time-sensitive, verify it against the current official page or paper page before publishing.

## Writing Rules

- Write for executives and business decision-makers, not only for engineers.
- Keep the tone neutral and evidence-led.
- Distinguish clearly between fact, observed pattern, and inference.
- Avoid thin articles. Compare and synthesize sources; do not merely list them.
- Always include concrete use cases or operating scenarios so the article is not purely conceptual.
- Keep Japanese and English versions aligned in meaning and confidence level.
- Do not expose internal workflow language such as "配信契約", internal audience notes, or repo-only operating details on public pages.

## Minimum Article Depth

Unless the user explicitly asks for a shorter format, aim to cover:

- What changed and why it matters now
- What the papers and official docs jointly indicate
- Concrete use-case archetypes
- Concrete operational scenarios or workflow examples
- Design, evaluation, and governance implications
- A short executive takeaway

If the article still reads like an outline, add specifics:

- named benchmarks, platforms, or official products
- task examples with tools, approvals, and failure boundaries
- comparisons across vendors or research tracks
- implications for rollout, cost, evaluation, or oversight

## File Contract

- Article files live in `content/articles/<YYYY-MM-DD>-<slug>/`.
- Required files:
  - `meta.json`
  - `body.ja.html`
  - `body.en.html`
- Output pages are generated to:
  - `public/YYYY-MM-DD-slug.html`
  - `public/en/YYYY-MM-DD-slug.html`

For exact commands, file fields, and publish steps, read `/Users/you/github/ymuichiro/auto-research-skill/.agents/skills/auto-research-digest-author/references/workflow.md`.

## Commands

- Create a draft: `pnpm new:article --date YYYY-MM-DD --slug topic-slug`
- Build and validate: `pnpm build`
- Validate only: `pnpm validate`

## Example Triggers

- "最新の AI Agent 動向を調べて新規記事を書いて"
- "この既存記事を一次情報で厚くして"
- "OpenAI / Google / Microsoft の公式 docs と論文を調べて経営層向けにまとめて"
- "このトピックを Auto Research Digest の記事として公開して"
