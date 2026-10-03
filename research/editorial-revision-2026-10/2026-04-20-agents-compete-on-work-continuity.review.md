# 仕事の継続性の記事の改稿記録

## 問いと判断
対象日2026年4月20日。旧稿と現行の日英/meta全文を確認。
問い: 一度止めた調査を翌日に任せ直すとき、モデルにも人にも何を渡せば、判断をやり直しすぎず、変わった事実を取りこぼさず続けられるか。
判断: 会話、実行環境、成果物、過去の学び、現在の確認を結び付ける。保存と再読と更新を分け、採用済みの判断にも根拠と再確認条件を付ける。能力のあるモデルが必要なことは維持し、継続基盤で補える範囲を過大にしない。
旧稿の四社、仕事の複数層、定期実行と復旧の違い、人への引継ぎと負担比較を回復。全製品が同じ継続性、memory=最新事実、schedule=自律的完成、log=ファイル全復旧、SDK=外部exactly-onceを復活させない。

| 節 | 主張と原典 | 著者の解釈/限界 |
| --- | --- | --- |
| 導入 | 比較表の未確認行と翌日の資料変更を置く想定例 | 引継ぎを「続きから」とだけ依頼すると欠ける判断を示す |
| 利用体験 | CodexApr16 thread reuse/automation/memory preview | 毎週新しい問いと一件の未完作業を区別 |
| 保存 | ManagedApr8 session/harness/sandbox | logとモデル文脈、環境recipeと過去生成fileを区別 |
| 実装 | SDKApr15 + pinned guidebeta/session/snapshot | live resumeとfresh restore、mount/noop保存の限界 |
| 記録 | ADK state/session/artifacts pinned | 永続backend/managed events、返却版をprogressへ紐付け、atomicity非保証 |
| 判断 | 五つの独自確認カード | product standardではない、保存先五つを強制しない |
| 記憶 | pinned SDK memory | folder保存/再読、古い情報と変わらない条件を区別 |
| 外部 | 送信成功記録前停止の想定 + idempotency背景 | 不明は失敗と違う、相手記録照合。保存だけでrollback/一度だけ保証なし |
| 評価 | AWSMar31 sample/CI, 本稿の停止位置試験 | 稼働trace≠採用結果、未実施の比較提案である |
| 結び | 引継ぎと修正負担 | 工具数や記憶量でなく適切な残件判断を比べる |

## 調査
21一次URL。9件の新規確認と12件の同一実行で確認済み背景を明示再使用。公開引用は論証に使う8件とする（ADK sessionはstate説明の背景）。更新docsはcutoff以前SHAを固定。原典の全編通読/実行をしていないファイルは選択箇所を記録。SDK発表の利用可能とguideのbeta注記を同じ安定性の断定にせず明記する。

## 検証
原典と改稿後の日英全文を照合・通読。JA4610字/EN1653語、各36段落10節、引用8URLが日英/metaで一致。SDKのbetaと利用可能発表、resumeとsnapshot、外部操作の不明と失敗、学びと変動事実、版と進捗の非同時確定を確認。pnpm build/diff --check成功。日英1440x1000/390x844の本文・カード・公開根拠と双方向言語切替を確認、横溢れなし。continuity-ja-mobile.jpg/continuity-en-desktop.jpg保存。

## 公開確認
全36日英セットが済んだ後に実施。
