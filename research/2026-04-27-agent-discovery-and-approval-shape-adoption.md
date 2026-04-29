# 2026-04-27 research memo: agent discovery and approval shape adoption

## Article direction

- Date: `2026-04-27`
- Proposed format: `weekly roundup`
- Working thesis:
  - By `2026-04-27`, the public agent story is no longer only about model quality, tool use, or runtime design.
  - Across OpenAI, Anthropic, Microsoft, Google Cloud, and AWS, a second layer is becoming explicit: where agents are discovered, how they are approved, what metadata describes them, and how they are deployed into an existing workspace or enterprise control surface.
  - The practical implication is that agent adoption is increasingly shaped by `discovery + approval + deployment` design:
    - app directories and curated stores
    - admin review, RBAC, and action controls
    - metadata such as capabilities, certifications, and agent cards
    - protocol compatibility such as MCP or A2A
    - deployment into managed work surfaces such as ChatGPT, Claude, Microsoft 365 Copilot, Gemini Enterprise, and AgentCore

## Overlap check

- Recent articles already covered:
  - `2026-04-20-agents-compete-on-work-continuity`
  - `2026-04-13-coding-agents-become-supervised-runtime-systems`
  - `2026-04-08-agent-memory-shifts-to-layered-systems`
  - `2026-03-28-open-agent-protocol-stack`
  - `2026-03-26-agent-identity-becomes-an-auth-control-plane`
- This piece should avoid repeating:
  - continuity or resumability as the main frame
  - protocol interoperability by itself as the main frame
  - identity or auth as the main frame
  - coding agents or voice agents as the main frame
- This piece should emphasize:
  - app directory, agent store, connector directory, and marketplace surfaces
  - approval and publish workflows before agents become user-visible
  - how protocol metadata turns into catalog metadata
  - why procurement and admin controls are now part of product comparison

## Why this week

- This is a convergence week rather than a single-launch week.
- OpenAI's `Apps in ChatGPT` help article was updated within the last day and now treats apps as a unified directory surface with action controls, admin enablement, and custom MCP-backed apps.
- Anthropic's integrations and remote-MCP help pages were updated this week and now make directory, connector setup, and organization-level enablement part of the mainstream Claude workflow.
- Microsoft's `Agent Store` and `Agent 365` docs make registry, approval, security review, and cross-platform onboarding explicit public surfaces instead of private enterprise plumbing.
- Google Cloud and AWS already had marketplace and protocol material in place, but by late April 2026 they fit into the same comparison frame: the agent is something you can catalog, validate, buy, register, and govern.
- Taken together, the story changes from "which agent can do the task" to "which agent can be admitted, found, trusted, and deployed in a governed way."

## Primary-source inventory

### OpenAI

1. OpenAI Help Center: Apps in ChatGPT
   - <https://help.openai.com/en/articles/12503483-apps-in-chatgpt-and-the-apps-sdk>
2. OpenAI Developers: Apps SDK
   - <https://developers.openai.com/apps-sdk/>
3. OpenAI API docs: ChatGPT developer mode
   - <https://platform.openai.com/docs/guides/developer-mode>
4. OpenAI API docs: Connectors and MCP servers
   - <https://platform.openai.com/docs/guides/tools-remote-mcp?lang=python>

### Anthropic

5. Anthropic: Claude can now connect to your world
   - <https://www.anthropic.com/news/integrations>
6. Anthropic: Discover tools that work with Claude
   - <https://www.anthropic.com/news/connectors-directory>
7. Anthropic Help Center: Setting up Claude integrations
   - <https://support.anthropic.com/en/articles/10168395-setting-up-claude-integrations/>
8. Anthropic Help Center: Pre-built Web Connectors Using Remote MCP
   - <https://support.anthropic.com/en/articles/11176164-pre-built-connectors-using-remote-mcp>
9. Anthropic Help Center: Getting Started with Custom Connectors Using Remote MCP
   - <https://support.anthropic.com/en/articles/11175166-about-custom-integrations-using-remote-mcp>

### Microsoft

10. Microsoft Learn: Agent Store in Microsoft 365 Copilot
   - <https://learn.microsoft.com/en-us/microsoft-365/copilot/copilot-agent-store>
11. Microsoft Learn: Microsoft Agent 365 overview
   - <https://learn.microsoft.com/en-us/microsoft-agent-365/overview>
