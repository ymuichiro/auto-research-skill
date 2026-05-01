# Auto Research Digest

`Auto Research Digest` は、LLM、AI、AI Agent の技術動向、導入論点、実務ユースケースを、一次情報ベースでまとめて公開する静的サイトです。

公開サイト:

- [https://research.notelligent.app/](https://research.notelligent.app/)
- 移行前 URL: [https://ymuichiro.github.io/auto-research-skill/](https://ymuichiro.github.io/auto-research-skill/)

## 目的

- 公式ドキュメント、公式 announcement / release、論文を根拠に、中立的な記事を継続公開する
- 記事を日本語 / 英語の両方で生成し、GitHub Pages + custom domain で配信する
- shared template と shared CSS を使い、記事追加時にページ個別のデザイン調整を不要にする

## 運用方針

- 通常運用は週 1 本の公開を基本とする
- 新規記事や大幅改稿では、20 件以上の一次情報 URL を収集してから執筆する
- `publishedSources` には、公式ドキュメント、ベンダー公式 announcement / release / launch / product update、論文のみを載せる
- ニュースサイト、ブログ、SNS、第三者著作物は探索に使えても公開根拠には載せない
- 週次で単独テーマが薄い場合は、2 から 4 個の収束したシグナルを束ねた roundup に切り替える
- 遡及記事では、その記事日付以前に公開された一次情報のみを使う

## リポジトリ構成

- `content/articles/`
  記事ソース。各記事は `meta.json`、`body.ja.html`、`body.en.html` を持つ
- `codex/rules/`
  Codex が週次記事作成と公開確認で使うコマンド許可ルール
- `guidelines/`
  情報収集、表現、デザインの運用ルール
- `scripts/`
  サイト生成、検証、新規記事作成用スクリプト
- `src/styles/`
  shared CSS
- `public/`
  ビルド生成物
- `.agents/skills/auto-research-digest-author/`
  この repo 専用の執筆スキル

## 記事契約

各記事ディレクトリ:

- `content/articles/<YYYY-MM-DD>-<slug>/meta.json`
- `content/articles/<YYYY-MM-DD>-<slug>/body.ja.html`
- `content/articles/<YYYY-MM-DD>-<slug>/body.en.html`

出力先:

- `public/YYYY-MM-DD-slug.html`
- `public/en/YYYY-MM-DD-slug.html`

## 開発コマンド

```bash
pnpm install
pnpm new:article --date YYYY-MM-DD --slug topic-slug
pnpm build
pnpm validate
pnpm dev
```

## Codex ルール

- `codex/rules/weekly-digest.rules`
  週次記事の作成、検証、ブランチ作成、push、Actions 確認、公開確認で使うコマンド prefix を許可する
- `codex/rules/safety.rules`
  `rm -rf`、`git reset`、`git clean`、`git commit --amend`、force push など週次運用で不要な破壊的操作を禁止する
- ルール追加・更新後は Codex を再起動する
- 動作確認には `codex execpolicy check --pretty --rules codex/rules/weekly-digest.rules --rules codex/rules/safety.rules -- <command>` を使う

## 執筆時に先に読むもの

- [guidelines/information-sourcing-policy.md](/Users/you/github/ymuichiro/auto-research-skill/guidelines/information-sourcing-policy.md)
- [guidelines/editorial-expression-guideline.md](/Users/you/github/ymuichiro/auto-research-skill/guidelines/editorial-expression-guideline.md)
- [guidelines/design-system.md](/Users/you/github/ymuichiro/auto-research-skill/guidelines/design-system.md)
- [.agents/skills/auto-research-digest-author/SKILL.md](/Users/you/github/ymuichiro/auto-research-skill/.agents/skills/auto-research-digest-author/SKILL.md)

## 公開フロー

1. 一次情報を収集し、公開根拠を確定する
2. `meta.json`、`body.ja.html`、`body.en.html` を更新する
3. `pnpm build` と `pnpm validate` を通す
4. GitHub に push し、Actions で `gh-pages` を更新して [https://research.notelligent.app/](https://research.notelligent.app/) へ反映する

## Custom Domain Cutover

1. 前日までに `research.notelligent.app` の DNS TTL を短縮する
2. GitHub Pages の custom domain を `research.notelligent.app` に設定する
3. DNS に `research.notelligent.app CNAME ymuichiro.github.io` を反映する
4. `main` へ反映して deploy を流し、`gh-pages` 上の `CNAME` と SEO 系生成物を新ドメインに揃える
5. GitHub Pages の証明書発行後に `Enforce HTTPS` を有効化する
6. `https://research.notelligent.app/`、`/en/`、`/page/2/`（生成される場合）、代表記事、`/sitemap.xml`、`/robots.txt`、`/site.webmanifest` を確認する

ロールバック:

1. GitHub Pages の custom domain を外す
2. DNS の `research` CNAME を削除する
3. `SITE_URL` を旧 URL に戻した版を再 deploy する

## 補足

- shared design system に乗る前提なので、通常の記事追加で page-specific CSS は不要
- URL や公開根拠の監査は、記事更新時にも再実施する
