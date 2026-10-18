# 時間と記事を手繰る操作プロトタイプ

タイムライン → 月の記事 → 本文の章 → 関連記事 → 別の記事本文までを、同じ作業面で操作する試作です。本番のテンプレート・配信設定には接続していません。

## 起動

リポジトリーのルートで実行します。

```sh
rtk proxy node prototypes/spatial-reader/build.mjs
rtk proxy node prototypes/spatial-reader/serve.mjs
```

- 実寸: http://localhost:4174/
- デスクトップ・スマートフォンの表示枠を切り替えて確認: http://localhost:4174/review.html

`review.html` の表示枠はブラウザー内の iframe です。スマートフォン実機のブラウザーやタッチ入力を再現するものではありません。実際の端末では実寸のページを開きます。現状のサーバーは同じコンピューターからの接続に限定しています。

## 操作

- ホイール・トラックパッド・縦スワイプで月や記事を手繰ります。画面全体を固定し、スクロール位置から面の移動・折りたたみ量を決めています。途中で止める、逆方向へ戻す操作にも追従します。
- 月の「記事を見る」で、その月の候補が展開します。記事の「本文を読む」で、選んだ記事の面が読み物になります。
- 本文は一章ずつ開きます。長い章は本文領域内で通常どおりスクロールできます。次の章の見出し、または「目次」から章を選びます。
- 「関連記事」で現在の記事を残したまま分岐します。関係の表示は、既存の記事のテーマ・調査対象日・タグから生成します。意味に関する新しい推定データではありません。
- ブラウザーの戻る・画面の「戻る」で文脈を戻します。閲覧中の章を保持します。
- 選択画面の矢印キーで候補を移動し、ページ本体にフォーカスがあるときの Enter で開けます。Tab と Enter でも各ボタンを操作でき、Escape で戻れます。
- OS / ブラウザーの「視差効果を減らす」設定ではアニメーションを停止し、同じ操作を維持します。

## データと設計上の境界

公開済みの日本語記事 40 件、調査対象月 22 件を収録しています。`build.mjs` が既存の記事と公開出典だけから `data.js` を生成します。調査対象月は記事の公開日と同じ意味ではありません。記事の文章・図表は既存の原稿です。

各記事に DOM の面を一つだけ用意し、候補・本文・関連候補で同じ面を使います。装飾目的で記事の見出しを背景に複製しません。本文中のリンクと出典は公開済みの参照先を別タブで開きます。Noto Sans JP は Google Fonts から読み込み、接続できない場合は端末のサンセリフへフォールバックします。

## 検証

サーバーを起動し、既存の Playwright 依存関係・ブラウザーを使用します。

```sh
rtk proxy node prototypes/spatial-reader/verify.mjs
rtk proxy node prototypes/spatial-reader/verify-accessibility.mjs
rtk proxy node prototypes/spatial-reader/verify-corpus.mjs
rtk proxy node prototypes/spatial-reader/verify-rendering.mjs
rtk proxy node prototypes/spatial-reader/verify-startup.mjs
```

証拠は `output/spatial-reader/` に保存します。`verify.mjs` は実際にブラウザーを起動し、ホイール、Chromium のタッチ入力エミュレーション、タップ、WebKit のキーボードとタップ、停止・巻き戻し、章、関連記事、履歴を検証し、画面と動画を記録します。WebKit のモバイル設定では Playwright のホイール入力が利用できないため、時系列移動と本文スクロールにはキーボードを使います。スマートフォン実機・本番での検証結果ではありません。

`verify-accessibility.mjs` はキーボード操作・動きを抑える設定・リサイズ・JavaScript 無効時のリンクを、`verify-corpus.mjs` は全記事・全章の本文領域が表示可能かを確認します。`verify-rendering.mjs` は Noto Sans JP の読み込み、既存の比較図の表示、ローカルブラウザーでのフレーム間隔を確認します。これらはアクセシビリティ全体の適合認証、端末性能の保証、全ての図表の実機確認を意味しません。

`verify-startup.mjs` は外部フォントの通信を切り分け、Chromium / WebKit の各4タブでローカルのHTML・データ・スクリプトを同時に初回読み込みします。確認用サーバーは Node.js の標準HTTPサーバーを使い、開発中のキャッシュを無効にしています。