12. Microsoft Learn: Microsoft Agent 365 documentation
   - <https://learn.microsoft.com/en-us/microsoft-agent-365/>
13. Microsoft Learn: Use and collaborate with agents in Agent 365
   - <https://learn.microsoft.com/en-us/microsoft-agent-365/use>
14. Microsoft Learn: Agents hub
   - <https://learn.microsoft.com/en-us/agents/>
15. Microsoft Learn: Bring your agents into Microsoft 365 Copilot
   - <https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/bring-agents-to-copilot>
16. Microsoft Learn: Microsoft 365 Agents SDK overview
   - <https://learn.microsoft.com/en-us/microsoft-365/agents-sdk/building-agents>

### Google Cloud

17. Google Cloud Marketplace Partners: Offer AI agents through Google Cloud Marketplace
   - <https://cloud.google.com/marketplace/docs/partners/ai-agents>
18. Google Cloud Marketplace Partners: Pricing models for AI agents
   - <https://cloud.google.com/marketplace/docs/partners/ai-agents/pricing-models>
19. Google Cloud: AI Agents for Gemini Enterprise
   - <https://cloud.google.com/gemini-enterprise/agents>
20. Google Cloud: Google Cloud Marketplace
   - <https://cloud.google.com/marketplace>
21. Google Cloud Blog: Scaling AI agents with Google Cloud Marketplace and Gemini Enterprise
   - <https://cloud.google.com/blog/topics/partners/google-cloud-ai-agent-marketplace>
22. Google Cloud Docs: Add and manage A2A agents from Google Cloud Marketplace
   - <https://docs.cloud.google.com/gemini/enterprise/docs/register-and-manage-marketplace-agents>
23. Google ADK docs: Introduction to A2A
   - <https://google.github.io/adk-docs/a2a/intro/>

### AWS

24. AWS What's New: Introducing AI agents and tools in AWS Marketplace
   - <https://aws.amazon.com/about-aws/whats-new/2025/07/ai-agents-tools-aws-marketplace/>
25. AWS Marketplace Buyer Guide: AI agent products
   - <https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-ai-agents-products.html>
26. AWS Marketplace Buyer Guide: Discovering AI agents and tools
   - <https://docs.aws.amazon.com/marketplace/latest/buyerguide/ai-agent-discovery.html>
27. AWS Marketplace Buyer Guide: Agent mode
   - <https://docs.aws.amazon.com/marketplace/latest/buyerguide/agent-mode.html>
28. AWS Marketplace User Guide: AI agent products
   - <https://docs.aws.amazon.com/marketplace/latest/userguide/ai-agents-tools.html>
29. AWS What's New: AWS Marketplace now offers pricing model flexibility and simplified deployment for AI agents and tools
   - <https://aws.amazon.com/about-aws/whats-new/2025/10/aws-marketplace-pricing-ai-agents-tools/>

## Draft writing notes

- Lead with a simple distinction:
  - building an agent is no longer the whole product question
  - distribution and governance surfaces are becoming first-class
- Vendor comparisons to make:
  - OpenAI turns connectors into apps, surfaces a directory, and lets admins constrain actions and domains.
  - Anthropic moves MCP-backed integrations into Claude's default UI, with a public directory plus owner-level enablement for organizations.
  - Microsoft makes the approval path explicit: agent requests, data and tools review, security and compliance panels, and Agent Store distribution.
  - Google Cloud treats the agent as a marketplace listing plus an A2A Agent Card that can be deployed into Gemini Enterprise.
  - AWS treats the agent as a procurement object with semantic search, deployment filters, and protocol-level metadata such as MCP or A2A support.
- Concrete workflows to include:
  - a workspace admin enabling only approved write-capable apps
  - a team browsing a store for a sales or support agent instead of building from scratch
  - a partner publishing a remote agent with marketplace metadata and protocol declarations
  - a buyer comparing agent listings by deployment mode, certification, and integration support
- Cautions to keep explicit:
  - app directory presence is not equivalent to production readiness
  - protocol support improves portability, but governance still depends on admin policy and identity boundaries
  - the real bottleneck often moves from model quality to approval latency, policy review, and deployment fit
  - discovery surfaces can widen adoption, but they also widen the blast radius of bad defaults
