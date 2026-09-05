# 2026-04-06-voice-agents-become-operational-systems

## 元記事の調査候補
- OpenAI API: Voice agents — https://platform.openai.com/docs/guides/voice-agents
- OpenAI API: Realtime API — https://platform.openai.com/docs/guides/realtime
- OpenAI API: Realtime API with WebRTC — https://platform.openai.com/docs/guides/realtime-webrtc
- OpenAI API: Realtime API with SIP — https://platform.openai.com/docs/guides/realtime-sip
- OpenAI API: Using realtime models — https://platform.openai.com/docs/guides/realtime-models-prompting
- OpenAI API: Realtime transcription — https://platform.openai.com/docs/guides/realtime-transcription
- OpenAI: Introducing gpt-realtime and Realtime API updates for production voice agents — https://openai.com/index/introducing-gpt-realtime
- OpenAI: Introducing next-generation audio models in the API — https://openai.com/index/introducing-our-next-generation-audio-models/
- Gemini API: Get started with Live API — https://ai.google.dev/gemini-api/docs/live
- Gemini API: Live API capabilities guide — https://ai.google.dev/gemini-api/docs/live-guide
- Gemini API: Tool use with Live API — https://ai.google.dev/gemini-api/docs/live-tools
- Gemini API: Session management with Live API — https://ai.google.dev/gemini-api/docs/live-session
- Gemini API: Gemini models — https://ai.google.dev/gemini-api/docs/models/gemini
- Microsoft Learn: Voice Live API for real-time voice agents — https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live
- Microsoft Learn: Voice Live API reference — https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live-api-reference
- Microsoft Learn: Quickstart: Create a voice live real-time voice agent — https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live-quickstart
- Microsoft Learn: Quickstart: Use function calling in a Voice Live session — https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-voice-live-function-calling
- Microsoft Learn: Voice Live FAQ — https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live-faq
- Amazon Connect: Use Amazon Connect AI agent self-service — https://docs.aws.amazon.com/connect/latest/adminguide/ai-agent-self-service.html
- Amazon Connect: Use Connect AI agents for real-time assistance — https://docs.aws.amazon.com/connect/latest/adminguide/connect-ai-agent.html
- AWS What's New: Amazon Connect now provides APIs to test and simulate voice interactions — https://aws.amazon.com/about-aws/whats-new/2026/02/amazon-connect-provides-apis-test-simulate-voice-interactions/
- AWS What's New: Amazon Connect adds new generative text-to-speech voices and expands to new regions — https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-connect-adds-generative-text-to-speech-voices/
- AWS What's New: Amazon Connect expands agentic speech-to-speech voice experiences to the London region and adds voices — https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-connect-london-europe-region/
- Amazon Nova User Guide: Speech — https://docs.aws.amazon.com/nova/latest/userguide/speech.html
- Amazon Nova model card: Nova Sonic overview — https://docs.aws.amazon.com/ai/responsible-ai/nova-sonic/overview.html
- AWS What's New: Announcing Amazon Nova Sonic, a new speech-to-speech model that brings real-time voice conversations to Amazon Bedrock — https://aws.amazon.com/about-aws/whats-new/2025/04/amazon-nova-sonic-speech-to-speech-conversations-bedrock/

## 診断・改稿・再確認
市場全体のデモ→運用という断定、chainedが一律安全という含意、言語/音声数の未限定比較を削除。26候補保存/採用3。OpenAI方式説明、Google VADのアプリ側再生停止、AWS2月2日シミュレーション発表を確認。予約変更の1例に集中し4節化。再読で音声取消と外部保存の巻戻しを区別し、生成文と実際に聞こえた音、シミュレーションと実回線確認を分けた。更新docsの新モデル仕様は過去記事へ導入しない。
