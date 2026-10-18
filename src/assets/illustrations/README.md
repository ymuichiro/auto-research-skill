# Content illustrations

Forty article illustrations and seven separate category illustrations, generated individually with the built-in `image_gen` tool. No stock images or third-party product screenshots are used. Japanese and English versions of the same article intentionally share its image; different articles and categories never share an image.

`manifest.json` records each article/category identifier, its intended scene, the generation prompt, the final source PNG filename, the delivered WebP path and SHA-256. Original generated PNGs remain in the local generated-images directory. Delivery files are 1200 × 800 WebP (quality 86) and are checked by `pnpm verify:illustrations`.

These are explanatory editorial illustrations, not screenshots, experimental results, or literal depictions of vendor products. Article text and original evidence diagrams are retained. The same article image appears in its listing preview, topic preview, opening chapter, and print/indexing HTML. Seven category-specific images appear in the topic selector.

Three targeted image revisions were made after visual inspection: the shopping illustration's payment card was made unbranded, and the on-device illustration's external cable was removed so local processing is not confused with cloud upload. The first-draft collaboration illustration was regenerated as an editable business proposal, avoiding an unrelated landscape-art example. Their final source files and edit instructions are recorded in the manifest.

When publishing a new article or category, generate and register a dedicated image rather than using a generic fallback. Draft preview can omit an illustration; production validation requires one for every published article and category.
