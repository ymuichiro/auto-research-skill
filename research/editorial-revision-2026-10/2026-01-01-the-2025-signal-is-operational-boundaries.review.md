# 2025年総括の記事の改稿記録

## 問いと論証

対象日: 2026年1月1日。旧稿、現行日英本文、metaを読んだ。
問い: 2025年にエージェントを使う仕事のどの部分が組み立てやすくなり、任せる判断に何が残ったか。
判断: 操作、接続、反復、開発・確認の部品が具体化した。部品の能力や通信の完了から仕事の完了を判定せず、実際の成果物の条件と、人が調べ直す負担を含めて任せる範囲を段階的に決める。
年次総括として複数局面を回復。業界全体がモデル競争から運用へ移った/狭い仕事なら必ず速いという旧稿の断定を外す。12月稿の型と意味の受け渡し、11月稿の製品変更より広い、一年の異なる進展とその連結を論じる。

| 論点 | 根拠と実例 | 判断・限界 |
| --- | --- | --- |
| 操作の道具 | OperatorJan23 researchpreview/form/CUAtakeover | 画面操作範囲。機微な入力は人引継ぎ/確認。全業務成功でない |
| 接続の共通化 | A2AApr9 discoverytaskartifact;MCPJune18tool | agent間とtooldataを区別、通信と意味/権限/業務完了を分ける |
| 表現と反復 | GPT5Aug7plaintextcustomtools;SDKSep29files/gather-act-verify | モデルの能力と実行部品双方。モデル軽視へ結ばず、必要条件で評価 |
| 作成と変更の確認 | KitOct6visual/versions/trace;FoundryNov25schema/variables/preview | 正常な経路≠正しい成果物、beta/GAの区別、Foundry観測限定 |
| 外部の制御 | AgentCoreDec2Policy/Evalspreview/enforce-vslog-only/roleamount<200 | 入力条件を強制することと、商品/請求書/資格の正しさは別。March2026GAは除外 |
| 調査報告の範囲 | 著者比較レポート想定、根拠収集→下書き→公開 | 三段階ごとに成果条件/取得失敗/根拠/確認負担を分ける。全製品組合せ推奨でない |
| 任せる範囲を広げる判断 | 著者同条件baseline/失敗種/確認時間/停止 | ベンダー機能や狭い課題から全業務成功率を出さない。全部を追加する必要なし |

## 調査

同一実行52一次URLを再利用し、AgentCore Dec2を1件追加、53件。公開根拠8件。2025年末の資料から読む総括として、6月移管+9月SDK+11月Foundryだけの狭い要約を広げる。
Operatorは2025年1月の本文、A2Aは4月の構想/仕様、MCPは2025-06-18固定、GPT5は8月公式、AgentKitは10月本文（June2026更新除外）、Foundryは11月publicpreview、AgentCoreは12月originalpreview。モデルや製品間の性能順位を作らない。

## 検証

日英通読で、年次の広がりと各機能の役割、想定例、著者の解釈を照合。A2Aの草案、AgentKitの部品ごとの提供段階、Foundryの観測範囲、AgentCoreのpreviewと強制/記録のみを区別した。モデル競争終了、普及率、全仕事成功率、狭い仕事なら必ず速いという断定をしない。

本文引用8件と公開根拠、日英URLは一致。JA4074字、EN9153字/1585語、両37段落8節。数値は構成の確認であって品質判定ではない。pnpm build成功（exit0）、git diff --check成功。

CUA実表示: JA/EN1440x1000と390x844で本文・比較カード・公開根拠を確認し、横幅超過なし。実リンクでJA→EN→JAを確認。screenshots/annual-ja-mobile.jpg、annual-en-desktop.jpg保存。

## 公開確認の残件

全36記事改稿後にデプロイし、日英72公開本文を確認する。
