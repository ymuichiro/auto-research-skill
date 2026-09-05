# 共通表示とSEO

2026-09-05: 重複していた冒頭の要約枠を削除し、編集方針の説明を本文後へ移動。本文は最大54rem、スマートフォンでも16px/行高1.95。本文引用は下線と色、キーボードフォーカスを付け、箇条書きマーカーを復元。

検証: pnpm build PASS。ローカルブラウザ390pxで日英本文16px、scrollWidth=390、横溢れなし。1280pxで本文864px、scrollWidth=1280。日本語本文をスクリーンショットでも確認。viewportリセット済み。

SEOの方針: 意味のあるタイトル/説明、主張直後の根拠、実際の改稿日、既存URLと日英相互参照を維持。更新日はgitに基づき、本番ビルドで反映。登録や順位上昇をビルド成功と混同しない。
参考: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
参考: https://developers.google.com/search/docs/appearance/structured-data/article

残り: 全記事改稿後のcanonical/hreflang/構造化データ/サイトマップ/リンク総合検査、公開CSS反映、Search Consoleの利用可否と現在の状態確認。
