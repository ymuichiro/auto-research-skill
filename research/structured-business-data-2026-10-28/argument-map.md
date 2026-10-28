# Structured business data article

Cutoff: 2026-10-28. Focused weekly article, not a roundup.

Question: How does adding structured predictive models change what an enterprise agent can do beyond retrieving company documents?

Thesis: An enterprise agent can combine cited policy, verified past aggregates and explicitly defined predictions, provided the prediction preserves relationships and time and is evaluated as a prediction before any business action. Kumo makes this separation concrete; it does not prove autonomous decisions produce business benefit.

1. October 21 Agent Toolkit positions retrieval and predictive models together. Four families have different first-release histories (Tabular September 29, Anomaly June 29, Forecast model card pre-October ambiguous numeric date). Do not say all four launched October 21.
2. Documents explain policy, SQL measures recorded events, structured models estimate unknown outcomes. Hypothetical customer-follow-up question illustrates different outputs; it is not an observed customer deployment.
3. Tabular takes labeled rows; Relational adds linked records. KumoRFM-2 and model cards describe row/relational message passing and contextual prediction, not retraining on every task. Meaningful keys, outcome definition and observation cutoffs remain.
4. AdventureWorks public notebook is the concrete reference: four tables, future 90-day absence of orders; NIM endpoint and files required. We inspect docs only, no inference or enterprise trial. Forecast and Anomaly are separate task families, not interchangeable churn solutions.
5. Benchmarks support trying the methods, not universal displacement of boosted trees. RelBench, TabArena, BeyondArena, TabReliBench expose different comparison dimensions. TabReliBench does not test Kumo and cannot refute/validate its particular probabilities.
6. Author recommendation: first propose a dated ranked follow-up list, compare fixed baselines and calibration/capacity, then evaluate intervention separately. Probability is not a causal explanation; contacted customers need not be those most helped by contact. This is reasoning, not a vendor-tested policy.

Limits: no independent end-to-end enterprise outcome proof in inspected sources; no local model execution, latency, cost or Japanese query quality measurement; no automatic permissions or causality guarantee from ICL. Avoid legal/license clearance claims; identify weights and runtime routes accurately.

Source inventory: 31 primary URLs, research gate met before drafting. Only sources that support body claims go into public metadata.
