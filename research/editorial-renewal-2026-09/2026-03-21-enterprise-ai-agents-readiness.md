# 2026-03-21-enterprise-ai-agents-readiness

## 調査候補（旧稿の一次資料一覧）
- ReAct: Synergizing Reasoning and Acting in Language Models: https://arxiv.org/abs/2210.03629
- Toolformer: Language Models Can Teach Themselves to Use Tools: https://arxiv.org/abs/2302.04761
- AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation: https://arxiv.org/abs/2308.08155
- Mind2Web: Towards a Generalist Agent for the Web: https://arxiv.org/abs/2306.06070
- A Real-World WebAgent with Planning, Long Context Understanding, and Program Synthesis: https://arxiv.org/abs/2307.12856
- AgentBench: Evaluating LLMs as Agents: https://arxiv.org/abs/2308.03688
- WebArena: A Realistic Web Environment for Building Autonomous Agents: https://arxiv.org/abs/2307.13854
- SWE-bench: Can Language Models Resolve Real-World GitHub Issues?: https://arxiv.org/abs/2310.06770
- GAIA: a benchmark for General AI Assistants: https://arxiv.org/abs/2311.12983
- WebVoyager: Building an End-to-End Web Agent with Large Multimodal Models: https://arxiv.org/abs/2401.13919
- VisualWebArena: Evaluating Multimodal Agents on Realistic Visual Web Tasks: https://arxiv.org/abs/2401.13649
- OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments: https://arxiv.org/abs/2404.07972
- tau-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains: https://arxiv.org/abs/2406.12045
- OpenAI Agent Builder: https://developers.openai.com/api/docs/guides/agent-builder
- OpenAI Agents SDK: https://developers.openai.com/api/docs/guides/agents-sdk
- OpenAI Agent evals: https://developers.openai.com/api/docs/guides/agent-evals
- OpenAI Safety in building agents: https://developers.openai.com/api/docs/guides/agent-builder-safety
- Anthropic Tool use overview: https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview
- Anthropic Computer use: https://docs.anthropic.com/en/docs/build-with-claude/computer-use
- Anthropic Evaluation Tool: https://docs.anthropic.com/en/docs/test-and-evaluate/eval-tool
- Anthropic MCP connector: https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector
- Google Vertex AI Agent Engine overview: https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview
- Google Agent Development Kit overview: https://cloud.google.com/vertex-ai/generative-ai/docs/agent-development-kit/overview
- Google Vertex AI Agent Builder overview: https://cloud.google.com/vertex-ai/generative-ai/docs/agent-builder/overview
- Google ADK Agents overview: https://google.github.io/adk-docs/agents/
- Microsoft Azure AI Foundry Agent Service overview: https://learn.microsoft.com/en-us/azure/ai-foundry/agents/overview
- Microsoft AI agent design patterns: https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns
- Microsoft Semantic Kernel Agent Framework: https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/
- Microsoft Semantic Kernel Agent Orchestration: https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-orchestration/
- Microsoft Foundry Agent Service tools overview: https://learn.microsoft.com/en-us/azure/foundry-classic/agents/how-to/tools-classic/overview
- Microsoft Agent Evaluators for Generative AI: https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-evaluators/agent-evaluators
- AWS Create and configure agent manually for Amazon Bedrock: https://docs.aws.amazon.com/bedrock/latest/userguide/agents-create.html
- AWS Amazon Bedrock Agents prescriptive guidance: https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-frameworks/bedrock-agents.html

## 診断と改稿
- 旧稿: 研究全体/業界全体の重心移動を一般化し、モデルの重要性を下げる対句。出典のないRelative focus曲線、分類と用途の反復、複数vendorの網羅を削除。
- 論旨: benchmarkから完了条件の設計を学び、自社固有の例外と人の対応負担を測る。想定例は住所変更一件に絞る。
- 根拠: SWE-bench v1=2023-10-10、τ-bench v1=2024-06-17、Anthropic=2024-12-19。初版の古いモデル成功率は現在の期待値へ転用せず、課題/評価方法のみ採用。
- 再確認: 模擬利用者と本番を区別。適切なhandoffと無断変更を別指標とし、全件handoffによる見かけの安全率を成功扱いしない。再試行では結果不明を明示。日英意味一致。
- 追加調査候補: https://arxiv.org/abs/2310.06770v1
- 追加調査候補: https://arxiv.org/abs/2406.12045v1
- 追加調査候補: https://www.anthropic.com/engineering/building-effective-agents
