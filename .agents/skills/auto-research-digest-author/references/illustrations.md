# Article and category illustrations

Read this before publishing a new article, adding a category, or replacing an illustration. All paths are relative to the active repository checkout.

## Required outcome

- Every published article has an individually generated, content-specific illustration. Japanese and English versions of that same article share it.
- Every category has a separate generated image. Do not use a category image as an article image, reuse another article's image, or make different crops of one image appear to be separate illustrations.
- A draft can be previewed without an image. Do not publish until the dedicated image is registered and verified. Small copy edits do not require regeneration; a changed subject or thesis requires checking whether the image still fits.

## Design from the argument

Read the article's thesis, concrete example, and relevant mechanism before prompting. Decide what the reader should understand from the picture. Prefer a few recognizable objects with a clear relationship: shopping → spending limit → approval → payment → return, candidate search → experimental validation, or external instruction → permission boundary → allowed action.

Preserve the current aesthetic: mainly matte white, pale cyan and muted mint, soft shadows, limited translucent edges, a clean background, and shallow spatial depth. Avoid generic floating cubes, decorative circuitry, a robot added merely to signify AI, and unrelated office or landscape scenes. Inspect nearby article and category images to keep a coherent style without repeating their composition.

These are conceptual editorial illustrations, not actual product screenshots, experimental observations, or vendor claims. Do not invent measured results, reproduce logos, or imply the wrong mechanism. For example, an on-device processing image must not show data being uploaded to a cloud. Check small details such as unintended payment-brand marks. No embedded text or vendor logos are needed.

## Generate, inspect, and register

1. Use the available `imagegen` skill and the built-in image generation tool. Generate one dedicated asset per article/category. Use no stock images, third-party screenshots, screenshot-as-illustration substitutes, or hand-drawn code placeholders. If the built-in tool is unavailable, follow its skill's fallback rules; do not silently substitute an existing image or claim completion.
2. Inspect the actual generated image at full size and at a small thumbnail size. Fix unclear relationships, misleading connections, unintended logos/text, and unrelated scenery with the image tool. Save the original generated PNG; do not depend on temporary paths as the project's asset store.
3. Deliver a **1200 × 800 WebP**, quality **86**, preserving the whole composition. The existing conversion uses Sharp `resize(1200, 800, {fit:'contain', background:'#f0f6f7'}).webp({quality:86})`. Each delivered image must stay below the current 250,000-byte validation limit.
4. Save article artwork at `src/assets/illustrations/article/<YYYY-MM-DD>-<slug>.webp`. Its identifier is the article directory name (`sourceDirName`), not the title or bare slug. Save category artwork at `src/assets/illustrations/category/<category-id>.webp`; use the actual topic ID from the generated catalog or topic-hub code, not a guessed English label.
5. Add or update the corresponding item in `src/assets/illustrations/manifest.json`, preserving other items:

```json
{
  "kind": "article",
  "id": "YYYY-MM-DD-slug",
  "title": "Article title",
  "teaser": "Optional article teaser",
  "scene": "What the objects and relationships explain",
  "prompt": "The actual generation prompt",
  "sourceFile": "The final generated source PNG filename",
  "sha256": "SHA-256 of the delivered WebP bytes",
  "file": "article/YYYY-MM-DD-slug.webp"
}
```

For a category, use `kind: "category"`, the actual category ID, and `file: "category/<category-id>.webp"`. Record material image edits in `revision` and retain the prompt that explains the final design. Compute `sha256` from the final WebP, not the source PNG. Do not copy a hash or claim provenance from an unrelated image.

The shared implementation reads this registry: `scripts/lib/spatial-site.mjs` supplies catalog paths, `scripts/build.mjs` copies files, and the shared renderer/runtime inserts the image into the listing, topic article preview, article opening, and indexing/print HTML. Category images appear in the topic selector. **Do not manually add another copy to `body.ja.html` or `body.en.html`, edit generated `public/` files, or change shared styling for an ordinary article addition.**

## Verification and publication

Run from the active checkout, using the shell-command prefix required by its instructions:

```sh
rtk proxy pnpm build
rtk proxy pnpm verify:illustrations
rtk proxy pnpm test:illustrations
```

`pnpm build` already runs the image verifier as part of validation. The verifier checks published-article/category coverage, registry paths, source provenance fields, distinct image hashes, dimensions, file sizes, Japanese/English mappings, and indexing/print HTML. Do not weaken the checks to publish an article without its image.

`pnpm test:illustrations` opens all published articles and categories in Chromium and WebKit at PC and smartphone widths. Also visually inspect the new article's opening and listing preview, its topic preview, and any new category image. Automated checks do not establish that a picture expresses the article's meaning. Save representative screenshots; ensure the image fits without cropping important objects and does not obscure text or prevent chapter scrolling. Use the existing local preview or start one through the repository's normal preview workflow.

If publication is requested, include the WebP files and registry changes with the article commit. After the approved publish workflow and successful deployment, verify the public article and its generated image URL. The existing `pnpm verify:public` includes registered image assets; point it at the configured production URL when checking production. A local image or HTTP 200 alone does not establish correct public delivery. Report local and production checks separately.
