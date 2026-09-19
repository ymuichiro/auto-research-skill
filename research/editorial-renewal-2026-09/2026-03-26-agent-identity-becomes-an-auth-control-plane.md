# 2026-03-26-agent-identity-becomes-an-auth-control-plane

## 調査候補（旧稿の一次資料一覧）
- Microsoft: What is Microsoft Entra Agent ID?: https://learn.microsoft.com/en-us/entra/agent-id/identity-professional/microsoft-entra-agent-identities-for-ai-agents
- Microsoft: What is the Microsoft agent identity platform: https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/what-is-agent-id-platform
- Microsoft: What is the Microsoft Entra Agent Registry?: https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/what-is-agent-registry
- Microsoft: Configure user authentication for actions in Copilot Studio: https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-enduser-authentication
- Microsoft: Overview of Microsoft Agent 365: https://learn.microsoft.com/en-us/microsoft-agent-365/overview
- Microsoft Purview: Use Microsoft Purview to manage data security & compliance for AI agents: https://learn.microsoft.com/en-us/purview/ai-agents
- Microsoft Purview: Use Microsoft Purview to manage data security & compliance for Microsoft Agent 365: https://learn.microsoft.com/en-us/purview/ai-agent-365
- Microsoft Purview: Secure and govern Microsoft 365 Copilot agents: https://learn.microsoft.com/en-us/purview/deploymentmodels/depmod-sc-agents-deployment
- AWS Docs: Amazon Bedrock AgentCore overview: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html
- AWS Docs: Features of AgentCore Identity: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/key-features-and-benefits.html
- AWS Docs: Understanding workload identities: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/understanding-agent-identities.html
- AWS Docs: Manage credential providers with AgentCore Identity: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity-outbound-credential-provider.html
- AWS Docs: Supported authentication patterns: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/common-use-cases.html
- AWS Docs: Policy in Amazon Bedrock AgentCore: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html
- AWS Docs: Implement safeguards for your application by associating a guardrail with your agent: https://docs.aws.amazon.com/bedrock/latest/userguide/agents-guardrail.html
- AWS Docs: Amazon Bedrock policies in AWS Organizations: https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_bedrock.html
- Google Cloud Docs: Identities for workloads: https://docs.cloud.google.com/iam/docs/workload-identities
- Google Cloud Docs: Use agent identity with Vertex AI Agent Engine: https://docs.cloud.google.com/agent-builder/agent-engine/agent-identity
- Google Cloud Docs: Manage access for deployed agents: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/manage/access
- Google Cloud Docs: Google Cloud MCP servers overview: https://docs.cloud.google.com/mcp/overview
- Google Cloud Docs: Authenticate to Google and Google Cloud MCP servers: https://docs.cloud.google.com/mcp/authenticate-mcp
- Google Cloud Docs: AI Protection overview: https://docs.cloud.google.com/security-command-center/docs/ai-protection-overview
- Google Cloud Docs: Model Armor overview: https://docs.cloud.google.com/security-command-center/docs/model-armor-overview
- Google Cloud Docs: Agent Engine Threat Detection overview: https://docs.cloud.google.com/security-command-center/docs/agent-engine-threat-detection-overview
- NVIDIA Docs: Overview of NVIDIA NeMo Guardrails Library: https://docs.nvidia.com/nemo/guardrails/latest/about/overview.html
- NVIDIA Docs: Guardrail Types in NVIDIA NeMo Guardrails: https://docs.nvidia.com/nemo/guardrails/latest/about/rail-types.html
- NVIDIA Docs: Agentic Security in NVIDIA NeMo Guardrails: https://docs.nvidia.com/nemo/guardrails/latest/configure-rails/guardrail-catalog/agentic-security.html
- NVIDIA Technical Blog: Safeguard Agentic AI Systems with the NVIDIA Safety Recipe: https://developer.nvidia.com/blog/safeguard-agentic-ai-systems-with-the-nvidia-safety-recipe/
- Model Context Protocol: Authorization: https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization
- Model Context Protocol: OAuth Client Credentials: https://modelcontextprotocol.io/extensions/auth/oauth-client-credentials
- Model Context Protocol: Enterprise-Managed Authorization: https://modelcontextprotocol.io/extensions/auth/enterprise-managed-authorization
- A2A Protocol: Specification overview: https://a2a-protocol.org/latest/specification/
- Auth0: Secure MCP with Auth0: https://auth0.com/ai/docs/mcp/intro/overview
- Auth0: Call your APIs on a user's behalf from MCP: https://auth0.com/ai/docs/mcp/get-started/call-your-apis-on-users-behalf
- Okta: Identify shadow AI agents using OAuth grants: https://help.okta.com/oie/en-us/content/topics/ai-agents/ai-agent-identify-with-oauth.htm
- Okta: Certify AI agents: https://help.okta.com/oie/en-us/content/topics/ai-agents/ai-agent-access-cert.htm

## 診断と改稿
- 旧稿はID、委任、登録台帳、出力検査を統制基盤に一括し、異なる機能を同等扱い。サービスアカウント一般への否定、導入速度への効果は未立証。
- 論旨: 識別、委任、アクセス許可は別。文書検索/外部送信という一つの想定課題で、入口と下流の権限を区別する。専用サービスアカウントも適用可能と限定。
- 採用資料: Microsoft 2025-05-19発表、AWS 2025-07-16発表、MCP 2025-11-25版。現在の製品docsの新規機能を過去記事へ持ち込まない。
- 再確認: トークン中に利用者/agent双方が必ずあるとは書かない。HTTP/stdioの範囲を明示。OAuth同意と個別送信承認を混同せず、検査例は提案として記す。日英の条件と結論を照合。
- 追加調査: https://blogs.microsoft.com/blog/2025/05/19/microsoft-build-2025-the-age-of-ai-agents-and-building-the-open-agentic-web/
- 追加調査: https://aws.amazon.com/blogs/aws/introducing-amazon-bedrock-agentcore-securely-deploy-and-operate-ai-agents-at-any-scale/
- 追加調査: https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization
