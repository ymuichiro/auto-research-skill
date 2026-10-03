# サブエージェントの記事の改稿記録

## 問いと論証

2026年3月30日までの公表資料を対象とする。旧稿/現行の日英本文とmetaを通読。
問い: AIへ仕事を分けて渡すとき、どの分担なら、人が最終判断できる結果までの仕事を改善できるか。
判断: 担当数ではなく、自律して調べられる範囲、入力/返却根拠、統合条件、再開時の結果を一単位として設計する。小型モデル/並列化/文脈分離/順序制御/履歴と処理記録は別の選択。
旧稿のOpenAI/Anthropic/Google/Microsoft/AWSの機構の幅を回復する。全社が今週新たに収束、必ず速く安く安全、役割名だけで認可分離、セッションだけで耐障害性という断定を復活させない。

| 論点 | 根拠 | 解釈と想定例 |
| --- | --- | --- |
| 統合が残る | 三製品の法人/無料/旧版比較の想定 | 三つの完成報告だけで比較完成にはならない |
| モデル選択 | March17 mini/nano positioning | Codex miniとAPI nano区別。単価と総量・並列速度は別 |
| 自律の範囲 | Independent research vs known sequential repair | 必要ならツール並列だけでもよい、すべての工程をagent化しない |
| 文脈 | Claude Agent SDK isolated windows/relevant returns | 根拠、条件、未確認事項を落とさず限定。全資料複写と要約だけの両方を避ける |
| 順序と振分け | 固定ADK index/code, AWS supervisor vs routing | 既知の順序をモデルが毎回発明する必要なし、順序保証は内容保証ではない |
| 続き | 固定Microsoft session serialization and separate checkpoint sample | 履歴/処理記録を分ける。in-memory exampleはprocessrestartのproofではない |
| 人と権限 | 調査のみ/個別結果/統合が想定 | 共通出典の多数決は裏付け増ではない。書込・最終判断の担当を実装で絞る |
| 比較試験 | Anthropic token usage vs chats & dependencies | 単一担当と同じ品質条件、総予算/時間条件を別に報告、統合修正・遅い担当・再試行・人の負担を含む |

## 調査

26一次URL。20は同一実行で原典を確認済みの背景を明示して再使用。6追加はdated announcement/pinned March30 snapshotsを直接確認。Googleの並列文書の状態分離の表現を、session stateへ異なるoutput_keyを入れる実例で補い、全面的な状態隔離とは説明しない。Microsoftのセッションsample前文にあるcheckpoint/resumeは、実装を別checkpoint sampleまで見てin-memoryであることを限定。コード未実行。全論文の全文読了や公開根拠26件を主張しない。

## 検証

日英全文の通読、原典の該当記述との照合、本文の全URLとpublic sourceの一致を確認。JA4306字（旧1739字）、EN1628語/9650字（旧3605字）、各32段落/9節/8本文引用。字数は充足確認の補助であり品質/SEOの証明ではない。

pnpm build（clean/site/CSS/validate）成功、git diff --check成功。実ブラウザーで日英各1440×1000/390×844の本文、比較カード、公開根拠を目視。横スクロールなし、日英の往復切替を確認。screenshots/subagents-ja-mobile.jpg と subagents-en-desktop.jpg を保存。

## 公開確認の残件

全36日英セット改稿後に公開確認。
