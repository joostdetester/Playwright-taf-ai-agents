---
title: Video-to-Test Workflow
description: Step-by-step guide to turn a UI video into a working Playwright-BDD test.
owner: team-qa
tags: [docs, workflow, video, playwright, bdd, prompts]
version: 1.0
---

# Video → Prompt → Feature/Steps/POM → Run

This document describes the generic workflow to create a new automated test in this repository from a UI screen recording (Playwright + playwright-bdd + Page Object Model + Allure).

## Prerequisites

- Install dependencies:
  - `npm ci`
  - `npx playwright install`
- You have a video of a **happy flow** (preferably short and without unnecessary detours).

## Step 1 — Add the video to the repo

- Use a clear name, for example: `specs/videos/<flow-name>.mp4`.

Tip: if you have multiple variants (desktop/mobile), include that in the file name.

## Step 2 — Generate a new “test-generator prompt” from the video

Goal of this step: create a **new prompt file** that will later be used to generate code (feature + steps + page objects).

Use the template:
- `ai/prompts/templates/ui-from-video.prompt-template.md`

Important: the generated prompt itself must be written in English. The resulting Gherkin steps and all instructions in the prompt must be in English.

### What to ask in Copilot Chat (or an agent)

Use a prompt along these lines (keep it generic):

- I uploaded a video of a UI flow in `specs/videos/<flow-name>.mp4`.
- Use the prompt template `ai/prompts/templates/ui-from-video.prompt-template.md`.
- Generate a new prompt for this flow.
- Save the prompt as: `ai/prompts/e2e/<flow-name>.prompt.md`.

### Expected result

A new prompt file, for example:
- `ai/prompts/e2e/<flow-name>.prompt.md`

That file should contain at minimum:
- Context + goal
- Flow (business steps)
- Involved pages/screens
- Constraints (use POM, don’t “guess” selectors from the video, no secrets)
- Output locations for feature/steps/page objects

## Step 3 — Generate feature, steps, and page objects from the prompt

Goal of this step: have the agent/codegen create the actual test artifacts.

### What to ask in Copilot Chat (or an agent)

- Use `ai/prompts/e2e/<flow-name>.prompt.md`.
- Generate:
  - A feature file
  - Step definitions
  - Page objects

### Conventions (expected output locations)

Use these repository conventions:
- Feature file: `features/**/<flow-name>.feature`
- Step definitions: `steps/**/<flow-name>.steps.ts`
- Page Objects: `ui/pages/**` (e.g. 1 page per screen)

Important:
- Keep step files “thin”: mostly call Page Object methods.
- Locator/selector logic belongs in Page Objects.
- Assertions belong in steps (or dedicated assert helpers), not in Page Objects.

## Step 4 — Generate the Playwright specs (bddgen)

Playwright-BDD turns `.feature` files into runnable Playwright tests in `.features-gen/`.

Run:

```powershell
npm run bddgen
```

Helpful to verify whether your scenarios are discovered correctly:

```powershell
npx playwright test --list
```

## Step 5 — Run the test to verify

### Option A: run everything (including Allure)

```powershell
npm run bdd
```

### Option B: run one feature file

```powershell
npm run bdd -- features/<path>/<flow-name>.feature
```

### Option C: debug headed

```powershell
npx playwright test --headed
```

Tip: use `--grep` to filter by scenario title.

## Step 6 — View Allure

After a run, results are stored in `allure-results/`.

Generate + open the report:

```powershell
npm run allure:generate
npm run allure:open
```

## Troubleshooting (short)

- If you see “Example #n” in Allure for a `Scenario Outline`:
  - Add `<column>` placeholders to the `Scenario Outline` title (e.g. `"<author>"`), or
  - Use `# title-format:` above `Examples:`.
- If a UI step is flaky:
  - Stabilize it in the Page Object (better waits/locators) and keep the Gherkin business-oriented.

