---
title: Generate UI test prompt from video
description: Convert a UI flow (video or description) into a reusable test-generation prompt
owner: QA
tags: [prompt, ui, video, playwright, bdd]
---

# UI Prompt Generator (from video)

Context:
We have a web application that is tested using:
- Playwright
- BDD (Gherkin)
- Page Object Model

Goal:
Generate a NEW prompt file that can later be used to generate:
1. A BDD feature file
2. Step definitions
3. Page Objects

Input:
- The user provides:
  - A screen recording (or screenshots) of a happy flow
  - Optionally a short textual explanation of the business flow

Instructions:
- Use the video only to understand the user journey and business flow
- Do NOT infer selectors from the video
- Do NOT include raw UI click steps
- Convert the flow into business-oriented Gherkin steps written in English. Steps must be specific and explicit: use concrete placeholders or values (for example: `When the user adds the product "Blue T-Shirt" to the cart`), not generic statements like "add a product".
- Propose missing data-test-id selectors if needed
- Assume Playwright + BDD style (see playwright-bdd-style.md)

The generated prompt must include:
- Valid YAML frontmatter at the very top of the file (first line must be `---`, not inside a code block)
  - Required fields: `title`, `description`, `owner`, `tags`
- Context
- Goal
- Flow description (business steps)
- Pages involved
- Optional selectors (as placeholders)
- Constraints (framework rules)
- Output file locations
 - Note: All Gherkin steps in the generated feature must be in English and use specific, testable phrasing or clear placeholders.

Constraints:
- Follow ai-instructions.md
- Follow playwright-bdd-style.md
- Use Page Object Model
- No hardcoded secrets
- No Cypress
- Steps must be reusable
 - Steps must be written in English and be specific (avoid vague/generic step text)

Output:
- A new prompt file in: ai/prompts/e2e/<scenario-name>.prompt.md