---
title: Repo Structure
description: Explanation of repository layout and where to place prompts, agents and tests.
owner: team-qa
tags: [docs, repo]
version: 1.0
---

```markdown
# Repository Structure

Recommended structure:

/tests
	/features
		- checkout.feature
		- login.feature
	/steps
		- checkout.steps.ts
		- login.steps.ts
	/pages
		- login.page.ts
		- checkout.page.ts
	/fixtures
		- user.fixture.ts
	/utils
		- apiClient.ts
		- testData.ts

## Conventions
- Feature files describe business flows
- Step files glue Gherkin to Page Objects
- Page Objects only contain selectors + actions
- Utils contain shared logic

```

