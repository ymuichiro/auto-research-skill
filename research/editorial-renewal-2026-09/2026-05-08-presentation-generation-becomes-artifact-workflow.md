# 2026-05-08-presentation-generation-becomes-artifact-workflow

診断: 五経路と四カードの不整合、39件と42件の数不整合。SVG挿入と要素編集を混同。制作職種が変わる断定を支える調査なし。
問い: 更新する資料で、画像/ベクター/ネイティブ要素をどう選ぶか。
構成: 数値修正の例→素材の編集単位→PPTXとSlidesの制約→生成研究と評価→選択と検証。

## 調査インベントリ
- OpenAI API docs: Image generation https://platform.openai.com/docs/guides/images
- OpenAI API reference: Images https://platform.openai.com/docs/api-reference/images
- OpenAI Help Center: Creating images and videos in ChatGPT https://help.openai.com/en/articles/8932459-creating-images-and-videos-in-chatgpt
- OpenAI Docs: Structured Outputs https://platform.openai.com/docs/guides/structured-outputs
- OpenAI Docs: Function calling https://platform.openai.com/docs/guides/function-calling
- Microsoft Support: Create a new presentation with Copilot in PowerPoint https://support.microsoft.com/en-us/office/create-a-new-presentation-with-copilot-in-powerpoint-3222ee03-f5a4-4d27-8642-9c387ab4854d
- Microsoft Support: Create a presentation from a file with Copilot in PowerPoint https://support.microsoft.com/en-us/topic/create-a-presentation-from-existing-files-beb15deb-3241-4711-a480-9cbd8dc4d755
- Microsoft Learn: PowerPoint JavaScript API overview https://learn.microsoft.com/en-us/office/dev/add-ins/reference/overview/powerpoint-add-ins-reference-overview
- Microsoft Learn: PowerPoint Add-ins overview https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/powerpoint-add-ins
- Microsoft Learn: PowerPoint JavaScript API package https://learn.microsoft.com/en-us/javascript/api/powerpoint?view=powerpoint-js-1.6
- Microsoft Support: Edit SVG images in Microsoft 365 https://support.microsoft.com/en-us/office/edit-svg-images-in-microsoft-365-69f29d39-194a-4072-8c35-dbe5e7ea528c
- Microsoft Learn: Insert slides in PowerPoint https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/insert-slides-into-presentation
- Google Slides API: Overview https://developers.google.com/workspace/slides/api/guides/overview
- Google Slides API: Create presentations https://developers.google.com/workspace/slides/api/guides/presentations
- Google Slides API: Add and edit text https://developers.google.com/workspace/slides/api/guides/styling
- Google Slides API: Add images https://developers.google.com/workspace/slides/api/guides/add-image
- Google Slides API: Batch update https://developers.google.com/workspace/slides/api/guides/batch
- Google Slides API: Add shapes and text to a slide https://developers.google.com/workspace/slides/api/guides/add-shape
- Google Slides API: Pages, Page Elements, and Properties https://developers.google.com/workspace/slides/api/concepts/page-elements
- PptxGenJS documentation https://gitbrent.github.io/PptxGenJS/
- PptxGenJS: Images https://gitbrent.github.io/PptxGenJS/docs/api-images/
- PptxGenJS: Charts https://gitbrent.github.io/PptxGenJS/docs/api-charts/
- PptxGenJS: Tables https://gitbrent.github.io/PptxGenJS/docs/api-tables/
- PptxGenJS: Introduction https://gitbrent.github.io/PptxGenJS/docs/introduction/
- PptxGenJS: Universal compatibility https://gitbrent.github.io/PptxGenJS/docs/compatibility/
- PptxGenJS: Shapes and schemes https://gitbrent.github.io/PptxGenJS/docs/shapes-and-schemes.html
- PptxGenJS: HTML to PowerPoint https://gitbrent.github.io/PptxGenJS/docs/html-to-powerpoint/
- Canva: AI Presentation Maker https://www.canva.com/create/ai-presentations/
- Canva: Multimedia presentation templates https://www.canva.com/presentations/multimedia-presentations/
- Canva: Brand Kit for teams https://www.canva.com/pro/brand-kit/
- Canva: Brand management tools https://www.canva.com/solutions/brand-management-tools/
- Canva: SVG converter https://www.canva.com/features/svg-converter/
- Adobe Firefly API: Overview https://developer.adobe.com/firefly-services/docs/firefly-api/
- Adobe Firefly API: Generate Image tutorial https://developer.adobe.com/firefly-services/docs/firefly-api/guides/how-tos/firefly-generate-image-api-tutorial/
- Adobe Firefly API: Custom Models Generate Image tutorial https://developer.adobe.com/firefly-services/docs/firefly-api/guides/how-tos/cm-generate-image/
- Adobe Firefly API: Image Upload https://developer.adobe.com/firefly-services/docs/firefly-api/guides/concepts/image-upload/
- Adobe Firefly API: Style Image Reference https://developer.adobe.com/firefly-services/docs/firefly-api/guides/concepts/style-image-reference/
- Adobe Firefly API: Getting Started https://developer.adobe.com/firefly-services/docs/firefly-api/getting-started/
- PPTAgent: Generating and Evaluating Presentations Beyond Text-to-Slides https://arxiv.org/abs/2501.03936
- PreGenie: An Agentic Framework for High-quality Visual Presentation Generation https://arxiv.org/abs/2501.08280
- DeepPresenter: Environment-Grounded Reflection for Agentic Presentation Generation https://arxiv.org/abs/2507.12865
- SlideBot: A Multi-Agent Framework for Generating Informative and Reliable Multi-Modal Presentations https://arxiv.org/abs/2508.04203

## 改稿と再確認
日英を4節に再構成。SVGの拡大/色変更と個別要素編集を区別。GoogleのCreateImageRequestのPNG/JPEG/GIF制約を原文で確認。PPTAgentは2025年2月v3に固定し、企業での修正時間の根拠に転用しない。API文書は更新されるため製品発売時期や全環境での互換性は主張しない。週次報告は想定例として明記。20件超の候補は上記に保存、本文採用は4件。再読で、コード出力成功と納品先での編集成功を区別した。
