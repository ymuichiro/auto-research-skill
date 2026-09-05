# 2026-04-20-agents-compete-on-work-continuity

## 元記事の調査候補
- OpenAI: Codex for (almost) everything — https://openai.com/index/codex-for-almost-everything/
- OpenAI: The next evolution of the Agents SDK — https://openai.com/index/the-next-evolution-of-the-agents-sdk/
- OpenAI: Introducing the Codex app — https://openai.com/index/introducing-the-codex-app/
- OpenAI Help Center: Using Codex with your ChatGPT plan — https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan
- OpenAI Help Center: Projects in ChatGPT — https://help.openai.com/en/articles/10169521-projects-in-chatgpt
- OpenAI Help Center: Tasks in ChatGPT — https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt
- OpenAI Help Center: Apps in ChatGPT — https://help.openai.com/en/articles/11487775-apps-in-chatgpt
- OpenAI Agents SDK: Intro — https://openai.github.io/openai-agents-python/
- OpenAI Agents SDK: Sandbox concepts — https://openai.github.io/openai-agents-python/sandbox/guide/
- Anthropic Engineering: Scaling Managed Agents: Decoupling the brain from the hands — https://www.anthropic.com/engineering/managed-agents
- Anthropic Engineering: Harness design for long-running application development — https://www.anthropic.com/engineering/harness-design-long-running-apps
- Claude Agent SDK overview — https://code.claude.com/docs/en/agent-sdk/overview
- Anthropic docs: Claude Code security — https://docs.anthropic.com/en/docs/claude-code/security
- Claude API docs: Code execution tool — https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool
- Google Cloud: Vertex AI Agent Engine Sessions overview — https://docs.cloud.google.com/agent-builder/agent-engine/sessions/overview
- Google Cloud: Manage sessions with Agent Development Kit — https://docs.cloud.google.com/agent-builder/agent-engine/sessions/manage-sessions-adk
- Google ADK: State — https://adk.dev/sessions/state/
- Google ADK: Artifacts — https://adk.dev/artifacts/
- AWS Docs: Amazon Bedrock AgentCore overview — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html
- AWS Docs: Observe your agent applications on Amazon Bedrock AgentCore Observability — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability.html
- AWS What's New: Amazon Bedrock AgentCore Evaluations is now generally available — https://aws.amazon.com/about-aws/whats-new/2026/03/agentcore-evaluations-generally-available/
- AWS Docs: Get started with AgentCore Observability — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-get-started.html
- AWS Docs: Add observability to your Amazon Bedrock AgentCore resources — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-configure.html
- AWS Docs: Get started with Amazon Bedrock AgentCore — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agentcore-get-started-cli.html

## 診断・改稿・再確認
11節に広がった4社比較と継続性の反復を4節に統合。単発品質より重要という未測定の序列、文書更新日を転換点とする年表を削除。Managed Agentsは4月8日記事、ADKはState/Artifactsの永続化条件を原文で確認。24候補保存/3採用。インメモリ保存と永続保存、会話と実行復旧、履歴保持と文脈選択を区別。再読で外部操作のexactly-onceをログから保証しないよう補足し、入力/出力版の対応と古い情報の再確認を加えた。
