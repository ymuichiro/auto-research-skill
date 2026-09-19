# 2025-08-01-agent-ops-gets-promoted-to-a-control-layer

## 旧稿出典
- https://arxiv.org/abs/2411.15114
- https://arxiv.org/abs/2412.05467
- https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/announcing-general-availability-of-azure-ai-foundry-agent-service/4414352
- https://devblogs.microsoft.com/foundry/announcing-developer-essentials-for-agents-and-apps-in-azure-ai-foundry/
- https://openai.com/index/new-tools-and-features-in-the-responses-api/
- https://devblogs.microsoft.com/semantic-kernel/semantic-kernel-multi-agent-orchestration/
- https://cloud.google.com/blog/products/ai-machine-learning/new-mcp-integrations-to-google-cloud-databases
- https://developers.googleblog.com/en/google-cloud-donates-a2a-to-linux-foundation/

## 調査・診断
共通matrixの43件を候補に、OpenAIの2025-03-11 tracingと05-21 background mode発表を採用。Developer Essentialsは再取得403のため新稿で採用せず。可観測性が購買条件や改善速度を決めるという推測、観測と制御の混同を削除。

## 改稿・確認
見える/待てる/やり直せるを区別。チケット作成の通信断という想定例で重複実行と状態確認を説明。背景実行を任意業務の復旧保証にしない。日英リンクと確度を確認。
