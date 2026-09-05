# 2026-04-08-agent-memory-shifts-to-layered-systems

## 元記事の調査候補
- OpenAI: Memory and new controls for ChatGPT — https://openai.com/index/memory-and-new-controls-for-chatgpt/
- Anthropic docs: Claude Code memory — https://docs.anthropic.com/en/docs/claude-code/memory
- Anthropic docs: Context windows — https://docs.anthropic.com/en/docs/build-with-claude/context-windows
- Anthropic docs: Prompt caching — https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
- Google ADK: Sessions — https://adk.dev/sessions/
- Google ADK: State — https://adk.dev/sessions/state/
- Google ADK: Memory — https://adk.dev/sessions/memory/
- Google ADK: Context caching — https://adk.dev/context/caching/
- Google ADK: Context compaction — https://adk.dev/context/compaction/
- LangGraph: Add and manage memory — https://docs.langchain.com/oss/python/langgraph/add-memory
- LangGraph: Persistence — https://docs.langchain.com/oss/python/langgraph/persistence
- Deep Agents: Memory — https://docs.langchain.com/oss/python/deepagents/memory
- Letta docs: Stateful agents — https://docs.letta.com/guides/core-concepts/stateful-agents/
- Letta docs: Agent memory — https://docs.letta.com/guides/agents/memory
- Letta docs: Memory blocks — https://docs.letta.com/guides/core-concepts/memory/memory-blocks/
- Letta docs: Shared memory — https://docs.letta.com/guides/core-concepts/memory/shared-memory/
- Letta Code: Memory — https://docs.letta.com/letta-code/memory/
- Mem0 Platform overview — https://docs.mem0.ai/platform/overview
- Mem0: Memory types — https://docs.mem0.ai/core-concepts/memory-types
- Mem0: Graph memory — https://docs.mem0.ai/platform/features/graph-memory
- Microsoft Azure AI Foundry: How to use memory — https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/memory-usage
- Amazon Bedrock: Retain conversational context across multiple sessions using memory — https://docs.aws.amazon.com/bedrock/latest/userguide/agents-memory.html
- Amazon Bedrock: Enable agent memory — https://docs.aws.amazon.com/bedrock/latest/userguide/agents-enable-memory.html
- Amazon Bedrock AgentCore: Memory — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html
- MemGPT: Towards LLMs as Operating Systems — https://arxiv.org/abs/2310.08560
- Generative Agents: Interactive Simulacra of Human Behavior — https://arxiv.org/abs/2304.03442
- MemoryBank: Enhancing Large Language Models with Long-Term Memory — https://arxiv.org/abs/2305.10250
- CoALA: Cognitive Architectures for Language Agents — https://arxiv.org/abs/2309.02427
- LoCoMo: Evaluating Very Long-Term Conversational Memory of LLM Agents — https://aclanthology.org/2024.acl-long.747.pdf
- LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory — https://arxiv.org/abs/2410.10813
- A-MEM: Agentic Memory for LLM Agents — https://arxiv.org/abs/2502.12110
- Memory OS of AI Agent — https://aclanthology.org/2025.acl-long.491.pdf
- In Prospect and Retrospect: Reflective Memory Management for Long-Horizon Personalized Open-Ended Learning — https://aclanthology.org/2025.acl-long.413.pdf
- MemInsight: Autonomous Memory-Augmentation for Long-Horizon Agent Tasks — https://aclanthology.org/2025.emnlp-main.1683.pdf

## 診断・改稿・再確認
18節の重複、最も普及/最適/書き込み事故の方が大きいという未測定の一般化、ベクトル検索と層分離の誤った対立を修正。34候補保存。LangGraphのnamespace、Lettaのfull rewrite競合、LongMemEval5能力を原文確認しv2固定。5節に整理。想定例で今回の指示/将来の訂正/過去の好みを区別。再読でnamespaceとACLの違い、保存時刻と事実の有効時点の違いを追加。更新docsから発売時点や普及率は推定しない。
