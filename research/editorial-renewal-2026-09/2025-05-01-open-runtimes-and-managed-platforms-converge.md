# 2025-05-01-open-runtimes-and-managed-platforms-converge

## 旧稿出典
- https://arxiv.org/abs/2411.04468
- https://arxiv.org/abs/2412.05467
- https://www.microsoft.com/en-us/research/blog/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/
- https://openai.com/index/introducing-operator/
- https://openai.com/index/new-tools-for-building-agents/
- https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-announces-general-availability-of-multi-agent-collaboration/
- https://aws.amazon.com/blogs/machine-learning/implement-human-in-the-loop-confirmation-with-amazon-bedrock-agents/
- https://cloud.google.com/blog/products/ai-machine-learning/build-and-manage-multi-system-agents-with-vertex-ai
- https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/
- https://www.anthropic.com/news/Introducing-code-with-claude
- https://devblogs.microsoft.com/semantic-kernel/semantic-kernel-agents-are-now-generally-available/

## 調査・診断
共通matrix37一次資料と旧稿11資料を候補に、AWSの2025-04-09確認実装とA2A同日発表を採用。イベント告知を機能普及の裏付けにしていた点、SK Agents GAを全オーケストレーション安定化と解釈した点を削除。

## 改稿・確認
接続先と確認処理を分け、AWSのuser confirmationとreturn of controlの責任範囲を正確に区別。利用者の実行確認を上長承認と同一視しない。引数編集後の再確認と処理結果の照合を設計案として記載。日英再確認。
