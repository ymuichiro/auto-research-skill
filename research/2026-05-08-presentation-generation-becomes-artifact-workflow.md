# 2026-05-08 research memo: presentation generation becomes a materials-and-template workflow

## Article direction

- Date: `2026-05-08`
- Proposed format: `focused article`
- Working thesis:
  - Presentation generation after generative AI is no longer just prompt-to-slide text.
  - The practical unit is an artifact workflow that combines image generation, SVG template assets, brand kits, slide APIs, rendering libraries, review gates, and later editing.
  - The article should explain how these paths differ and why they change actual work patterns.

## Scope expansion

- The earlier draft was too narrow because it emphasized only PptxGenJS.
- The expanded article now compares at least five production patterns:
  - chat-first drafting
  - image-led slide creation
  - SVG-led template generation
  - code-led rendering through PPTX or Slides APIs
  - brand-led presentation tools such as Canva
- It also covers workflow implications:
  - who owns template systems
  - how editability is preserved
  - where review and approval happen
  - why the job shifts toward pipeline design rather than single-deck authorship

## Primary-source inventory

### OpenAI

1. OpenAI API docs: Image generation
   - <https://platform.openai.com/docs/guides/images>
2. OpenAI API reference: Images
   - <https://platform.openai.com/docs/api-reference/images>
3. OpenAI Help Center: Creating images and videos in ChatGPT
   - <https://help.openai.com/en/articles/8932459-creating-images-and-videos-in-chatgpt>
4. OpenAI Docs: Structured Outputs
   - <https://platform.openai.com/docs/guides/structured-outputs>
5. OpenAI Docs: Function calling
   - <https://platform.openai.com/docs/guides/function-calling>

### Microsoft PowerPoint and SVG

6. Microsoft Support: Create a new presentation with Copilot in PowerPoint
   - <https://support.microsoft.com/en-us/office/create-a-new-presentation-with-copilot-in-powerpoint-3222ee03-f5a4-4d27-8642-9c387ab4854d>
7. Microsoft Support: Create a presentation from existing files
   - <https://support.microsoft.com/en-us/topic/create-a-presentation-from-existing-files-beb15deb-3241-4711-a480-9cbd8dc4d755>
8. Microsoft Learn: PowerPoint JavaScript API package
   - <https://learn.microsoft.com/en-us/javascript/api/powerpoint?view=powerpoint-js-1.6>
9. Microsoft Support: Edit SVG images in Microsoft 365
   - <https://support.microsoft.com/en-us/office/edit-svg-images-in-microsoft-365-69f29d39-194a-4072-8c35-dbe5e7ea528c>
10. Microsoft Learn: PowerPoint Add-ins overview
    - <https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/powerpoint-add-ins>
11. Microsoft Learn: Insert slides in PowerPoint
    - <https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/insert-slides-into-presentation>

### Google Slides

12. Google Slides API: Overview
    - <https://developers.google.com/workspace/slides/api/guides/overview>
13. Google Slides API: Create presentations
    - <https://developers.google.com/workspace/slides/api/guides/presentations>
14. Google Slides API: Add and edit text
    - <https://developers.google.com/workspace/slides/api/guides/styling>
15. Google Slides API: Add images
    - <https://developers.google.com/workspace/slides/api/guides/add-image>
16. Google Slides API: Batch update
    - <https://developers.google.com/workspace/slides/api/guides/batch>
17. Google Slides API: Add shapes and text to a slide
    - <https://developers.google.com/workspace/slides/api/guides/add-shape>
18. Google Slides API: Pages, Page Elements, and Properties
    - <https://developers.google.com/workspace/slides/api/concepts/page-elements>

### PptxGenJS

19. PptxGenJS documentation
    - <https://gitbrent.github.io/PptxGenJS/>
20. PptxGenJS: Introduction
    - <https://gitbrent.github.io/PptxGenJS/docs/introduction/>
21. PptxGenJS: Images
    - <https://gitbrent.github.io/PptxGenJS/docs/api-images/>
22. PptxGenJS: Charts
    - <https://gitbrent.github.io/PptxGenJS/docs/api-charts/>
23. PptxGenJS: Tables
    - <https://gitbrent.github.io/PptxGenJS/docs/api-tables/>
24. PptxGenJS: Universal compatibility
    - <https://gitbrent.github.io/PptxGenJS/docs/compatibility/>
25. PptxGenJS: Shapes and schemes
    - <https://gitbrent.github.io/PptxGenJS/docs/shapes-and-schemes.html>
26. PptxGenJS: HTML to PowerPoint
    - <https://gitbrent.github.io/PptxGenJS/docs/html-to-powerpoint/>

### Canva

27. Canva: AI Presentation Maker
    - <https://www.canva.com/create/ai-presentations/>
28. Canva: Multimedia presentation templates
    - <https://www.canva.com/presentations/multimedia-presentations/>
29. Canva: Brand Kit for teams
    - <https://www.canva.com/pro/brand-kit/>
30. Canva: Brand management tools
    - <https://www.canva.com/solutions/brand-management-tools/>
31. Canva: SVG converter
    - <https://www.canva.com/features/svg-converter/>

### Adobe Firefly

32. Adobe Firefly API: Overview
    - <https://developer.adobe.com/firefly-services/docs/firefly-api/>
33. Adobe Firefly API: Generate Image tutorial
    - <https://developer.adobe.com/firefly-services/docs/firefly-api/guides/how-tos/firefly-generate-image-api-tutorial/>
34. Adobe Firefly API: Custom Models Generate Image tutorial
    - <https://developer.adobe.com/firefly-services/docs/firefly-api/guides/how-tos/cm-generate-image/>
35. Adobe Firefly API: Image Upload
    - <https://developer.adobe.com/firefly-services/docs/firefly-api/guides/concepts/image-upload/>
36. Adobe Firefly API: Style Image Reference
    - <https://developer.adobe.com/firefly-services/docs/firefly-api/guides/concepts/style-image-reference/>
37. Adobe Firefly API: Getting Started
    - <https://developer.adobe.com/firefly-services/docs/firefly-api/getting-started/>
38. Adobe Firefly API: Using the Generate Image API with Image5
    - <https://developer.adobe.com/firefly-services/docs/firefly-api/guides/how-tos/cm-generate-image/feature-guide>
39. Adobe Firefly API: Using the Firefly Asynchronous API
    - <https://developer.adobe.com/firefly-services/docs/firefly-api/guides/how-tos/using-async-apis/>

### Papers

40. PPTAgent: Generating and Evaluating Presentations Beyond Text-to-Slides
    - <https://arxiv.org/abs/2501.03936>
41. PreGenie: An Agentic Framework for High-quality Visual Presentation Generation
    - <https://arxiv.org/abs/2501.08280>
42. DeepPresenter: Environment-Grounded Reflection for Agentic Presentation Generation
    - <https://arxiv.org/abs/2507.12865>
43. SlideBot: A Multi-Agent Framework for Generating Informative and Reliable Multi-Modal Presentations
    - <https://arxiv.org/abs/2508.04203>

## Writing notes

- Do not center the article on a single library.
- Explain at least five routes and show why each exists.
- Include the work-pattern shift:
  - template ownership
  - asset curation
  - human review
  - pipeline maintenance
- Make the article concrete with use cases:
  - sales, research, product launches, internal reports, recruiting, training
- Keep the Japanese and English versions aligned in scope and caution level.
