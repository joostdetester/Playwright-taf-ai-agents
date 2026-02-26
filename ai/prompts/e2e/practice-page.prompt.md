---
title: Automation practice page (from video)
description: Generate Playwright-BDD feature/steps/page objects for the UI flow captured in specs/letsshop/videos/practice-page.mp4 (Rahul Shetty Academy AutomationPractice)
owner: team-qa
tags: [prompt, ui, video, playwright, bdd, e2e, practice]
---

# UI test generation prompt — practice page

## Context
We test a web application using:
- Playwright
- BDD (Gherkin)
- Page Object Model
- TypeScript

Input video:
- `specs/letsshop/videos/practice-page.mp4`

The application shown in the video is the Rahul Shetty Academy "AutomationPractice" page (a UI playground page with form inputs, autocomplete, alerts, tables, and an embedded iframe).

## Goal
Generate the following artifacts for this flow:
1. A BDD feature file (Gherkin) in English
2. Step definitions in TypeScript (thin steps)
3. Page Objects (POM)

## Observed happy flow (business steps)
Use the video only to understand the journey. Do not infer CSS/XPath selectors from the video.

### Business flow narrative
1. The user opens the automation practice page.
2. The user enters a name in the form.
3. The user selects a radio option.
4. The user selects one or more checkboxes.
5. The user selects a value from a static dropdown.
6. The user selects a country from an autocomplete/typeahead field (must commit a suggestion, not just a typed prefix).
7. The user opens a related page in a new tab/window and verifies it loads.
8. The user triggers a browser alert/confirm dialog that includes their name and accepts it.
9. The user validates a row/value in the web table.
10. The user switches into the embedded iframe and validates that expected content is visible.

### Concrete data to use as examples/placeholders
- Name: "Joost"
- Autocomplete country: "India" (use a real suggestion that exists in the typeahead)
- Dropdown selection: "Option2" (or another explicit option shown in the UI)
- Checkboxes: "Option1" and "Option3" (or the exact labels shown)

Notes:
- Do not rely on exact URLs for the newly opened tab/window; assert stable page text/title instead.
- Do not assert on dynamic content or brittle timing; avoid hard waits.

## Pages / screens involved
Model these as Page Objects:
- Practice page (AutomationPractice) — main flow
- External destination page opened in a new tab/window (if the flow opens one)

The iframe section can be implemented as part of the Practice Page Object (as a scoped frame locator helper) unless the repo conventions prefer a separate page object.

## Gherkin requirements
- All steps MUST be written in English.
- Steps must be specific and explicit (use concrete values like "Joost", "India", etc.).
- Avoid UI-mechanics wording such as "click" or "type"; describe business intent.
- Use Given / When / Then.

### Proposed feature structure
Create a feature with a single happy-path scenario, for example:
- Feature: automation practice page
- Scenario: user completes the practice form and validates key UI behaviors

Suggested step wording (example; refine to match the exact video):
- Given the user is on the automation practice page
- When the user enters the name "Joost"
- And the user selects the radio option "Radio2"
- And the user selects the checkboxes:
  - "Option1"
  - "Option3"
- And the user selects "Option2" from the dropdown
- And the user selects country "India" from the autocomplete
- And the user opens the related academy page in a new browser tab
- Then the related academy page should be displayed
- When the user returns to the automation practice page
- And the user triggers an alert using the name "Joost" and accepts it
- Then the alert should confirm the name "Joost"
- And the web table should contain a row with course "Selenium Webdriver with Java"
- And the embedded iframe should show a visible navigation link "Mentorship"

Notes:
- For the autocomplete step, implement the mechanics in the page object: type a prefix, wait for suggestions, choose the exact country, and verify the input value reflects the selected country.
- For the alert step, use Playwright dialog handling (`page.on('dialog', ...)`) and assert the message contains the name.

## Selector strategy (placeholders only)
Prefer `data-test-id` (or similar) selectors. If the app does not have them, propose adding them. Do NOT guess actual selectors from the video.

Proposed `data-test-id` placeholders (examples):
- Practice page:
  - `name-input`
  - `radio-group`, `radio-option-<value>`
  - `checkbox-option-<value>`
  - `static-dropdown`
  - `country-autocomplete-input`, `country-autocomplete-option`
  - `open-tab`, `open-window`
  - `alert-name-input`, `trigger-alert`, `trigger-confirm`
  - `web-table`
  - `iframe-root`

If `data-test-id` is not available, prefer Playwright role-based locators and accessible labels, scoped within the relevant page object.

## Constraints (must follow)
- Follow `ai/ai-instructions.md`, `ai/playwright-bdd-style.md`, and `ai/testing-guidelines.md`.
- Use Playwright + playwright-bdd conventions used in this repo.
- Use TypeScript + async/await.
- Use Page Object Model.
- Keep step definitions thin (no locators in step files).
- No hard waits (`waitForTimeout`).
- No Cypress.
- No hardcoded secrets.
- No assertions inside Page Objects; assert in steps or helper assertions.

## Output locations (repo conventions)
Generate files to these locations (create folders if needed):
- Feature file:
  - `features/e2e/practice-page.feature`
- Step definitions:
  - `steps/e2e/practice-page.steps.ts`
- Page Objects:
  - `pageobjects/letsshop/practice.page.ts`
  - (optional) `pageobjects/letsshop/academy.page.ts` (only if the new tab/window needs its own page object)

## Implementation notes for the code generator
- Use a shared `bdd.ts` import for Given/When/Then (never import directly from `@cucumber/cucumber`).
- Make the scenario independently runnable.
- Prefer stable assertions:
  - selected autocomplete value equals "India" (not just a typed prefix)
  - dialog message includes "Joost"
  - a known table value exists
  - iframe element/text is visible
