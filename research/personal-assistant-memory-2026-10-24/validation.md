# 下書きの確認結果

対象：2026-10-24-personal-assistant-memory-and-agent-coordination。
記事は `draft: true`。公開日時は未設定。コミット、push、公開作業はしていない。

- PASS：通常モードの `rtk proxy pnpm build`。公開対象の検証と画像検証まで成功。下書きは通常の公開対象から除外される。
- PASS：`rtk proxy pnpm verify:illustrations`。49点の異なる登録画像の寸法、ハッシュ、サイズ、日英の割り当て、SSRを確認。新記事の挿絵は1200×800 WebP、26,148 bytes。
- PASS：`rtk proxy pnpm test:illustrations`。ChromiumとWebKit、1440pxと390px、日英を含む4組で各98チェック、合計392チェック。結果は `qa/illustration-browser-results.json`。
- PASS：`rtk proxy node research/personal-assistant-memory-2026-10-24/qa.mjs`。ChromiumとWebKit、360/390/768/1440px、日英の16条件。下書きのnoindex、図2点、SVG文字の範囲、11px以上の表示文字サイズ、横方向のはみ出し、ページエラーを確認。結果は `qa/browser-results.json`。
- PASS：日英とも7節、説明図2点、同じ順序の論文リンク8件。本文リンクが全て `publishedSources` に登録されていること、一次資料候補が23件であること、本文とメタデータの読み込みエラーがないことを確認。
- PASS：`rtk proxy git diff --check`。
- PASS：挿絵を原寸と360×240の縮小表示で確認。図解を390pxの実描画で確認。SVGの矢印を外部参照なしの図形にして、読書画面でのID書き換えの影響を避けた。
- NOT_RUN：実端末での表示確認、人間の介入回数や時間削減の測定、dotの実タスク操作、内部メモリの実装調査、本番配信の確認。

## プレビュー

ローカル表示：`http://127.0.0.1:4177/2026-10-24-personal-assistant-memory-and-agent-coordination.html`。
`PREVIEW_ARTICLE=2026-10-24-personal-assistant-memory-and-agent-coordination pnpm build:site` により明示的に下書きを含め、既存の共通CSSとローカルサーバーで表示している。

最初に下書きプレビューへ通常の `pnpm build` を適用すると、公開用の検証がプレビューのnoindexを拒否した。共通の検証を変更せず、通常ビルドを別途成功させた後、プレビュー生成と専用の表示検査を分けて実施した。
既存の `package.json` の変更と、以前から存在する作業ファイルは維持した。

## 図版の記録

説明図：本文内のSVG。生成元は `diagrams.mjs`、日英の単独SVGは `diagrams/`。
挿絵：組み込み `image_gen` で新規生成し、対象を3タスクに整理する編集を1回実施。プロンプトと編集指示は `image-generation.json`。元PNGを本調査フォルダーへ保存し、WebPと正しいSHA-256を共通マニフェストに登録した。
