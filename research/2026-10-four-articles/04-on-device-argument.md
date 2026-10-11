# On-device article argument

Question: Which concrete native-app tasks should use on-device LLMs, and how can their value be established?

Thesis: Task-scoped summarization, extraction and classification become useful app functions when typed outputs connect to native UI, availability/fallback is explicit, and quality, latency and complete data paths are evaluated per feature.

1. Apple task docs and ML Kit feature APIs support a task-first choice. Generic chat capability is not a feature-quality measurement.
2. AFM3 Core and Core Advanced show that total parameters and active parameters differ. Model-family announcements do not establish which models each app API exposes.
3. ML Kit Prompt API is flexible but requires custom prompting and quality work; feature APIs constrain output. Summarization supports Japanese but actual device/language configuration still needs checks.
4. Apple guided generation and Android structured output connect to typed native values. Output shape does not establish correct dates, names or other semantics. Android Prompt beta and Structured Output alpha are distinct stages.
5. Clearly hypothetical note-to-calendar scenario separates extraction, displayed source evidence, human correction and actual save outcome.
6. On-device inference can avoid sending input to a model server; tool calls, analytics and cloud model/profile changes can still send data elsewhere. Framework identity alone cannot establish full local processing.
7. Apple availability and Nano downloads/quota/foreground constraints require fallback. Support declarations differ from current readiness. No silent cloud fallback for a feature promised local-only.
8. Google task evaluation and Apple Evaluations/Instruments support feature metrics; author proposes Japanese ambiguity cases, all attempts, total latency, initial download/warmup and real-device battery checks. No unperformed benchmark claimed.
