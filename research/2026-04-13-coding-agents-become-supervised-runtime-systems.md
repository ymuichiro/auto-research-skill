# 2026-04-13 research memo: coding agents become supervised runtime systems

## Article direction

- Date: `2026-04-13`
- Proposed format: `weekly roundup`
- Working thesis:
  - By `2026-04-13`, the practical comparison axis for coding agents is shifting away from "which model writes the best patch" and toward `supervised runtime` design.
  - The converging public signal is that major products now expose the same runtime contract in explicit product surfaces:
    - plan before execution
    - isolated branch, sandbox, VM, or runner
    - permission or policy boundaries
    - live logs, diffs, and session tracking
    - skills, custom agents, or subagents for specialization
  - The practical implication is that coding agents are no longer best understood as IDE autocomplete or even chat-based pair programming. They are becoming supervised background workers that can be redirected, resumed, reviewed, and merged.

## Overlap check

- Recent articles already covered:
  - `2026-04-08-agent-memory-shifts-to-layered-systems`
  - `2026-04-06-voice-agents-become-operational-systems`
  - `2026-03-30-subagents-become-the-practical-unit-of-work-ai`
  - `2026-03-28-open-agent-protocol-stack`
  - `2026-03-21-enterprise-ai-agents-readiness`
- This piece should avoid repeating:
  - memory architecture as the main frame
  - voice stack operations as the main frame
  - subagents as the main frame
  - protocol layering as the main frame
  - broad enterprise readiness as the main frame
- This piece should emphasize:
  - plan review before code execution
  - isolated runtime and environment preparation
  - permissions, logs, and intervention surfaces
  - custom agents / skills as runtime specialization
  - why benchmark scores alone are insufficient without harness context

## Why this week

- The weekly story is a convergence story with dated public signals:
  - `2026-03-24`: Anthropic publishes `Harness design for long-running application development`, making harness quality a first-class part of coding-agent performance.
  - `2026-03-25`: Anthropic publishes `Claude Code auto mode`, explicitly framing autonomy as a permissions and classifier problem rather than a pure model problem.
  - `2026-03-31`: AWS makes `AWS DevOps Agent` generally available and publicly frames a frontier agent as a long-running operational teammate across telemetry, code, and deployment systems.
  - `2026-04-01`: GitHub expands `Copilot cloud agent` around research, plan, and branch-based execution.
  - `2026-04-03` to `2026-04-10`: GitHub adds verified commits, mobile support, and faster validation for cloud agents, reinforcing that session control and publish workflow are product surfaces.
- OpenAI Codex and Google Jules provide the longer-running backdrop:
  - OpenAI's February 2026 Codex releases separate long-running cloud execution from ultra-fast real-time collaboration.
  - Jules exposes plan approval, short-lived VMs, setup snapshots, and publish-to-PR workflows in public docs.
- Taken together, the week changes the story from "coding agents are getting smarter" to "coding agents are becoming governed runtime systems."

## Primary-source inventory

### OpenAI

1. OpenAI: Introducing GPT-5.2-Codex
   - <https://openai.com/index/introducing-gpt-5-2-codex/>
2. OpenAI: Introducing GPT-5.3-Codex
   - <https://openai.com/index/introducing-gpt-5-3-codex>
3. OpenAI: Introducing GPT-5.3-Codex-Spark
   - <https://openai.com/index/introducing-gpt-5-3-codex-spark/>
4. OpenAI: Introducing the Codex app
   - <https://openai.com/index/introducing-the-codex-app/>
5. OpenAI API docs: GPT-5.2-Codex
   - <https://developers.openai.com/api/docs/models/gpt-5.2-codex>
6. OpenAI API docs: GPT-5.3-Codex
   - <https://developers.openai.com/api/docs/models/gpt-5.3-codex>
7. OpenAI Help Center: Using Codex with your ChatGPT plan
   - <https://help.openai.com/en/articles/11369540-codex-in-chatgpt-faq>
8. OpenAI Help Center: Codex rate card
   - <https://help.openai.com/en/articles/20001106-codex-rate-card>

### Anthropic

9. Anthropic docs: Claude Code overview
   - <https://docs.anthropic.com/en/docs/claude-code/overview>
10. Anthropic docs: Security
   - <https://docs.anthropic.com/en/docs/claude-code/security>
11. Anthropic docs: Claude Code settings
   - <https://docs.anthropic.com/en/docs/claude-code/settings>
12. Anthropic docs: Hooks reference
   - <https://docs.anthropic.com/en/docs/claude-code/hooks>
13. Anthropic docs: Subagents
   - <https://docs.anthropic.com/en/docs/claude-code/sub-agents>
14. Anthropic docs: Claude Code GitHub Actions
   - <https://docs.anthropic.com/en/docs/claude-code/github-actions>
15. Anthropic Engineering: Harness design for long-running application development
   - <https://www.anthropic.com/engineering/harness-design-long-running-apps>
16. Anthropic Engineering: Claude Code auto mode
   - <https://www.anthropic.com/engineering/claude-code-auto-mode>
17. Anthropic Engineering: Quantifying infrastructure noise in agentic coding evals
   - <https://www.anthropic.com/engineering/infrastructure-noise>
