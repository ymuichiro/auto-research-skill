# 2026-04-13-coding-agents-become-supervised-runtime-systems

## 元記事の調査候補
- OpenAI: Introducing GPT-5.2-Codex — https://openai.com/index/introducing-gpt-5-2-codex/
- OpenAI: Introducing GPT-5.3-Codex — https://openai.com/index/introducing-gpt-5-3-codex
- OpenAI: Introducing GPT-5.3-Codex-Spark — https://openai.com/index/introducing-gpt-5-3-codex-spark/
- OpenAI: Introducing the Codex app — https://openai.com/index/introducing-the-codex-app/
- OpenAI API docs: GPT-5.2-Codex — https://developers.openai.com/api/docs/models/gpt-5.2-codex
- OpenAI API docs: GPT-5.3-Codex — https://developers.openai.com/api/docs/models/gpt-5.3-codex
- OpenAI Help Center: Using Codex with your ChatGPT plan — https://help.openai.com/en/articles/11369540-codex-in-chatgpt-faq
- Anthropic docs: Claude Code overview — https://docs.anthropic.com/en/docs/claude-code/overview
- Anthropic docs: Security — https://docs.anthropic.com/en/docs/claude-code/security
- Anthropic docs: Hooks — https://docs.anthropic.com/en/docs/claude-code/hooks
- Anthropic docs: Subagents — https://docs.anthropic.com/en/docs/claude-code/sub-agents
- Anthropic docs: Claude Code GitHub Actions — https://docs.anthropic.com/en/docs/claude-code/github-actions
- Anthropic Engineering: Harness design for long-running application development — https://www.anthropic.com/engineering/harness-design-long-running-apps
- Anthropic Engineering: Claude Code auto mode — https://www.anthropic.com/engineering/claude-code-auto-mode
- Anthropic Engineering: Quantifying infrastructure noise in agentic coding evals — https://www.anthropic.com/engineering/infrastructure-noise
- Anthropic Engineering: Scaling Managed Agents: Decoupling the brain from the hands — https://www.anthropic.com/engineering/managed-agents
- GitHub Docs: About GitHub Copilot cloud agent — https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent
- GitHub Docs: Customizing the development environment for GitHub Copilot cloud agent — https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/customize-the-agent-environment
- GitHub Docs: Creating custom agents for Copilot cloud agent — https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-custom-agents
- GitHub Docs: About agent skills — https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
- GitHub Docs: Allowing GitHub Copilot CLI to work autonomously — https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot
- GitHub Blog: Research, plan, and code with Copilot cloud agent — https://github.blog/changelog/2026-04-01-research-plan-and-code-with-copilot-cloud-agent
- GitHub Blog: Copilot cloud agent now makes verified commits — https://github.blog/changelog/2026-04-03-copilot-cloud-agent-now-makes-verified-commits/
- GitHub Blog: Use Copilot cloud agent from GitHub Mobile — https://github.blog/changelog/2026-04-08-use-copilot-cloud-agent-from-github-mobile/
- GitHub Blog: Copilot cloud agent's validation tools are now 20% faster — https://github.blog/changelog/2026-04-10-copilot-cloud-agents-validation-tools-are-now-20-faster
- GitHub Blog: Run multiple agents at once with /fleet in Copilot CLI — https://github.blog/ai-and-ml/github-copilot/run-multiple-agents-at-once-with-fleet-in-copilot-cli/
- Google: Jules now available — https://blog.google/innovation-and-ai/models-and-research/google-labs/jules-now-available/
- Jules docs: Getting started — https://jules.google/docs
- Jules docs: Reviewing plans and giving feedback — https://jules.google/docs/review-plan/
- Jules docs: Reviewing code changes — https://jules.google/docs/code/
- Jules docs: Environment setup — https://jules.google/docs/environment
- Jules docs: Integrations — https://jules.google/docs/integrations/
- Jules docs: Limits and plans — https://jules.google/docs/usage-limits
- AWS What's New: AWS DevOps Agent is now generally available — https://aws.amazon.com/about-aws/whats-new/2026/03/aws-devops-agent-generally-available/
- AWS Docs: About AWS DevOps Agent — https://docs.aws.amazon.com/devopsagent/latest/userguide/about-aws-devops-agent.html
- SWE-bench: Can Language Models Resolve Real-World GitHub Issues? — https://arxiv.org/abs/2310.06770
- OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments — https://arxiv.org/abs/2404.07972
- MLE-bench: Evaluating Machine Learning Agents on Machine Learning Engineering — https://arxiv.org/abs/2410.07095
- RE-Bench: Evaluating Frontier AI R&D Capabilities of Language Model Agents against Human Experts — https://arxiv.org/abs/2411.15114

## 診断・改稿・再確認
branch/VM/runnerを同じ隔離として扱う誤り、verified commitを権限制御や判断履歴に使う誤りを訂正。業界主戦場の断定を削除。Julesの計画レビューにはauto-approveの記載があり必須人間承認とは書かない。環境/計画docsの現在の説明は発売年表に転用しない。infra-noiseは2月5日と同一モデル/ハーネス/Terminal-Bench条件、6ppを原文照合。元39候補を保存しGitHub署名docsを追加。採用4件。再読で署名、正しさ、実行権限を切り分け、未実行テストの理由も残すよう補足。
