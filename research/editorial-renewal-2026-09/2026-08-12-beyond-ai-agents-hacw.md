# 2026-08-12-beyond-ai-agents-hacw

診断: 定義列挙の反復、六段階/四段階の重複、仮説から必須構成への飛躍。
問い: 一回の承認を将来の自動実行ルールに変えるには何を確かめるか。
主張: 判断記録と将来の実行権限を分け、適用条件を検査し責任者が承認したルールのみ再利用する。
構成: 今回の承認の限界→記録と規則の違い→請求書の想定例→実装の分担→試行の評価と限界。
公開資料は個別機能の根拠であり、HACW全体の実証ではない。

## 調査インベントリ（既存38件、採用しない候補も保存）
- Gartner: Hype Cycle for Digital Workplace Applications, 2026 https://www.gartner.com/en/documents/7878877
- Gartner First Take: OpenAI Launches Workspace Agents https://www.gartner.com/en/documents/7760821
- Gartner First Take: Slackbot Transforms Slack to an AI Workhub https://www.gartner.com/en/documents/7663361
- Gartner: The New Rules of Human-AI Collaboration and Teamwork https://www.gartner.com/en/articles/human-ai-collaboration
- Gartner: Four Scenarios for Human-AI Collaboration at Work https://www.gartner.com/en/newsroom/press-releases/2025-11-11-gartner-says-leaders-must-create-four-scenarios-for-human-artificial-intelligence-collaboration-at-work
- Gartner: Uniform Governance Across AI Agents Will Lead to Failure https://www.gartner.com/en/newsroom/press-releases/2026-05-26-gartner-says-applying-uniform-governance-across-ai-agents-will-lead-to-enterprise-ai-agent-failure
- Gartner: Agentic AI Will Transform Finance https://www.gartner.com/en/articles/agentic-ai-in-finance
- Gartner: How CHROs Can Redefine Manager Oversight https://www.gartner.com/en/articles/agentic-ai-for-chros
- OpenAI: Introducing Workspace Agents in ChatGPT https://openai.com/index/introducing-workspace-agents-in-chatgpt/
- OpenAI Agents SDK: Agent Orchestration https://openai.github.io/openai-agents-python/multi_agent/
- OpenAI Agents SDK: Human-in-the-loop https://openai.github.io/openai-agents-python/human_in_the_loop/
- OpenAI Agents SDK: Results https://openai.github.io/openai-agents-python/results/
- OpenAI Agents SDK: Tracing https://openai.github.io/openai-agents-python/tracing/
- OpenAI Agents SDK: Agent Memory https://openai.github.io/openai-agents-python/sandbox/memory/
- AWS: Policy in Amazon Bedrock AgentCore https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html
- Microsoft Agent Framework: Workflow Orchestrations https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/
- Microsoft Agent Framework: Handoff Orchestration https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/handoff
- Microsoft Agent Framework: Evaluation https://learn.microsoft.com/en-us/agent-framework/agents/evaluation
- Microsoft Azure Architecture Center: AI Agent Orchestration Patterns https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns
- Google Cloud: Gemini Enterprise Agent Platform Agents Overview https://docs.cloud.google.com/gemini-enterprise-agent-platform/agents
- Google Cloud: Evaluate Gen AI Agents https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/evaluation-agents
- Anthropic: Building Effective Agents https://www.anthropic.com/engineering/building-effective-agents
- Anthropic: How We Built Our Multi-Agent Research System https://www.anthropic.com/engineering/multi-agent-research-system
- Anthropic: Demystifying Evals for AI Agents https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- NIST: Building Evaluation Probes into Agentic AI https://www.nist.gov/programs-projects/building-evaluation-probes-agentic-ai
- NIST AI 600-1: Generative AI Profile https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence
- Microsoft Research: Interaction, Process, Infrastructure https://www.microsoft.com/en-us/research/publication/interaction-process-infrastructure-a-unified-framework-for-human-agent-collaboration/
- Microsoft Research: From Task Solvers to Teammates https://www.microsoft.com/en-us/research/project/from-task-solvers-to-teammates-a-theory-grounded-architecture-for-advancing-collaboration-readiness-in-llm-agents/
- Microsoft Research: Magentic-UI https://www.microsoft.com/en-us/research/publication/magentic-ui-report/
- Microsoft Research: Human-Agent Collaboration: Can an Agent Be a Partner? https://www.microsoft.com/en-us/research/publication/human-agent-collaboration-can-an-agent-be-a-partner/
- Collaborative Human-Agent Protocol (CHAP) https://arxiv.org/abs/2606.09751
- CLEO: When to Hand Off, When to Work Together https://arxiv.org/abs/2603.02050
- Pista: Auditing and Controlling AI Agent Actions in Spreadsheets https://arxiv.org/abs/2604.20070
- CollabSkill: Evaluating Human-Agent Collaboration on Real-World Tasks https://arxiv.org/abs/2606.09833
- Human Oversight and Overload https://arxiv.org/abs/2606.05770
- Human Oversight of Agentic Systems in Practice https://arxiv.org/abs/2606.05391
- Reflexion: Language Agents with Verbal Reinforcement Learning https://arxiv.org/abs/2303.11366
- ExpeL: LLM Agents Are Experiential Learners https://arxiv.org/abs/2308.10144

## 改稿後の確認
- 日英5節、本文引用4件がpublishedSourcesと一致。
- 原典確認: OpenAI発表(2026-04-22)、承認SDK、AWS Policy、Reflexion(2023)。SDK/Policyは更新型資料のため新規の細部や提供状況を主張せず、既存稿の中核機能を再確認。
- 再確認修正: 試験合格を未検査例外への保証としないこと、送金に別承認が必要な組織の条件を明記。
- 既存38件は調査候補として保存。本文に必要な確認済み4件へ公開出典を絞った。
- pnpm build / git diff --check: PASS。公開照合は進捗に追記する。
