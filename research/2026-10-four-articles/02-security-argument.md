# Security article argument

Question: What makes AI-generated security findings and patches useful in normal development?

Thesis: A maintainable repair pipeline combines reachable-path evidence, minimal reproduction, root-cause repair and regression validation, then hands a reviewable change to the maintainer.

1. Google September 2026 infrastructure report: change-based presubmit context, structural triage and human-reviewed repair make security part of daily development. Self-reported scale does not establish general precision.
2. Mozilla March 2026 maintainer report: minimal tests let engineers confirm reports and ship fixes in Firefox 148. Discovery was AI-assisted; repair acceptance and release involved people.
3. CodeMender: XML stack-management example explains why crash location differs from cause. Tool diversity supports verification; 72 upstream fixes lacks an all-attempt denominator.
4. GitHub: July preview opens draft PRs after iterative CodeQL validation. Current docs limit assurance for custom/security-extended queries and third-party tools.
5. PatchBench: 11-agent C/C++ comparison reports 1.83x inflation from PoC-only validation. Benchmark result cannot become a universal production error rate.
6. DARPA synthetic/non-synthetic results and CyberGymE2E illustrate evidence boundaries. Report discovery, reproduction, acceptance and shipment separately.
7. Proposed project rollout: use an existing alert class, retain all attempts, compare reviewer time and regressions with current handling. Failures and negative results remain in the denominator.

Editorial: Keep the author interpretation explicit. No offensive instructions or exploit payloads. Japanese and English have the same claims and limits.
