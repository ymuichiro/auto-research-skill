# 2026-04-06 research memo: voice agents become operational systems

## Article direction

- Date: `2026-04-06`
- Proposed format: `focused article`
- Working thesis:
  - By `2026-04-06`, public material from OpenAI, Google, Microsoft, and AWS makes voice agents look less like demo UX and more like operational systems.
  - The meaningful shift is not just better voices. The stack now exposes transport choices, session management, function calling, interruption handling, testing, human escalation, and contact-center deployment as first-class surfaces.
  - The practical implication is that teams can now compare voice stacks by operational fit:
    - low-latency speech-to-speech vs chained audio-text-audio flows
    - session lifetime and resume behavior
    - tool invocation and grounded actions
    - telephony, locale coverage, and escalation to humans
    - regression testing and rollout discipline

## Overlap check

- Recent articles already covered:
  - `2026-03-24-why-ai-products-converge-on-chat-ui`
  - `2026-03-25-cowork-signals-the-execution-layer-of-work-ai`
  - `2026-03-28-open-agent-protocol-stack`
  - `2026-03-30-subagents-become-the-practical-unit-of-work-ai`
- This piece should avoid repeating:
  - chat as the main control surface
  - subagents as the main architecture frame
  - protocol separation as the main frame
  - generic long-running work AI as the main frame
- This piece should emphasize:
  - voice-specific runtime requirements
  - speech-to-speech versus chained architectures
  - interruption handling, session lifetime, and telephony
  - testing, escalation, and contact-center deployment

## Why this week

- The weekly signal is a convergence signal rather than a single launch:
  - OpenAI public docs now frame voice agents explicitly around architecture choice, WebRTC, SIP, prompting, and transcription.
  - Google's Live API docs expose native audio, proactive audio, tool use, session resumption, and VAD as concrete product behavior.
  - Microsoft Voice Live documents a unified speech-to-speech interface with broad locale coverage, function calling, telephony integration, and model choice.
  - AWS moved the strongest operational signal in mid-March 2026:
    - `2026-03-17`: Amazon Connect added more generative TTS voices and regions.
    - `2026-03-18`: Amazon Connect expanded agentic speech-to-speech voice experiences to London and added voices.
    - earlier in `2026-02`: Amazon Connect added APIs to test and simulate voice interactions.
- Taken together, the story changes from "voice feels more natural" to "voice can now be evaluated and run as an operational workflow."

## Primary-source inventory

### OpenAI

1. OpenAI API: Voice agents
   - <https://platform.openai.com/docs/guides/voice-agents>
2. OpenAI API: Realtime API
   - <https://platform.openai.com/docs/guides/realtime>
3. OpenAI API: Realtime API with WebRTC
   - <https://platform.openai.com/docs/guides/realtime-webrtc>
4. OpenAI API: Realtime API with SIP
   - <https://platform.openai.com/docs/guides/realtime-sip>
5. OpenAI API: Using realtime models
   - <https://platform.openai.com/docs/guides/realtime-models-prompting>
6. OpenAI API: Realtime transcription
   - <https://platform.openai.com/docs/guides/realtime-transcription>
7. OpenAI: Introducing gpt-realtime and Realtime API updates for production voice agents
   - <https://openai.com/index/introducing-gpt-realtime>
8. OpenAI: Introducing next-generation audio models in the API
   - <https://openai.com/index/introducing-our-next-generation-audio-models/>

### Google

9. Gemini API: Get started with Live API
   - <https://ai.google.dev/gemini-api/docs/live>
10. Gemini API: Live API capabilities guide
   - <https://ai.google.dev/gemini-api/docs/live-guide>
11. Gemini API: Tool use with Live API
   - <https://ai.google.dev/gemini-api/docs/live-tools>
12. Gemini API: Session management with Live API
   - <https://ai.google.dev/gemini-api/docs/live-session>
13. Gemini API: Gemini models
   - <https://ai.google.dev/gemini-api/docs/models/gemini>

### Microsoft

14. Microsoft Learn: Voice Live API for real-time voice agents
   - <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live>
15. Microsoft Learn: Voice Live API reference
   - <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live-api-reference>
16. Microsoft Learn: Quickstart: Create a voice live real-time voice agent
   - <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live-quickstart>
17. Microsoft Learn: Quickstart: Use function calling in a Voice Live session
   - <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-voice-live-function-calling>
18. Microsoft Learn: Voice Live FAQ
   - <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live-faq>

### AWS

19. Amazon Connect: Use Amazon Connect AI agent self-service
   - <https://docs.aws.amazon.com/connect/latest/adminguide/ai-agent-self-service.html>
20. Amazon Connect: Use Connect AI agents for real-time assistance
   - <https://docs.aws.amazon.com/connect/latest/adminguide/connect-ai-agent.html>
21. AWS What's New: Amazon Connect now provides APIs to test and simulate voice interactions
   - <https://aws.amazon.com/about-aws/whats-new/2026/02/amazon-connect-provides-apis-test-simulate-voice-interactions/>
22. AWS What's New: Amazon Connect adds new generative text-to-speech voices and expands to new regions
   - <https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-connect-adds-generative-text-to-speech-voices/>
23. AWS What's New: Amazon Connect expands agentic speech-to-speech voice experiences to the London region and adds voices
   - <https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-connect-london-europe-region/>
24. Amazon Nova User Guide: Speech
   - <https://docs.aws.amazon.com/nova/latest/userguide/speech.html>
25. Amazon Nova model card: Nova Sonic overview
   - <https://docs.aws.amazon.com/ai/responsible-ai/nova-sonic/overview.html>
26. AWS What's New: Announcing Amazon Nova Sonic, a new speech-to-speech model that brings real-time voice conversations to Amazon Bedrock
   - <https://aws.amazon.com/about-aws/whats-new/2025/04/amazon-nova-sonic-speech-to-speech-conversations-bedrock/>

## Draft writing notes

- Lead with a strict distinction:
  - better speech quality is not the whole story
  - the public stack now exposes runtime and operations choices
- Comparison to make:
  - OpenAI:
    - clear split between speech-to-speech and chained architectures
    - WebRTC or SIP transport
    - prompt design for tone, escalation, and alphanumeric confirmation
  - Google:
    - native audio features like affective dialog and proactive audio
    - VAD, tool use, session resumption, and time-limit handling
  - Microsoft:
    - single interface over multiple model options
    - speech infrastructure extras such as locale breadth, custom voices, avatars, and telephony integration
  - AWS:
    - strongest contact-center operational framing
    - AI agent self-service, escalation to human agents, simulation APIs, and region/voice expansion
- Concrete scenarios to include:
  - contact-center order lookup and refund flow
  - appointment or field-service scheduling by phone
  - multilingual public service or healthcare triage
  - tutoring or guided support where tone matters but handoff still needs a rule
- Explicit cautions:
  - chained audio-text-audio still wins when transcript control and auditability matter most
  - voice quality alone does not solve identity, compliance, or tool safety
  - interruptions, noisy lines, session limits, and language coverage remain operational constraints
  - production rollout needs test harnesses and human escalation paths, not only better models
