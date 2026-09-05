# 2026-07-11-agent-evaluation-measures-execution-path

診断: 四社比較を予告して果たさない。トレースと判定の混同。評価カードが記入要領。
問い: 同じ回答を返す実行を、何を根拠に合否判定するか。
構成: 予約変更の二経路→取得する記録と判定→正解経路の自由度→回帰と本番への反映。

## 調査インベントリ
- OpenAI API: Agent evals https://platform.openai.com/docs/guides/agent-evals
- OpenAI API: Evaluation best practices https://platform.openai.com/docs/guides/evals
- OpenAI API: Graders https://platform.openai.com/docs/guides/graders
- OpenAI Agents SDK: Tracing https://openai.github.io/openai-agents-python/tracing/
- OpenAI Agents SDK: Guardrails https://openai.github.io/openai-agents-python/guardrails/
- OpenAI Agents SDK: Tool guardrails https://openai.github.io/openai-agents-python/ref/tool_guardrails/
- OpenAI Agents SDK: Running agents https://openai.github.io/openai-agents-python/running_agents/
- OpenAI Guardrails Python: Evaluation Tool https://openai.github.io/openai-guardrails-python/evals/
- Anthropic docs: Using the Evaluation Tool https://docs.anthropic.com/en/docs/test-and-evaluate/eval-tool
- Anthropic docs: Define success criteria https://docs.anthropic.com/en/docs/test-and-evaluate/define-success
- Anthropic docs: Develop test cases https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests
- Anthropic docs: Tool use with Claude https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview
- Anthropic docs: Reduce prompt leak https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-prompt-leak
- Google Cloud: Evaluate your agents https://docs.cloud.google.com/gemini-enterprise-agent-platform/optimize/evaluation/evaluate-agents
- Google Cloud: Run offline evaluations https://docs.cloud.google.com/gemini-enterprise-agent-platform/optimize/evaluation/evaluate-offline
- Google Cloud: Continuous evaluation with online monitors https://docs.cloud.google.com/gemini-enterprise-agent-platform/optimize/evaluation/evaluate-online
- Google Cloud: Evaluate Gen AI models https://cloud.google.com/vertex-ai/generative-ai/docs/models/determine-eval
- Google Cloud: Vertex AI evaluation reference https://docs.cloud.google.com/vertex-ai/generative-ai/docs/reference/rpc/google.cloud.aiplatform.v1
- Google agents-cli: Evaluation Guide https://google.github.io/agents-cli/guide/evaluation/
- AWS: Evaluate agent performance with AgentCore Evaluations https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/evaluations.html
- AWS: AgentCore Evaluators https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/evaluators.html
- AWS: Ground truth evaluations https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/ground-truth-evaluations.html
- AWS: AgentCore evaluation results and output https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/results-and-output.html
- AWS: AgentCore Observability https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability.html
- AWS: Get started with AgentCore Observability https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-get-started.html
- AgentBench: Evaluating LLMs as Agents https://arxiv.org/abs/2308.03688
- ToolSandbox: A Stateful, Conversational, Interactive Evaluation Benchmark https://arxiv.org/abs/2406.08746
- tau-bench: A Benchmark for Tool-Agent-User Interaction https://arxiv.org/abs/2406.12045
- SWE-bench: Can Language Models Resolve Real-World GitHub Issues? https://arxiv.org/abs/2310.06770

## 再確認
同じ最終状態でも承認順で不合格になる例、正しい代替経路、入力値検査、欠損ログの限界を日英で確認。単一総合点と安全性/費用の混在を解消。3原典を確認（τ-bench 2024、既存稿引用のSDK/AWS評価文書）。29候補を保存し採用3件。pnpm build / git diff --check PASS、本文リンクは両言語ともpublishedSourcesと一致。
