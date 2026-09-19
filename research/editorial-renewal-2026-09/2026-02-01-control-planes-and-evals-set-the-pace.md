# 2026-02-01-control-planes-and-evals-set-the-pace

## 旧稿の出典
- https://arxiv.org/abs/2411.15114
- https://arxiv.org/abs/2412.05467
- https://openai.com/index/introducing-gpt-5-for-developers/
- https://azure.microsoft.com/en-us/blog/agent-factory-designing-the-open-agentic-web-stack/
- https://openai.com/index/introducing-agentkit/
- https://devblogs.microsoft.com/foundry/introducing-microsoft-agent-framework-the-open-source-engine-for-agentic-ai-apps/
- https://devblogs.microsoft.com/foundry/introducing-multi-agent-workflows-in-foundry-agent-service/
- https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents

## 調査と診断
retrospective-2025-2026-matrix.md 当該月の52一次資料を候補に、Anthropic評価記事とFoundryワークフロー発表を採用。導入速度を決めるとの因果断定、supervised workerという不正確な資料要約、4条件の装飾表示を削除。

## 改稿・再確認
既存能力の後退を検出する回帰評価と、処理定義/採点基準の版管理に集中。問い合わせの振り分けを想定例と明示。正答率だけでは引き継ぎ削減を判断できないこと、採点器も検査対象であることを追加。Foundryの2025-11-25公開プレビューと初期観測範囲を明示。日英の論旨とリンク整合を再読。
