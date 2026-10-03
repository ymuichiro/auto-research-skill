# 音声エージェントの記事の改稿記録

## 問いと論証

対象日2026年4月6日。旧稿/現行の日英/metaを通読。
問い: 言い直しや割り込みを受けても、利用者が聞いた案内と、希望した日時と、実際に保存した予約を一致させるには何を比較するか。
判断: 声の自然さ/待ち時間と同じ通話内で、訂正、音声再生、外部処理、切断/人への引継ぎを確認する。便利な入出力を業務完了へ接続し、人が説明を繰り返す負担まで評価する。
旧稿の四社/方式/音声基盤/電話接続/言語地域/セッション/シミュレーションの幅を回復。chainedなら監査/安全保証、nativeなら全用途低遅延、モデル能力より状態が常に重要、全社で同じ音声/地域仕様という未測定断定は復活させない。

| 論点 | 根拠 | 解釈/想定 |
| --- | --- | --- |
| 訂正と保存 | 予約変更中の「別の日」の想定 | 案内と保存を同じ希望へ合わせる。トラブルを事例として捏造しない |
| 方式 | OpenAIMar20STT/TTS vs Aug28Realtime;MSoverviewfixed | native/chainの内部と統合APIを区別。transcript≠正確さ/録音聞いた証拠 |
| 自然な会話 | Google3.1FlashLiveMar26developerpreview | 新モデルを対象日に取り込む。ベンダー改善/デモは当業務完了率の証明ではない |
| 音を止める | fixedGenAIschema content + oldconsole hook/player | 再生待ちを消す責務。schemaのtool cancellationが副作用undoを保証しない |
| 実行 | Microsoftfixedfunction intro/matchingcall_id selectedsample | 提案/要求/保存/結果不明と確認内容の版を同じ操作へつなぐ |
| 入口 | OpenAIAug28SIP;ConnectMar17TTS/18S2S distinct | アプリ/電話回線と声の対応地域・言語を別に検査 |
| 継続 | fixedSDKresumablefalse potentialloss | 再接続≠保存再実行。本人を声の流暢さで同定しない。履歴最小必要情報 |
| 試験 | ConnectFeb2CI/regression | 分岐simulationと実機回線騒音、保存結果/発話一致を分けて比較 |

## 調査

24一次URL。14音声固有、10は同一実行で確認した運用/評価背景の明示再使用。Google/MicrosoftはApril6前のSHA固定。GenAI SDKはLiveServerContent/ToolCallCancellation/SessionResumption/GoAway等の該当classのみ確認し全巨大fileを全文読了としない。Microsoftfunction guide2439行は導入と該当Python/JSmethodのみ、未実行。旧Googleconsoledefault2.0を現3.1対応のproofとしない。Google3.1March26developerpreviewを現在のlivingguideで補強したふりをしない。

## 検証

原典の対象箇所と照合し、日英本文を改稿後に全文通読。音声方式の比較、プレビュー/GA、割り込みと再生停止、ツール取消と副作用の回復、再接続と業務保存、TTSとspeech-to-speechの地域差、想定試験と実測の区別を確認。引用9URLが日英/metaで一致。JA4477字、EN1630語、各32段落9節。pnpm buildとgit diff --check成功。日英それぞれ1440x1000/390x844で本文、比較カード、公開根拠を実際に表示確認、双方向の言語切替も成功。両幅で横溢れなし。保存画像voice-ja-mobile.jpg/voice-en-desktop.jpg。

## 公開確認の残件

全36日英セット改稿後に公開確認。
