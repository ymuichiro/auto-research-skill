# 2026-06-30-agents-operate-legacy-desktop-workflows

診断: 七つの普遍的条件、異なる四業務の浅い列挙、318回のモデル条件欠落。
問い: APIのない入力作業を、保存結果と再試行までどう検証するか。
構成: 請求書入力の難所→管理環境の機能→長時間研究の条件→区間別確認→試行の範囲と限界。

## 調査インベントリ
- AWS: Amazon WorkSpaces for AI agents is generally available https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-workspaces-ai/
- Microsoft Learn: Automate web and desktop apps with computer use https://learn.microsoft.com/en-us/power-platform/release-plan/2026wave1/microsoft-copilot-studio/automate-web-desktop-apps-computer-use
- Microsoft Learn: Computer use tool for Foundry agents https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/computer-use
- Microsoft Learn: Computer use FAQ https://learn.microsoft.com/en-us/microsoft-copilot-studio/faqs-computer-use
- Microsoft Learn: What is Windows 365 for Agents? https://learn.microsoft.com/en-us/windows-365/agents/introduction-windows-365-for-agents
- Microsoft Learn: Attended vs. unattended execution https://learn.microsoft.com/en-us/windows-365/agents/attended-unattended
- Microsoft Learn: Windows 365 for Agents in Agent 365 https://learn.microsoft.com/en-us/windows-365/agents/w365a-availability-a365
- OpenAI: Work with Codex from anywhere https://openai.com/index/work-with-codex-from-anywhere/
- OpenAI: Running Codex safely at OpenAI https://openai.com/index/running-codex-safely/
- OpenAI Help Center: ChatGPT release notes https://help.openai.com/en/articles/6825453-chatgpt-release-notes
- OpenAI API: Computer use https://platform.openai.com/docs/guides/tools-computer-use
- Anthropic: Introducing computer use https://www.anthropic.com/news/3-5-models-and-computer-use
- Anthropic docs: Computer use tool https://docs.anthropic.com/en/docs/build-with-claude/computer-use
- Anthropic Privacy Center: Data processed by computer use https://privacy.anthropic.com/en/articles/10030352-what-personal-data-will-be-processed-by-computer-use
- OSWorld 2.0: Benchmarking Computer Use Agents on Long-Horizon Real-World Tasks https://arxiv.org/abs/2606.29537
- OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks https://arxiv.org/abs/2404.07972
- AndroidWorld: A Dynamic Benchmarking Environment for Autonomous Agents https://arxiv.org/abs/2405.14573
- WebArena: A Realistic Web Environment for Building Autonomous Agents https://arxiv.org/abs/2307.13854
- VisualWebArena: Evaluating Multimodal Agents on Realistic Visual Web Tasks https://arxiv.org/abs/2401.13649
- WorkArena: How Capable Are Web Agents at Solving Common Knowledge Work Tasks? https://arxiv.org/abs/2403.07718
- Mind2Web: Towards a Generalist Agent for the Web https://arxiv.org/abs/2306.06070
- OmniAct: A Dataset and Benchmark for Enabling Multimodal Generalist Autonomous Agents https://arxiv.org/abs/2402.17553
- WebVoyager: Building an End-to-End Web Agent with Large Multimodal Models https://arxiv.org/abs/2401.13919
- Agent S: An Open Agentic Framework that Uses Computers Like a Human https://arxiv.org/abs/2410.08164

## 再確認
AWS 2026-06-30発表、Anthropic 2024-10-22発表、OSWorld 2.0 v1(2026-06-28)を確認。原日付以前の版を固定。318回はOpus4.7/max、20.6%はOpus4.8/max/500step/batchedという別設定を明記。24候補を保存、公開3件。請求書の想定例に統一し、再確認でデスクトップ初期化と書き込みの取り消しを区別。日英5節、引用一致、build/diff-check PASS。
