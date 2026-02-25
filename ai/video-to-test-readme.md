---
title: Video-to-Test Workflow
description: Stap-voor-stap handleiding om van een UI-video naar een werkende Playwright-BDD test te gaan.
owner: team-qa
tags: [docs, workflow, video, playwright, bdd, prompts]
version: 1.0
---

# Video → Prompt → Feature/Steps/POM → Run

Dit document beschrijft de generieke workflow om op basis van een UI-screen recording een nieuwe geautomatiseerde test aan te maken in deze repo (Playwright + playwright-bdd + Page Object Model + Allure).

## Vereisten

- Dependencies geïnstalleerd:
  - `npm ci`
  - `npx playwright install`
- Je hebt een video van een **happy flow** (liefst kort en zonder onnodige zijpaden).

## Stap 1 — Plaats de video in de repo

- Zet je screen recording onder de map `specs/videos/`.
- Gebruik een duidelijke naam, bijvoorbeeld: `specs/videos/<flow-naam>.mp4`.

Tip: als je meerdere varianten hebt (desktop/mobile), zet dat in de bestandsnaam.

## Stap 2 — Genereer een nieuwe “test-generator prompt” op basis van de video

Doel van deze stap: maak een **nieuw prompt-bestand** dat later gebruikt wordt om code te genereren (feature + steps + page objects).

Gebruik het template:
- `ai/prompts/templates/ui-from-video.prompt-template.md`

### Wat je in Copilot Chat (of agent) vraagt

Gebruik een prompt in deze trant (houd het generiek):

- Ik heb een video van een UI flow geüpload in `specs/videos/<flow-naam>.mp4`.
- Gebruik het prompt template `ai/prompts/templates/ui-from-video.prompt-template.md`.
- Genereer een nieuwe prompt voor deze flow.
- Sla de prompt op als: `ai/prompts/e2e/<flow-naam>.prompt.md`.

### Wat het resultaat moet zijn

Een nieuw prompt-bestand, bijvoorbeeld:
- `ai/prompts/e2e/<flow-naam>.prompt.md`

Dat bestand hoort minimaal te bevatten:
- Context + doel
- Flow (business-stappen)
- Betrokken pagina’s/schermen
- Constraints (POM gebruiken, geen selectors uit video “gokken”, geen secrets)
- Output-locaties voor feature/steps/page objects

## Stap 3 — Genereer feature, steps en page objects vanuit de prompt

Doel van deze stap: laat de agent/codegen de echte testartefacten aanmaken.

### Wat je in Copilot Chat (of agent) vraagt

- Gebruik `ai/prompts/e2e/<flow-naam>.prompt.md`.
- Genereer:
  - Een feature file
  - Step definitions
  - Page objects

### Conventies (verwachte output-locaties)

Gebruik deze repo-conventies:
- Feature file: `features/**/<flow-naam>.feature`
- Step definitions: `steps/**/<flow-naam>.steps.ts`
- Page Objects: `ui/pages/**` (bijv. 1 page per scherm)

Belangrijk:
- Step files blijven “thin”: roepen vooral Page Object methods aan.
- Locators/selector-logica hoort in Page Objects.
- Assertions horen in steps (of dedicated assert-helpers), niet in Page Objects.

## Stap 4 — Genereer de Playwright specs (bddgen)

Playwright-BDD zet `.feature` bestanden om naar uitvoerbare Playwright tests in `.features-gen/`.

Run:

```powershell
npm run bddgen
```

Handig om te checken of je scenario’s correct ontdekt worden:

```powershell
npx playwright test --list
```

## Stap 5 — Draai de test om te verifiëren

### Optie A: draai alles (incl. Allure)

```powershell
npm run bdd
```

### Optie B: draai 1 feature file

```powershell
npm run bdd -- features/<pad>/<flow-naam>.feature
```

### Optie C: debug headed

```powershell
npx playwright test --headed
```

Tip: gebruik `--grep` om op scenario titel te filteren.

## Stap 6 — Bekijk Allure

Na een run staan resultaten in `allure-results/`.

Genereer + open report:

```powershell
npm run allure:generate
npm run allure:open
```

## Troubleshooting (kort)

- Als je in Allure “Example #n” ziet bij `Scenario Outline`:
  - Zet `<kolom>` placeholders in de `Scenario Outline` titel (bijv. `"<author>"`), of
  - Gebruik `# title-format:` boven `Examples:`.
- Als een UI stap flaky is:
  - Stabiliseer in Page Object (betere waits/locators), houd Gherkin business-georiënteerd.

