# 2026-03-28-open-agent-protocol-stack

## 調査候補（旧稿の一次資料一覧）
- Model Context Protocol: Introduction: https://modelcontextprotocol.io/docs/getting-started/intro
- Model Context Protocol: Base specification: https://modelcontextprotocol.io/specification/2025-06-18/basic
- Model Context Protocol: Authorization: https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization
- Model Context Protocol: OAuth Client Credentials: https://modelcontextprotocol.io/extensions/auth/oauth-client-credentials
- A2A Protocol: Specification: https://a2a-protocol.org/latest/specification/
- AG-UI: Introduction: https://docs.ag-ui.com/introduction
- AG-UI: Architecture: https://docs.ag-ui.com/concepts/architecture
- AG-UI: Events: https://docs.ag-ui.com/concepts/events
- AG-UI: State: https://docs.ag-ui.com/concepts/state
- OpenAI: Introducing apps in ChatGPT and the new Apps SDK: https://openai.com/index/introducing-apps-in-chatgpt/
- OpenAI API docs: Developer mode: https://developers.openai.com/api/docs/guides/developer-mode
- Anthropic docs: MCP connector: https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector
- Anthropic docs: Claude Code MCP: https://docs.anthropic.com/en/docs/claude-code/mcp
- Google Cloud docs: Google Cloud MCP overview: https://docs.cloud.google.com/mcp/overview
- Google Cloud docs: Authenticate to Google and Google Cloud MCP servers: https://docs.cloud.google.com/mcp/authenticate-mcp
- Google ADK: Technical overview: https://google.github.io/adk-docs/get-started/about/
- Google ADK: A2A support: https://google.github.io/adk-docs/a2a/
- Google ADK: MCP tools: https://google.github.io/adk-docs/tools-custom/mcp-tools/
- Microsoft Agent Framework: Overview: https://learn.microsoft.com/en-us/agent-framework/overview/
- Microsoft Agent Framework: A2A integration: https://learn.microsoft.com/en-us/agent-framework/integrations/a2a
- Microsoft Agent Framework: AG-UI integration: https://learn.microsoft.com/en-us/agent-framework/integrations/ag-ui/
- Windows AI Foundry: Model Context Protocol overview: https://learn.microsoft.com/en-us/windows/ai/mcp/overview
- AWS What's New: Amazon Bedrock AgentCore Runtime now supports stateful MCP: https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-bedrock-agentcore-runtime-stateful-mcp/
- AWS What's New: Amazon Bedrock AgentCore Runtime now supports AG-UI protocol: https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-bedrock-agentcore-runtime-ag-ui-protocol/
- AWS docs: Amazon Bedrock AgentCore overview: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html
- AWS docs: Deploy AG-UI servers in AgentCore Runtime: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-agui.html
- AWS docs: Amazon Bedrock AgentCore MCP Server: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/mcp-getting-started.html

## 診断、論証、再確認
- 旧稿: 三層化と業界収束を過剰一般化。AG-UIの表示/承認導線と実行権限制御を混同。想定シナリオ三つが実例のように並ぶ。英単語混在と反復が多い。
- 論旨: 誰に何を受け渡すかで比較し、必要な接続だけを選ぶ。請求調査/返金を一つの想定例に限定。通信形式と業務の意味を区別する。
- 確認: AWS発表は2026-03-13。A2A v0.3.0 release published_at=2025-07-30T17:05:22Z。MCPは2025-11-25版に固定しexperimental tasksという反証を追加。現在のAG-UI文書の新規イベントは過去へ持ち込まない。
- 日英再読: 特定の三層構成を必須にしない。MCP上のAIツール、非同期タスクという重複を明示。画面閉鎖と拒否の動作は設計要件であり製品保証ではない。
- 追加調査: https://modelcontextprotocol.io/specification/2025-11-25/server/tools
- 追加調査: https://a2a-protocol.org/v0.3.0/specification/
- 追加調査: https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks
