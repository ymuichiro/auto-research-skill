# 2026-08-01-ai-collaboration-starts-with-first-artifact

診断: 確認質問、途中結果の可視化、自己修正を対話へ一括。AmbiEntから試作品優位性へ飛躍。PDCA等の反復。
問い: 要件が未確定な仕事で、質問と試作品をどう使い分けるか。
構成: 不足情報と未確定の好み→中間成果の研究→記事構成の想定例→会話の失敗→検証と終了。

## 調査インベントリ
- Google DeepMind: QuestBench https://deepmind.google/research/publications/121987/
- ICLR 2025: Active Task Disambiguation with LLMs https://proceedings.iclr.cc/paper_files/paper/2025/hash/5e07476b6bd2497e1fbd11b8f0b2de3c-Abstract-Conference.html
- ACL: We’re Afraid Language Models Aren’t Modeling Ambiguity https://aclanthology.org/2023.emnlp-main.51/
- ACL: CLAMBER https://aclanthology.org/2024.acl-long.578.pdf
- ICLR 2025: Modeling Future Conversation Turns https://proceedings.iclr.cc/paper_files/paper/2025/hash/97e2df4bb8b2f1913657344a693166a2-Abstract-Conference.html
- ACL: Asking Clarification Questions to Handle Ambiguity https://aclanthology.org/2023.findings-emnlp.772/
- Python Code Generation by Asking Clarification Questions https://arxiv.org/abs/2212.09885
- ClarifyGPT https://arxiv.org/abs/2310.10996
- LLM-Based Test-Driven Interactive Code Generation https://arxiv.org/abs/2404.10100
- Google DeepMind: Proactive Agents for Multi-Turn Text-to-Image Generation https://deepmind.google/research/publications/121578/
- AI Chains https://arxiv.org/abs/2110.01691
- PromptChainer https://arxiv.org/abs/2203.06566
- Self-Refine https://arxiv.org/abs/2303.17651
- ACL: Read, Revise, Repeat https://aclanthology.org/2022.in2writing-1.14/
- MINT https://arxiv.org/abs/2309.10691
- CollabLLM https://arxiv.org/abs/2502.00640
- EMNLP 2025: Prototypical Human-AI Collaboration Behaviors https://aclanthology.org/2025.emnlp-main.852.pdf
- Microsoft Research: LLMs Get Lost In Multi-Turn Conversation https://www.microsoft.com/en-us/research/publication/llms-get-lost-in-multi-turn-conversation/
- Microsoft Research: LLMs Corrupt Your Documents When You Delegate https://www.microsoft.com/en-us/research/publication/llms-corrupt-your-documents-when-you-delegate/
- Organization Science: Navigating the Jagged Technological Frontier https://pubsonline.informs.org/doi/pdf/10.1287/orsc.2025.21838
- To Trust or to Think https://arxiv.org/abs/2102.09692
- Microsoft Research: Scaffolding Human-AI Collaboration https://www.microsoft.com/en-us/research/publication/human-ai-collaboration-field-experiment/
- Microsoft Research: Helping Me Versus Doing It for Me https://www.microsoft.com/en-us/research/publication/helping-me-versus-doing-it-for-me-designing-for-agency-in-llm-infused-writing-tools-for-science-journalism/
- Microsoft Research: From Use to Oversight https://www.microsoft.com/en-us/research/publication/from-use-to-oversight-how-mental-models-influence-user-behavior-and-output-in-ai-writing-assistants/
- Microsoft: Guidelines for Human-AI Interaction https://www.microsoft.com/en-us/research/wp-content/uploads/2019/01/Guidelines-for-Human-AI-Interaction-camera-ready.pdf
- OpenAI Help Center: How to create a good prompt https://help.openai.com/en/articles/4936848-how-do-i-create-a-good-prompt
- Anthropic: Building effective agents https://www.anthropic.com/engineering/building-effective-agents
- Google AI for Developers: Prompt design strategies https://ai.google.dev/gemini-api/docs/prompting-strategies
- GitHub Docs: About GitHub Copilot CLI https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli

## 改稿後確認
4原典を確認。ClarifyGPT(2023)、AI Chains(2022)、画像対話(2025-05-01)、Lost in Conversation(2025)。数値の対象/参加者/条件と研究間の違いを確認。29候補から採用4件へ。日英5節の論旨と引用を照合。題名の「AIへの質問」を確認質問へ修正し、質問主体の曖昧さを除去。ビルド確認。
