# Commerce article argument

Question: How does a shopping request become an authorized, traceable purchase?

Thesis: Useful shopping agents connect product selection to a merchant-authoritative checkout, explicitly bounded purchase/payment authorization, and order records that continue through delivery and returns.

1. Google UCP launch and UCP concepts reduce bespoke commerce integration through shared capabilities; merchants retain inventory, pricing and order responsibility. Compatible protocols do not make every platform interoperable automatically.
2. ACP architecture and lifecycle distinguish recommendation, checkout, payment-in-progress and completed order. Merchant state is authoritative; model narration is not confirmation.
3. AP2 v0.2 binds Checkout and Payment Mandates to the same checkout. Trusted consent UI and validation are deterministic; authorization does not establish product suitability.
4. AP2 open constraints authorize autonomous purchases; closed mandates prove a particular action. Item/merchant and amount/currency constraints can be checked. Natural-language preference interpretation remains a separate quality problem.
5. Stripe SPT is a concrete constrained credential implementation; issuance is not payment completion. Extra customer authentication may still be necessary.
6. Clearly hypothetical jacket purchase explains total-price changes, unresolved preferences, renewed consent and ambiguous timeout handling. It is not a deployed experiment or normative universal policy.
7. UCP order and ACP webhooks carry delivery/refund information. Confirmed purchase, promised delivery, actual delivery and refund completion are different facts.
8. Author proposes evaluation through complete purchases and recovery paths, retaining failed attempts and comparison with existing checkout. No conversion/time/privacy superiority claim is made.