18. Anthropic Engineering index
   - <https://www.anthropic.com/engineering>

### GitHub

19. GitHub Docs: About GitHub Copilot cloud agent
   - <https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent>
20. GitHub Docs: GitHub Copilot cloud agent
   - <https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent>
21. GitHub Docs: Managing cloud agents
   - <https://docs.github.com/en/copilot/how-tos/use-copilot-agents/manage-agents>
22. GitHub Docs: Customizing the development environment for GitHub Copilot cloud agent
   - <https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/customize-the-agent-environment>
23. GitHub Docs: Creating custom agents for Copilot cloud agent
   - <https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-custom-agents>
24. GitHub Docs: About agent skills
   - <https://docs.github.com/en/copilot/concepts/agents/about-agent-skills>
25. GitHub Docs: Creating agent skills for GitHub Copilot
   - <https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-skills>
26. GitHub Docs: Allowing GitHub Copilot CLI to work autonomously
   - <https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot>
27. GitHub Docs: About GitHub Copilot CLI
   - <https://docs.github.com/copilot/concepts/agents/about-copilot-cli>
28. GitHub Blog: Research, plan, and code with Copilot cloud agent
   - <https://github.blog/changelog/2026-04-01-research-plan-and-code-with-copilot-cloud-agent>
29. GitHub Blog: Copilot cloud agent now makes verified commits
   - <https://github.blog/changelog/2026-04-03-copilot-cloud-agent-now-makes-verified-commits/>
30. GitHub Blog: Use Copilot cloud agent from GitHub Mobile
   - <https://github.blog/changelog/2026-04-08-use-copilot-cloud-agent-from-github-mobile/>
31. GitHub Blog: Copilot cloud agent's validation tools are now 20% faster
   - <https://github.blog/changelog/2026-04-10-copilot-cloud-agents-validation-tools-are-now-20-faster>
32. GitHub Blog: Run multiple agents at once with /fleet in Copilot CLI
   - <https://github.blog/ai-and-ml/github-copilot/run-multiple-agents-at-once-with-fleet-in-copilot-cli/>

### Google Jules

33. Google Blog: Jules now available
   - <https://blog.google/innovation-and-ai/models-and-research/google-labs/jules-now-available/>
34. Jules docs: Getting started
   - <https://jules.google/docs>
35. Jules docs: Reviewing plans and giving feedback
   - <https://jules.google/docs/review-plan/>
36. Jules docs: Reviewing code changes
   - <https://jules.google/docs/code/>
37. Jules docs: Environment setup
   - <https://jules.google/docs/environment>
38. Jules docs: Integrations
   - <https://jules.google/docs/integrations/>
39. Jules docs: Limits and plans
   - <https://jules.google/docs/usage-limits>
40. Jules docs: FAQ
   - <https://jules.google/docs/faq/>

### AWS

41. AWS What's New: AWS DevOps Agent is now generally available
   - <https://aws.amazon.com/about-aws/whats-new/2026/03/aws-devops-agent-generally-available/>
42. AWS Docs: About AWS DevOps Agent
   - <https://docs.aws.amazon.com/devopsagent/latest/userguide/about-aws-devops-agent.html>
43. AWS Blog: AWS launches frontier agents for security testing and cloud operations
   - <https://aws.amazon.com/blogs/machine-learning/aws-launches-frontier-agents-for-security-testing-and-cloud-operations/>

### Papers

44. SWE-bench: Can Language Models Resolve Real-World GitHub Issues?
   - <https://arxiv.org/abs/2310.06770>
45. OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments
   - <https://arxiv.org/abs/2404.07972>
46. MLE-bench: Evaluating Machine Learning Agents on Machine Learning Engineering
   - <https://arxiv.org/abs/2410.07095>
47. RE-Bench: Evaluating Frontier AI R&D Capabilities of Language Model Agents against Human Experts
   - <https://arxiv.org/abs/2411.15114>

## Draft writing notes

- Lead with the thesis that the visible product contract is now:
  - task intake and plan review
  - isolated runtime or runner
  - permission and policy control
  - session logs, diffs, and branch outputs
  - specialized agents or skills
- Key comparisons to make:
  - OpenAI splits the space between long-running cloud execution and ultra-fast interactive coding.
  - Anthropic focuses on permission modes, hooks, GitHub Actions, and harness quality.
  - GitHub productizes the branch-and-PR lifecycle as the native cloud-agent surface.
  - Jules makes plan approval, short-lived VMs, setup snapshots, and publish flows explicit.
  - AWS shows the same supervised-runtime pattern extending beyond code authoring into software operations.
- Concrete workflows to include:
  - repo bugfix with plan approval and branch review
  - CI or deployment failure triage using logs and environment setup
  - larger refactor or migration with custom agents / skills
  - DevOps incident investigation that crosses telemetry, code, and deployment history
- Cautions to keep explicit:
  - benchmark scores alone hide harness, runner, and time-budget differences
  - approval fatigue and default-permit behavior remain real risks
  - isolated sandboxes help, but network, secrets, and self-hosted runner policy still matter
  - the winning design question is increasingly "what can be safely supervised and resumed," not only "what can the model write"
