# 2026-03-23-agent-security-becomes-a-shipping-gate

## 調査候補（旧稿の一次資料一覧）
- OpenAI: Codex Security: now in research preview: https://openai.com/index/codex-security-now-in-research-preview/
- OpenAI: Designing AI agents to resist prompt injection: https://openai.com/index/designing-agents-to-resist-prompt-injection/
- OpenAI: Understanding prompt injections: a frontier security challenge: https://openai.com/index/prompt-injections
- OpenAI: Introducing Trusted Access for Cyber: https://openai.com/index/trusted-access-for-cyber/
- OpenAI: Security on the path to AGI: https://openai.com/index/security-on-the-path-to-agi/
- OpenAI: The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions: https://openai.com/index/the-instruction-hierarchy/
- Anthropic: Our framework for developing safe and trustworthy agents: https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents
- Anthropic Docs: Tool use with Claude: https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview
- Anthropic Docs: Computer use tool: https://docs.anthropic.com/en/docs/build-with-claude/computer-use
- Anthropic Docs: Using the Evaluation Tool: https://docs.anthropic.com/en/docs/test-and-evaluate/eval-tool
- Anthropic Docs: Reduce prompt leak: https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-prompt-leak
- Anthropic Docs: Claude Code security: https://docs.anthropic.com/en/docs/claude-code/security
- Anthropic Docs: MCP connector: https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector
- Microsoft Foundry: AI Red Teaming Agent (preview): https://learn.microsoft.com/en-us/azure/foundry/concepts/ai-red-teaming-agent
- Microsoft Foundry: Run AI Red Teaming Agent locally (preview): https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/develop/run-scans-ai-red-teaming-agent
- Microsoft Foundry: Prompt Shields in Microsoft Foundry: https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/content-filter-prompt-shields?view=foundry-classic
- AWS: Policy in Amazon Bedrock AgentCore is now generally available: https://aws.amazon.com/about-aws/whats-new/2026/03/policy-amazon-bedrock-agentcore-generally-available/
- AWS Docs: Overview - Amazon Bedrock AgentCore: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html
- AWS Docs: Detect prompt attacks with Amazon Bedrock Guardrails: https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-prompt-attack.html
- AWS Docs: Implement safeguards for your application by associating a guardrail with your agent: https://docs.aws.amazon.com/bedrock/latest/userguide/agents-guardrail.html
- AWS Docs: How Amazon Bedrock Guardrails works: https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-how.html
- Google Cloud Docs: Safety in Vertex AI: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/safety-overview
- Google Cloud Docs: Safety and content filters: https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/configure-safety-filters
- Google Cloud Docs: Evaluate an agent: https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/evaluate
- Google Cloud Docs: Access control: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/access-control
- arXiv: Teams of LLM Agents can Exploit Zero-Day Vulnerabilities: https://arxiv.org/abs/2406.01637

## 診断、論証、再確認
- 旧稿: 3/3と3/11を3/23週の差分と記す。セキュリティ監査製品とエージェント自身の防御を混同。五社の収束、導入速度、市場競争の断定は未立証。英語の一般語混在。
- 論旨: 不正指示の認識と、その操作の実行阻止を別に測る。メール要約から送信へ誘導する想定例一つに絞る。
- 採用: 3/11 OpenAI Safe Url、3/3 AWS Policy、8/4/2025 Anthropic許可設計。Gateway経由だけが対象という条件を明示、別経路の制約を自動保証しない。
- 再読: 返答の拒否と通信不発生を区別。許可された正常処理の成功も測る。未知攻撃への保証やベンダー順位は主張せず、日英同じ評価案に整合。
