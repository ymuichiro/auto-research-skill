# 2026-03-30 research memo: subagents become the practical unit of work AI

## Article direction

- Date: `2026-03-30`
- Proposed format: `focused article`
- Working thesis:
  - By late March 2026, `subagents` are no longer only an implementation trick in agent frameworks.
  - The public shift this week is that OpenAI explicitly positioned `GPT-5.4 mini` and `GPT-5.4 nano` for subagents on `2026-03-17`, while OpenAI Codex, Anthropic Claude Code, Google ADK, Microsoft Agent Framework, and Amazon Bedrock all expose smaller specialist agents, deterministic orchestration, sessions, or supervisor-collaborator patterns as first-class product and docs surfaces.
  - The practical implication is a more specific architecture for work AI:
    - stronger models coordinate, judge, and synthesize
    - smaller or bounded agents retrieve, verify, transform, or execute narrow steps
    - state, approvals, and recovery are handled at the workflow layer rather than in one huge prompt

## Overlap check

- Recent articles already covered:
  - `2026-03-24-why-ai-products-converge-on-chat-ui`
  - `2026-03-25-cowork-signals-the-execution-layer-of-work-ai`
  - `2026-03-26-agent-identity-becomes-an-auth-control-plane`
  - `2026-03-28-open-agent-protocol-stack`
  - `2026-03-28-video-generation-ai-product-landscape`
- This piece should avoid repeating:
  - chat as the main product surface
  - long-running work AI as the main frame
  - identity / auth as the main frame
  - protocol layering as the main frame
- This piece should emphasize:
  - task decomposition into specialist subagents
  - model tiering between coordinator and specialists
  - deterministic orchestration, sessions, memory, and human approval boundaries
  - when multi-agent design is useful and when it adds overhead

## Primary-source inventory

### OpenAI

1. OpenAI: Introducing GPT-5.4 mini and nano
   - <https://openai.com/index/introducing-gpt-5-4-mini-and-nano/>
2. OpenAI: Introducing GPT-5.4
   - <https://openai.com/index/introducing-gpt-5-4/>
3. OpenAI API docs: GPT-5.4 mini
   - <https://developers.openai.com/api/docs/models/gpt-5.4-mini>
4. OpenAI API docs: GPT-5.4 nano
   - <https://developers.openai.com/api/docs/models/gpt-5.4-nano>
5. OpenAI Codex docs: Subagents
   - <https://developers.openai.com/codex/concepts/subagents>
6. OpenAI: Introducing Codex
   - <https://openai.com/index/introducing-codex/>
7. OpenAI: Codex
   - <https://openai.com/codex/>

### Anthropic

8. Anthropic docs: Claude Code overview
   - <https://docs.anthropic.com/en/docs/claude-code/overview>
9. Anthropic docs: Sub agents
   - <https://docs.anthropic.com/en/docs/claude-code/sub-agents>
10. Anthropic docs: Claude Code common workflows
   - <https://docs.anthropic.com/en/docs/claude-code/common-workflows>
11. Anthropic Engineering: Building effective agents
   - <https://www.anthropic.com/engineering/building-effective-agents>
12. Anthropic Engineering: How we built our multi-agent research system
   - <https://www.anthropic.com/engineering/how-we-built-our-multi-agent-research-system>

### Google

13. Google ADK: Multi-agent systems
   - <https://google.github.io/adk-docs/agents/multi-agents/>
14. Google ADK: Workflow agents
   - <https://google.github.io/adk-docs/agents/workflow-agents/>
15. Google ADK: Sessions
   - <https://google.github.io/adk-docs/sessions/>
16. Google ADK: Memory
   - <https://google.github.io/adk-docs/sessions/memory/>
17. Gemini API docs: Available models
   - <https://ai.google.dev/gemini-api/docs/models>

### Microsoft

18. Microsoft Agent Framework: Overview
   - <https://learn.microsoft.com/en-us/agent-framework/overview/>
19. Microsoft Agent Framework Workflows: Using workflows as agents
   - <https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/as-agents>
20. Microsoft Agent Framework Workflows: Request and response
   - <https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/request-and-response>

### AWS

21. Amazon Bedrock: Use multi-agent collaboration with Amazon Bedrock Agents
   - <https://docs.aws.amazon.com/bedrock/latest/userguide/agents-multi-agent-collaboration.html>
22. Amazon Bedrock: Set up multi-agent collaboration
   - <https://docs.aws.amazon.com/bedrock/latest/userguide/create-multi-agent-collaboration.html>
23. Amazon Bedrock AgentCore: What is AgentCore?
   - <https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html>

### Papers

24. AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation
   - <https://arxiv.org/abs/2308.08155>
25. MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework
   - <https://arxiv.org/abs/2308.00352>
26. CAMEL: Communicative Agents for "Mind" Exploration of Large Scale Language Model Society
   - <https://arxiv.org/abs/2303.17760>
27. Mixture-of-Agents Enhances Large Language Model Capabilities
   - <https://arxiv.org/abs/2406.04692>

## Draft writing notes

- Why this week changed the story:
  - On `2026-03-17`, OpenAI explicitly framed `GPT-5.4 mini` and `GPT-5.4 nano` around subagent use in Codex.
  - Anthropic, Google, Microsoft, and AWS already expose delegation, workflow control, sessions, or supervisor-collaborator patterns in official docs.
  - Together, the story changes from "multi-agent is an experimental pattern" to "subagents are becoming a standard implementation choice for real work."
- Core comparison to make:
  - one large agent with one large context window
  - coordinator plus specialist agents with narrower context, bounded tools, and explicit state
- Concrete workflow examples to include:
  - research pipeline: planner, retriever, fact checker, final writer
  - customer operations: intake, billing check, policy check, escalation approval
  - engineering work: repo analysis, test verification, release approval
- Cautions to keep explicit:
  - many workflows are still simpler and better as one agent
  - subagents can create context loss, duplicate work, and tracing overhead
  - state, evaluation, and approval boundaries matter more as the graph grows
  - the winning pattern is not "more agents", but "clear division of responsibility"
