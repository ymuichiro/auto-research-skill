# 2026-09-21 research memo: Jev and the decision API

## Article direction

- Date: `2026-09-21`
- Proposed format: `focused article`
- Working title:
  - JA: `LLMはすべてのif文を置き換えるのか。Jevが切り出す「判断API」`
  - EN: `Will LLMs replace every if statement? Jev and the case for a decision API`
- Central question:
  - When software needs a small, ambiguous judgment rather than prose or extended reasoning, what changes if that judgment is a first-class AI API primitive?
- Working thesis:
  - Jev's novelty is not that zero-shot classification, structured output, probability estimates, or rejection of uncertain cases are individually new.
  - It packages them as a product contract: unstructured state in, application-defined closed decisions and probabilities out, with code retaining the authority to act.
  - That can move a portion of classifier construction from task-specific model training into question, rubric, evaluation, threshold, and workflow design.
  - It does not remove evaluation, domain ownership, deterministic checks, or human review for high-cost mistakes.

## Evidence-led argument map

| Claim needed for the article | Primary evidence | Mechanism or comparison | Article conclusion and limit |
| --- | --- | --- | --- |
| Jev has a distinct output contract | TypeSafe launch, API, primitives, and System One docs | Choice, Score, and Noul return defined answers and probabilities instead of prose | This supports calling the product a decision API; the term is the article's interpretation, not an established category. |
| The BERT-versus-LLM framing needs qualification | BERT, zero-shot classification, and GPT-3 papers | Fine-tuning, zero-shot classification, and in-context use all predate Jev | The useful comparison is between implementation work patterns, not a claim that Jev invented zero-shot classification. |
| Structured Outputs is a credible alternative | OpenAI Structured Outputs announcement | Schema adherence controls output shape for a generative model | Schema conformance does not establish that the judgment is semantically correct or calibrated. |
| Confidence changes routing design, not permission | TypeSafe confidence and intent-routing docs; calibration and selective-classification papers | Apply thresholds, abstain, and route to deterministic code or people | Calibration is population-level and task-specific; thresholds require local evaluation and risk choices. |
| Jev is not a universal replacement | TypeSafe jaggedness and model docs | It is text-only and documents weaknesses in arithmetic, dates, indirection, irrelevant state, and adversarial input | A production comparison must include rules, an existing classifier, an LLM with Structured Outputs, and human review on the same evaluation set. |

## Primary-source inventory

### TypeSafe AI and Jev

1. TypeSafe AI: Introducing System One Models & Jev
   - <https://typesafe.ai/blog/introducing-system-one-models-and-jev>
2. TypeSafe AI: Home
   - <https://typesafe.ai/>
3. TypeSafe AI Docs: Introduction
   - <https://docs.typesafe.ai/introduction>
4. TypeSafe AI Docs: System One
   - <https://docs.typesafe.ai/concepts/system-one>
5. TypeSafe AI Docs: State
   - <https://docs.typesafe.ai/concepts/state>
6. TypeSafe AI Docs: Primitives
   - <https://docs.typesafe.ai/primitives>
7. TypeSafe AI Docs: Choice
   - <https://docs.typesafe.ai/primitives/choice>
8. TypeSafe AI Docs: Score
   - <https://docs.typesafe.ai/primitives/score>
9. TypeSafe AI Docs: Noul
   - <https://docs.typesafe.ai/primitives/noul>
10. TypeSafe AI Docs: Confidence
    - <https://docs.typesafe.ai/confidence>
11. TypeSafe AI Docs: How to build with System One
    - <https://docs.typesafe.ai/concepts/how-to-build-with-system-one>
12. TypeSafe AI Docs: Patterns
    - <https://docs.typesafe.ai/patterns>
13. TypeSafe AI Docs: Speculative fan-out
    - <https://docs.typesafe.ai/patterns/fan-out>
14. TypeSafe AI Docs: Confidence-gated routing
    - <https://docs.typesafe.ai/patterns/confidence-routing>
15. TypeSafe AI Docs: Composite scoring
    - <https://docs.typesafe.ai/patterns/composite-scoring>
16. TypeSafe AI Docs: Intent routing
    - <https://docs.typesafe.ai/patterns/intent-routing>
17. TypeSafe AI Docs: API reference
    - <https://docs.typesafe.ai/api>
18. TypeSafe AI Docs: Models
    - <https://docs.typesafe.ai/models>
19. TypeSafe AI Docs: Jev 1.13 jaggedness
    - <https://docs.typesafe.ai/model-jaggedness/jev-1.13>
20. TypeSafe AI: Workflow evals
    - <https://evals.typesafe.ai/>

### Structured output and general-purpose language models

21. OpenAI: Introducing Structured Outputs in the API
    - <https://openai.com/index/introducing-structured-outputs-in-the-api/>
22. OpenAI API Docs: Structured Outputs
    - <https://developers.openai.com/api/docs/guides/structured-outputs>
23. Language Models are Few-Shot Learners
    - <https://arxiv.org/abs/2005.14165>

### Classification, zero-shot learning, calibration, and abstention

24. BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding
    - <https://arxiv.org/abs/1810.04805>
25. Benchmarking Zero-shot Text Classification: Datasets, Evaluation and Entailment Approach
    - <https://aclanthology.org/D19-1404/>
26. On Calibration of Modern Neural Networks
    - <https://arxiv.org/abs/1706.04599>
27. Revisiting the Calibration of Modern Neural Networks
    - <https://arxiv.org/abs/2106.07998>
28. Selective Classification for Deep Neural Networks
    - <https://arxiv.org/abs/1705.08500>
29. SelectiveNet: A Deep Neural Network with an Integrated Reject Option
    - <https://arxiv.org/abs/1901.09192>

## Claims deliberately narrowed or removed

- Do not call Jev the first zero-shot classifier. Zero-shot text classification is an established research setting.
- Do not say that Structured Outputs is insufficient. It solves schema adherence and remains a valid alternative when one generative model should also reason, extract, or explain.
- Do not equate type-safe output with factual correctness, robust security, calibrated probabilities for a local domain, or authorization to act.
- Do not present TypeSafe's workflow evaluation as an independent benchmark. It is useful evidence of the vendor's intended workload decomposition and methodology, with declared limitations.
- Do not say that Jev removes the ML lifecycle. It may remove task-specific retraining from the first integration, while moving decision definitions, evaluation, thresholds, and exception handling into application work.

## Publication gate and residual evidence limits

- Research inventory: 29 primary URLs collected.
- Public copy uses only official TypeSafe and OpenAI sources plus papers.
- The article remains a draft. It has not been published, committed, pushed, or verified on the public site.
- No independent task-level benchmark has been run with Jev, a structured-output LLM, and a fine-tuned classifier on the same production dataset. The draft therefore makes no vendor-neutral accuracy or cost ranking.
