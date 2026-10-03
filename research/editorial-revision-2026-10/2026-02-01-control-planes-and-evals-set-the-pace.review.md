# 変更候補を判断する記事の改稿記録

## 問いと論証

対象日: 2026年2月1日。旧稿と現行日英/metaを通読。
問い: 新機能の改善と既存動作の後退が同時に起きた候補を、何を根拠に受け入れるか。
判断: 成果条件・採点・環境を対応付け、新機能の改善と維持条件を別に見る。失敗は候補の劣化、採点の不備、環境の違いを切り分ける。評価器や制限が備わることを全仕事の合格や更新速度の測定としない。
年次総括の委任範囲、次月のモデル以外の比較条件と区別し、変更候補の受入れ/保留/基準更新を中心にする。

| 論点 | 根拠・例 | 解釈・限界 |
| --- | --- | --- |
| 改善と回帰 | AnthJan9capability/regression、Descriptはvendor-reportedpractice | 合計点が異種失敗を隠す。導入速度因果を外す |
| 比較の単位 | task/trial/outcome; own support inquiry protocol | モデルだけでなく指示/ツール/基準/資料/環境の版を対応 |
| 成果と採点 | code/modelhuman calibration; own external ticket | 模型的説明の質と実際の状態を区別。採点も誤り得る |
| 原因を読む | Foundry immutable/varsbranch;Kit traces | 観測機能の範囲/提供段階を保持。図だけでは外部確定しない |
| 制限と品質 | AWSDec2gatewayPolicy enforcevslogonly;sampledevals | 役割金額許可≠顧客/注文/期限正しい。事前制限と品質の合否別 |
| 基準の更新 | own changedreturnpolicy and ambiguousrightanswer | 明示した業務規則で期待値を定める。良い失敗を無理に成功へ変えない |
| 実用受入れ | sameconditions/heldoutownproposal/humanreworkcost | 一回の成功/平均改善だけで受け入れない。評価維持コストも判断 |

## 調査

53件の同一実行の検証済み一次URLを再利用、AnthJan9を追加して54件。公開根拠5件（EV01、WF01、KIT01、YEAR01、SDK04）。歴史日付/固定版/提供段階を保持。抽象・metadata確認は全文読了に含めない。

## 検証

日英通読を行い、能力/回帰の役割、想定例、ベンダー紹介のDescript実例、版の比較、型/状態/説明の違い、採点の不備、業務規則更新と基準緩和の違いを照合した。業界全体の導入速度因果は主張しない。

JA3705字、EN8339字/1423語、両34段落8節。本文引用と公開根拠5件、日英URL一致。pnpm build exit0、git diff --check成功。CUAで日英1440x1000/390x844の本文・カード・引用を確認、横幅超過なし、双方向言語切り替え成功。screenshots/updates-ja-mobile.jpg、updates-en-desktop.jpg保存。数値は分量と構成の記録であって品質の採点ではない。

## 公開確認の残件

全36記事改稿後に日英72本文をデプロイ確認。
