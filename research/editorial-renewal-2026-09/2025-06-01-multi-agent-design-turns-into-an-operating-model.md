# 2025-06-01-multi-agent-design-turns-into-an-operating-model

## 旧稿出典
- https://arxiv.org/abs/2406.12045
- https://arxiv.org/abs/2411.04468
- https://cloud.google.com/blog/products/ai-machine-learning/build-and-manage-multi-system-agents-with-vertex-ai
- https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/
- https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/announcing-general-availability-of-azure-ai-foundry-agent-service/4414352
- https://devblogs.microsoft.com/foundry/announcing-developer-essentials-for-agents-and-apps-in-azure-ai-foundry/
- https://openai.com/index/new-tools-and-features-in-the-responses-api/
- https://devblogs.microsoft.com/semantic-kernel/semantic-kernel-multi-agent-orchestration/

## 調査・診断
共通matrix41資料からSemantic Kernel5月27日発表とBuilding effective agentsを採用。コネクタ一覧から運用上の成功を推測する記述を削除。複数エージェント化と権限分離は別の実装であると修正。

## 改稿・確認
文章制作の順次/並列/引き継ぎを一つの例で比較。要約だけの受け渡しが検証不能を生むこと、並列の待ち方、終了条件を明示。SDKパターンの存在を改善実証としない。日英同一論旨で再確認。
