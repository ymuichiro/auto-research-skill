# 動画生成AIの記事の改稿記録

## 問いと論証

対象日2026年3月28日。旧稿/現行の日英/metaを通読。
問い: 一度良い映像が出た後、商品の姿や人物の動きを保って依頼された箇所を直し、制作物へ組み込むにはどの機能を比較するか。
判断: 見栄えの比較に加え、変える部分と保持する部分を指定し、修正・音声・編集引渡し・提供継続まで確かめる。最良サンプルより採用可能な修正版までの仕事を判断単位にする。
旧稿の5社/生成・参照・時間的一貫性/音声/既存映像修正/編集/来歴/総作業の幅を回復。用途ごとの製品優劣、全モデル同機能、diffusionだから修正容易、全自動より補助が成功しやすいという実測のない断定は回復しない。

| 論点 | 根拠と想定例 | 解釈と限界 |
| --- | --- | --- |
| 依頼と修正 | 商品3カット、背景だけ変更の想定 | 作者/編集者/確認者が何を保ちたいかを先に明示 |
| 生成と時間 | Sora2024spacetime/diffusion;Gen4.5因果/物体制約 | 内部生成工程と制作での部分修正は別。全製品同方式とは言わない |
| 同じ被写体 | Gen4references、Gen4.5Jan21firstframe | 参照と文字/寸法等の保証は別、版と操作を固定 |
| 音と画面比 | Veo3.1Oct15experimental controls、Jan13vertical/upscale | 台詞の差替え独立性と音画維持は未測定。nativeverticalとupscaled4K区別 |
| 既存映像 | Ray3ModifyDec18;Ray3.14Jan26とJan23launch guide | 同系名称でreference/HDR機能をまとめない。速度/価格は720pvsRay3vendor条件付き |
| 編集へ入る | AdobeExtendApr2GA、Dec16AlephPromptEdit/videoeditorbeta | Fireflyブランド/自社モデル/partnerと生成/部分修正/延長/組立を区別 |
| 継続 | Sora2Sep30launch、公式Mar24app終了方針 | 当時将来のtimeline案内のみ。Apr26/Sep24後日情報を持ち込まない |
| 使用と来歴 | AdobeFeb12training/credentials、SoraSep30consent | 制作素材の利用条件と来歴の表示は別、本稿は法的適否を判定しない |
| 人の作業と採用 | 同条件/複数回/保持条件/終了条件/通常編集baseline | 最良クリップだけで評価せず不採用/修正/組立含む。試験案で実測ではない |

## 調査

動画固有の一次URL26件。原典の本文を直接使い、論文は固定v1abstract/日付確認の背景にとどめる。旧HunyuanVideoのURLは別分野の論文だったため正しい2412.03603v1へ訂正。SVDv1日付もNov25へ訂正。RunwayGen4.5visibleDec1とJSON-LDNov1は不一致、visible発表日採用。Sora公式Xはweb403後にX公式syndication/oEmbedでOpenAI所属・日付・本文を照合、切れている末尾や後日の終了日を補わない。

## 検証

原典の該当箇所と日英本文を照合し、日英の論旨・比較条件・確信度・想定例・限界を通読で確認。JA4342字（旧1643）、EN1601語（9428字、旧3533字）、各32段落/9節/15本文引用。字数は分析の充足確認の補助であり品質やSEOの証明ではない。

pnpm build（clean/site/CSS/validate）成功、git diff --check成功。実ブラウザーで日英それぞれ1440×1000/390×844の本文・比較カード・公開根拠を目視し、言語の往復切替と横スクロールなしを確認。screenshots/video-ja-mobile.jpg と video-en-desktop.jpg を保存。

## 公開確認の残件

全36日英セット改稿後に公開確認。
