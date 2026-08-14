---
name: auto-research-digest-author
description: Research, write, and update evidence-led Auto Research Digest articles about LLM, AI, and AI agents in this repository. Use for current-trend research, official-doc or paper collection, bilingual article creation or revision, infographic-style HTML reports, retrospective snapshots, and publication. Build one explicit thesis from primary evidence, support major claims with concrete sourced cases, use clearly labeled scenarios only to explain supported mechanisms, preserve the author's reasoned interpretation, and keep every section connected to that thesis. Browse for current information, collect at least 20 primary-source URLs as a research gate rather than a coverage quota, update Japanese and English article files plus meta.json, and preserve the evidence and publication contracts.
---

# Auto Research Digest Author

Use this skill for the repository at `/Users/you/github/ymuichiro/auto-research-skill`.

## Read First

Before writing, read these files:

- `/Users/you/github/ymuichiro/auto-research-skill/guidelines/information-sourcing-policy.md`
- `/Users/you/github/ymuichiro/auto-research-skill/guidelines/editorial-expression-guideline.md`
- `/Users/you/github/ymuichiro/auto-research-skill/guidelines/design-system.md`
- `/Users/you/github/ymuichiro/auto-research-skill/.agents/skills/auto-research-digest-author/references/workflow.md`
- `/Users/you/github/ymuichiro/auto-research-skill/.agents/skills/write-concrete-coherent-prose/SKILL.md`
- `/Users/you/github/ymuichiro/auto-research-skill/.agents/skills/japanese-tech-writing/SKILL.md`

Read `/Users/you/github/ymuichiro/auto-research-skill/.agents/skills/cognitive-rhythm-writing/SKILL.md` only after the claims, evidence, examples, and section order are stable. Rhythm must not create new claims or filler.

When updating an existing article, also read that article's `meta.json`, `body.ja.html`, and `body.en.html`.

## Default Workflow

1. Identify whether you are updating an existing article or creating a new one.
2. If this is part of the weekly publishing cadence, decide early whether the piece should be:
   - a focused weekly article on one theme, or
   - a weekly roundup that bundles 2 to 4 converging signals
3. For new or time-sensitive topics, browse the web first. Do not rely on memory for "latest" questions.
4. Start broad to map the topic, then narrow to official documentation and papers for anything that will appear in the public article.
5. Build a research inventory of at least 20 primary-source URLs before publishing a new article or substantially rewriting an existing one.
6. Write an argument map before choosing sections: one central question, one thesis, the claims needed to establish it, the strongest evidence and concrete case for each claim, the author's interpretation, and credible limits or counterevidence.
7. Remove sources and topics that do not advance the argument. The research inventory is not a requirement to mention every source in public copy.
8. For retrospective or backfilled articles, use only sources that were publicly available on or before the article date.
9. Write or revise all three article files together:
   - `meta.json`
   - `body.ja.html`
   - `body.en.html`
10. Run `pnpm build` after edits. Use `pnpm validate` if you need a separate validation pass.
11. If the user wants the change published, commit, push, watch GitHub Actions, and verify the public page.

## Weekly Publishing Rules

- The default operating cadence is one public article per week.
- Weekly cadence does not relax the evidence bar. New weekly articles still need a 20+ primary-source inventory.
- If one weekly topic is too thin, delay or reframe it. Use a roundup only when 2 to 4 signals already support one shared thesis; do not broaden the scope merely to reach a source count.
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

- Remain independent of vendor interests and evidence-led. Neutrality does not mean removing the article's conclusion.
- Distinguish clearly between verified fact, observed pattern, inference, recommendation, and unresolved question.
- State the article's thesis as the author's traceable interpretation of the evidence. Do not limit the article to claims that one source states verbatim.
- Build each major claim as a chain: verified fact or case, relevant comparison, interpretation, practical implication, and limit. Not every paragraph needs all five parts, but the chain must be visible before the topic changes.
- Compare and synthesize the strongest sources. Do not list sources, vendors, or features merely because they are in the research inventory.
- Prefer a sourced implementation, measured case, named product behavior, or paper result over a generic use case. When a hypothetical operating scenario is useful, label it as a scenario and state exactly what it illustrates; never present it as deployed evidence.
- Keep causal and operational details that explain why systems differ, even for business readers. Remove only details that do not affect the decision or argument.
- Give each section one job in the argument. Its opening must receive a question or claim from the preceding section, and its ending must change what the reader can conclude.
- Apply `write-concrete-coherent-prose` before the final language cleanup. Reject undefined umbrella nouns, floating sentences, generic claims that fit any technology, and examples that prove nothing.
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
- Make the subject, observable change, and affected decision or work explicit. A reader must understand the title without reconstructing undefined terms such as `state`, `scope`, `surface`, `layer`, or `axis` from the article.
- Do not force titles into reusable rhetorical templates. Varying cadence is secondary to naming the actual change accurately.
- Reject a title that could describe several unrelated technologies after replacing the product or concept name.
- If a title feels too close to recent titles, rewrite it only when the alternative remains equally concrete and accurate.

## Argument Completeness

Do not treat the following as mandatory sections. Select only the elements needed to establish the thesis:

- What changed and why it matters now
- What the papers and official docs jointly indicate
- Concrete sourced implementations, product behavior, paper results, or clearly labeled operating scenarios
- Design, evaluation, and governance implications
- Limits, counterevidence, or conditions under which the thesis does not hold
- A takeaway derived from the preceding argument

If the article reads like an outline, do not automatically add more sections. First merge repeated claims, remove checklist-only sections, and replace general statements with evidence that performs a clear role:

- named benchmarks, platforms, or official products
- task examples with tools, approvals, and failure boundaries
- comparisons across vendors or research tracks
- implications for rollout, cost, evaluation, or oversight

A concrete scenario does not substitute for evidence. Use it to explain a mechanism already supported by sources, and label it when it is hypothetical.

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
- "OpenAI / Google / Microsoft の公式 docs と論文を比較し、根拠から導ける判断が見える記事にして"
- "このトピックを Auto Research Digest の記事として公開して"
