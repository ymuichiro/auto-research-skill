# 2026-03-28 research memo: open agent protocol stack

## Article direction

- Date: `2026-03-28`
- Proposed format: `focused article`
- Working thesis:
  - `MCP`, `A2A`, and `AG-UI` are separating the agent stack into three operational layers:
    - agent-to-tool and data access
    - agent-to-agent delegation
    - agent-to-user interaction and approval UX
  - The shift matters this week because the story is no longer only protocol design. By late March 2026, major vendors are exposing concrete runtime support, integration guides, or product surfaces on top of those protocols.

## Overlap check

- Recent articles already covered:
  - `2026-03-24-why-ai-products-converge-on-chat-ui`
  - `2026-03-25-cowork-signals-the-execution-layer-of-work-ai`
  - `2026-03-26-agent-identity-becomes-an-auth-control-plane`
- This piece should avoid repeating:
  - general chat-first product design
  - cowork and long-running work execution as the main frame
  - identity and authorization as the main frame
- This piece should emphasize:
  - protocol layering
  - cross-vendor interoperability surface
  - concrete workflow implications for approvals, delegation, and tool access

## Primary-source inventory

### MCP and auth layer

1. Model Context Protocol overview
   - <https://modelcontextprotocol.io/specification/2025-06-18/basic>
2. MCP authorization spec
   - <https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization>
3. MCP OAuth client credentials extension
   - <https://modelcontextprotocol.io/extensions/auth/oauth-client-credentials>
4. OpenAI ChatGPT developer mode
   - <https://platform.openai.com/docs/developer-mode>
5. OpenAI: Introducing apps in ChatGPT and the new Apps SDK
   - <https://openai.com/index/introducing-apps-in-chatgpt/>
6. Anthropic docs: MCP connector
   - <https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector>
7. Anthropic docs: Claude Code MCP
   - <https://docs.anthropic.com/en/docs/claude-code/mcp>
8. Google Cloud docs: Google Cloud MCP overview
   - <https://docs.cloud.google.com/mcp/overview>
9. Google Cloud docs: Authenticate to Google and Google Cloud MCP servers
   - <https://docs.cloud.google.com/mcp/authenticate-mcp>
10. Windows AI Foundry: Model Context Protocol overview
   - <https://learn.microsoft.com/en-us/windows/ai/mcp/overview>
11. Microsoft Fabric: Data agent as an MCP server in Agent Framework
   - <https://learn.microsoft.com/en-us/fabric/data-science/data-agent-mcp-agent-framework>
12. AWS docs: Amazon Bedrock AgentCore MCP Server
   - <https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/mcp-getting-started.html>
13. AWS What's New: Amazon Bedrock AgentCore Runtime now supports stateful MCP
   - <https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-bedrock-agentcore-runtime-stateful-mcp/>

### A2A and delegation layer

14. A2A Protocol specification
   - <https://a2a-protocol.org/latest/specification/>
15. Google ADK technical overview
   - <https://google.github.io/adk-docs/get-started/about/>
16. Google ADK A2A docs
   - <https://google.github.io/adk-docs/a2a/>
17. Microsoft Agent Framework A2A integration
   - <https://learn.microsoft.com/en-us/agent-framework/user-guide/agents/agent-types/a2a-agent>
18. Microsoft A2A .NET namespace docs
   - <https://learn.microsoft.com/en-us/dotnet/api/a2a?view=agent-framework-dotnet-latest>
19. AWS docs: Amazon Bedrock AgentCore overview
   - <https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html>

### AG-UI and user interaction layer

20. AG-UI introduction
   - <https://docs.ag-ui.com/introduction>
21. AG-UI core architecture
   - <https://docs.ag-ui.com/concepts/architecture>
22. AG-UI events
   - <https://docs.ag-ui.com/concepts/events>
23. AG-UI state and sync
   - <https://docs.ag-ui.com/concepts/state>
24. Microsoft Agent Framework AG-UI integration
   - <https://learn.microsoft.com/en-us/agent-framework/integrations/ag-ui/>
25. AWS What's New: Amazon Bedrock AgentCore Runtime now supports AG-UI
   - <https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-bedrock-agentcore-runtime-ag-ui-protocol/>
26. AWS docs: Use any agent framework with Amazon Bedrock AgentCore Runtime
   - <https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/using-any-agent-framework.html>

## Draft writing notes

- Why this week changed the story:
  - open protocols now map to clearly different interaction layers
  - vendors are not only endorsing them conceptually; they are wiring them into runtime, framework, and product docs
  - the practical result is a more realistic split between access, delegation, and interaction
- Concrete workflow examples to include:
  - internal research agent with MCP access to enterprise systems, A2A handoff to specialist agents, and AG-UI for approvals and progress display
  - customer support escalation where one orchestrator delegates billing or policy checks to specialist agents
  - code or ops workflows where a human must watch progress, inspect artifacts, and approve writes
- Cautions to keep explicit:
  - cross-vendor interoperability is still partial
  - not every implementation supports full MCP surface area
  - AG-UI is newer and less settled than MCP
  - auth and governance still need local policy design even when protocol support exists
