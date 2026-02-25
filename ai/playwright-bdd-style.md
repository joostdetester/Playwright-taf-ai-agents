---
title: Playwright BDD Style
description: Style guide for writing Playwright BDD feature files and step implementations.
owner: team-qa
tags: [style, playwright, bdd]
version: 1.0
---

```markdown
# Playwright + BDD Style Guide

## Feature Files (Gherkin)
- Use Given / When / Then
- Describe behavior, not UI mechanics
- Avoid technical language in scenarios
- Scenarios must be independently runnable
- Scenarios must contain meaningful tags

### Scenario Outlines (Examples)
- By default, each example row is shown as generic `Example #n` in Playwright/Allure.
- To make report entries include the variable value, customize the generated example title:
	- Put `<column>` placeholders in the `Scenario Outline` title (e.g. `... for author "<author>"`).
	- Or add `# title-format: ... <column> ...` right above `Examples:`.
	- (Optional) Set the global `examplesTitleFormat` in `defineBddConfig`.

### Good
Scenario: User completes checkout
	Given the user is logged in
	When the user completes checkout
	Then the order should be created successfully

### Bad
Scenario: Click submit button
	When I click the #submit button
	Then the API returns 200

## Step Definitions
- Steps should call Page Object methods
- all words should be lowercase, variables within the step can contain uppercase words
- No locators inside step files
- No assertions in Page Objects (assert in steps or helper assertions)
- Keep step definitions small and readable

## Page Objects
- Encapsulate selectors and UI actions
- Expose meaningful business actions
- No assertions in Page Objects
- One page object per screen or component

## Naming
- Feature files: kebab-case.feature
- Step files: *.steps.ts
- Page objects: *.page.ts

```
