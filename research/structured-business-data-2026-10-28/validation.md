# Prepublication validation

PASS: pnpm build (includes content and illustration validation).
PASS: pnpm verify:illustrations (50 distinct assets, provenance, dimensions and SSR mappings).
PASS: article QA in Chromium and WebKit, Japanese and English, widths 360/390/768/1440 (16 cases); canonical, indexability, no page errors, hero decode, figure width, no horizontal overflow.
PASS: visual inspection of 390/1440 article opening, mobile comparison table and process list, listing and topic preview. Added separators to step labels after inspection.
PASS: source link sets match between Japanese and English; source inventory 31 primary URLs, 22 selected in public metadata.
PASS: git diff --check.
PASS: pnpm test:authoring (scaffold, preview, save and automatic rebuild).
PASS: node scripts/test-indexability.mjs on restored public build (106 canonical pages and 12 startup cases).
PENDING at this prepublication snapshot: full-site illustration browser test and final article QA, PR CI, merge, deployment, public byte verification and local branch cleanup. Publication evidence will be recorded under output/structured-business-data-2026-10-28/.

Pre-existing package.json and unrelated untracked research/output are excluded from this change. See research-limits.md for documentation vs runtime evidence.

Initial concurrent runs of illustration/indexability tests failed while test:authoring rewrote public/ for a draft preview. This was a test orchestration error. The public build was restored and affected checks rerun without concurrent build mutation; no product code or checks were weakened.
