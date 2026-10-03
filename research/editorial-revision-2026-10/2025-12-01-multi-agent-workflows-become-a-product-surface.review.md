# Foundry複数エージェントの記事の改稿記録

## 問いと論証

対象日: 2025年12月1日。旧稿、現行日英本文、metaを読んだ。
問い: 複数エージェントの間で値を渡すとき、次の担当はその値を何として信用してよいか。
判断: 値の形と、申請由来の値、照合済みの事実、推定、実際の承認を分ける。受け渡しの根拠と未解決条件を明示し、後段が前段の推定を確定済みと読まない構成を作る。
11月稿の製品全体の変更照合から、工程間の意味と根拠を受け渡す問いへ進む。旧稿の図/YAML/変数/schema/条件の具体性を回復し、可視化だけで安全/全体監査/承認を保証する断定を外す。

| 論点 | 根拠と例 | 判断・限界 |
| --- | --- | --- |
| 手順を読める製品機能 | Foundry Nov25 publicpreview synchronized visual/YAML/localvariables/Schema/PowerFx/version | 定義可能な経路と実行事実は別。主語を製品全体普及へ広げない |
| 形と意味 | JSONSchema2020-12 June2022 validation/format annotation | schemavalidでも部署不存在、社員の取り違え。format必ず検査とはしない、Foundrydialect不明 |
| 引継ぎで失う情報 | 著者アカウント申請、曖昧な部署、推測した期限 | request/extracted/verified/candidates/missing/authority/versionの区別は提案で製品既定でない |
| 記録で工程を調べる | Foundrytracing分岐変数、initialindividualagentsfocus | 記録は選択の理由を調べる資料、入力事実や外部完了は別照合 |
| 動的計画 | MagenticOnev1 TaskLedger facts/guesses/plan vsProgressLedger | replanning研究と固定業務経路の比較。性能順位/同実装/人承認機能証明でない |
| 共通の誤り | 著者不確実値が2担当を通り確認済みになる例 | 同じ初期誤りを共有すれば人数増でも独立検証でない |
| 実行と承認 | 著者管理者記録/roleexpirybind/外部directoryresult | 文字列approved/Booleanだけを管理者承認としない。すべての役割にモデル必須とはしない |

## 調査

同一実行50件を再利用、FoundryとJSONSchema2件追加で52一次URL。MagenticOneのv1必要節をHTMLで読み直して既存absURLを同論文HTMLへ置換（別論文として水増ししない）。公開根拠3件。
JSONSchemaは構造とformatの必要部分を読み、全文を読んだとはしない。FoundryはNov25公開プレビュー本文、後日関連リンク除外。採用dialect/外部全状態の可観測性は未確認。

## 検証

日英8節33段落、本文と公開3根拠の出典集合が一致。日本語3,785字（基準稿2,296字）、英語8,000字・1,376語（基準稿5,201字）。見出し・カードを含む空白除外の記述値で、SEOの最低量ではない。
原典と日英を通読し、Foundry公開プレビューの提供範囲、図/YAML、変数、条件、版と初期観測の限定を照合。JSONSchema formatの注釈と検査を区別し、Foundryの採用版・設定は未確定として書く。MagenticOnev1の二種の記録・再計画とFoundryを同実装/性能比較としない。申請者・原文候補・照合・管理者承認・登録結果の区別、三か月閲覧から無期限編集への変更は著者想定として日英で対応。人数による独立確認を保証しない。
`pnpm build`と`git diff --check`通過。日英各1440×1000と390×844の本文、比較カード、公開根拠を目視し、横はみ出しなし。双方向言語切り替えも通過。代表画像screenshots/workflow-ja-mobile.jpgとworkflow-en-desktop.jpg。
ステータス: local_verified。公開確認は未実施。

## 公開確認の残件

全36記事改稿後にデプロイし、日英72公開本文を確認する。
