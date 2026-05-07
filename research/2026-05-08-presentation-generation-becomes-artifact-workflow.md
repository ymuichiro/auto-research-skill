# 2026-05-08 research memo: presentation generation becomes an artifact workflow

## Article direction

- Date: `2026-05-08`
- Proposed format: `focused article`
- Working thesis:
  - Presentation generation after generative AI is no longer best understood as prompt-to-slide text.
  - The stronger frame is an artifact workflow: structure, copy, generated imagery, layout, PPTX or Slides rendering, editability, review, and repeatability.
  - The topic has enough primary-source depth as a focused article because official docs and papers cover image generation, structured output, PowerPoint/Slides APIs, PptxGenJS rendering, and presentation-specific generation/evaluation research.

## Recent-title check

- Recent titles focus on agent governance, discovery, continuity, coding runtime, memory, and voice systems.
- This article should avoid another "is shifting" title and should state the comparison axis directly.
- Final title direction:
  - Japanese: `生成AI後のプレゼン資料生成は、文章生成ではなく成果物工程の設計問題になった`
  - English: `Presentation generation after generative AI is now an artifact workflow problem, not a text-generation feature`

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

### Microsoft PowerPoint and Copilot

6. Microsoft Support: Create a new presentation with Copilot in PowerPoint
   - <https://support.microsoft.com/en-us/office/create-a-new-presentation-with-copilot-in-powerpoint-3222ee03-f5a4-4d27-8642-9c387ab4854d>
7. Microsoft Support: Create a presentation from a file with Copilot in PowerPoint
   - <https://support.microsoft.com/en-us/topic/create-a-presentation-from-existing-files-beb15deb-3241-4711-a480-9cbd8dc4d755>
8. Microsoft Learn: PowerPoint JavaScript API overview
   - <https://learn.microsoft.com/en-us/office/dev/add-ins/reference/overview/powerpoint-add-ins-reference-overview>
9. Microsoft Learn: PowerPoint Add-ins overview
   - <https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/powerpoint-add-ins>
10. Microsoft Learn: PowerPoint JavaScript API package
    - <https://learn.microsoft.com/en-us/javascript/api/powerpoint?view=powerpoint-js-1.6>
11. Microsoft Learn: Insert slides in PowerPoint
    - <https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/insert-slides-into-presentation>

### Google Slides API

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

### PptxGenJS and Firefly Services

17. PptxGenJS documentation
    - <https://gitbrent.github.io/PptxGenJS/>
18. PptxGenJS: Images
    - <https://gitbrent.github.io/PptxGenJS/docs/api-images/>
19. PptxGenJS: Charts
    - <https://gitbrent.github.io/PptxGenJS/docs/api-charts/>
20. PptxGenJS: Tables
    - <https://gitbrent.github.io/PptxGenJS/docs/api-tables/>
21. PptxGenJS: HTML to PowerPoint
    - <https://gitbrent.github.io/PptxGenJS/docs/html-to-powerpoint/>
22. Adobe Firefly API: Quickstart
    - <https://developer.adobe.com/firefly-services/docs/firefly-api/guides/>
23. Adobe Firefly Services: API reference
    - <https://developer.adobe.com/firefly-services/docs/firefly-api/api/>

### Papers

24. PPTAgent: Generating and Evaluating Presentations Beyond Text-to-Slides
    - <https://arxiv.org/abs/2501.03936>
25. PreGenie: An Agentic Framework for High-quality Visual Presentation Generation
    - <https://arxiv.org/abs/2501.08280>
26. DeepPresenter: Environment-Grounded Reflection for Agentic Presentation Generation
    - <https://arxiv.org/abs/2507.12865>
27. SlideBot: A Multi-Agent Framework for Generating Informative and Reliable Multi-Modal Presentations
    - <https://arxiv.org/abs/2508.04203>

## Draft writing notes

- Lead with the distinction between prompt-to-slide text and artifact workflow.
- Compare two practical routes:
  - in-app generation such as Copilot in PowerPoint for fast drafts
  - programmatic rendering with PptxGenJS, PowerPoint APIs, or Google Slides APIs for repeated deck types
- Treat image generation as a slide component layer, not an evidence layer.
- Use structured output as the slide blueprint: title, key points, visual type, image prompt, evidence, notes.
- Evaluation should include correctness, visual/layout quality, editability, and operational repeatability.
