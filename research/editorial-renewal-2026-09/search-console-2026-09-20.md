# Google Search Console 再評価（2026-09-20）

## 現在の判定

対象プロパティ `https://research.notelligent.app/` のページインデックスレポートを再確認した。レポートの最終更新日は2026-09-14で、登録済み0件、未登録102件。内訳は次のとおり。

- 検出 - インデックス未登録: 70件（初検出日 2026-09-05）
- クロール済み - インデックス未登録: 32件（初検出日 2026-04-25）

70件は改稿後の記事日英ページに相当する。32件にはホームページ、テーマページ、過去にクロールされた記事が含まれる。いずれも、今回の改稿後の再クロール結果として確定した件数ではない。Googleのレポートは9月14日で止まっており、9月19日以降の公開物をまだ反映していない。

## サイトマップ

Search Consoleで次のサイトマップを再送信・確認した。

- `/sitemap.xml`: 2026-09-19送信・最終読込、成功、検出54件
- `/sitemap-articles.xml`: 2026-09-19送信・最終読込、成功、検出70件
- `/sitemap-pages.xml`: 2026-08-23最終読込、成功、検出30件

記事サイトマップには日英70 URL、canonical と日英 hreflang の組み合わせが含まれる。

## URL検査と登録リクエスト

URL検査のライブテストを実行し、次の5 URLで「URLはGoogleに登録できます」「ページをインデックスに登録可能です」を確認した。robots.txtによる遮断、取得失敗、インデックス許可なし、canonical不一致はライブテストでは確認されなかった。

- `https://research.notelligent.app/`
- `https://research.notelligent.app/2026-08-12-beyond-ai-agents-hacw.html`
- `https://research.notelligent.app/en/2026-08-12-beyond-ai-agents-hacw.html`
- `https://research.notelligent.app/2025-01-01-agents-shift-to-measurable-systems.html`
- `https://research.notelligent.app/en/2025-01-01-agents-shift-to-measurable-systems.html`

5 URLすべてで「インデックス登録をリクエスト済み」「URLを優先クロール キューに追加しました」と表示された。リクエストは登録を保証するものではなく、Googleのクロールとインデックス処理を待つ状態である。

## 技術面の確認

- 公開URLはHTTP 200。
- robots.txtは全体を許可し、記事に `noindex` はない。
- 各日英記事にcanonical、日英 hreflang、NewsArticle JSON-LD、公開日、改稿日、著者情報がある。
- ローカル生成物と本番70ページを照合済み。本文、メタ情報、canonical、hreflang、構造化データにエラーはない。
- 内部リンク・画像・スクリプト・スタイル参照3,978件に参照切れはない。
- Search Consoleの「手動による対策」は「問題は検出されませんでした」。
- Search Consoleの「セキュリティの問題」も「問題は検出されませんでした」。

## 判断と次の確認

現時点では、改稿後の記事をGoogleがまだ全体的に再クロールしていないことが主因であり、サイト側のクロール禁止や取得不能は確認されていない。Googleの公式説明どおり、サイトマップ送信と代表URLの登録リクエストを済ませたうえで、数日から数週間後にページインデックスレポートとURL検査を再確認する。登録数が増えない場合は、最新の「クロール済み - インデックス未登録」URLを再検査し、Googleが選択したcanonical、本文の独自性、サイト内リンク、手動対策・セキュリティレポートを追加確認する。

検索結果への掲載や順位上昇は、登録リクエスト受付やライブテスト成功だけでは保証されない。今回の確認では、技術的に登録可能な公開状態と、Google側の処理待ちを分けて記録した。
