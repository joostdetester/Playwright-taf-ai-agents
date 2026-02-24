---
title: Login and Create Book prompt
description: Prompt for generating an end-to-end test that logs in, creates a book via API and verifies DB/UI.
owner: team-qa
tags: [prompt,e2e,login,create-book]
version: 1.0
---

```prompt
# Test: Login + Create Book (E2E)

Context:
We have:
- UI: Login page
- API: Library API
- DB: MySQL books table

Goal:
Generate an end-to-end test that:
1. Logs in via UI (Playwright)
2. Creates a book via API
3. Verifies the book exists in the database
4. Verifies the book appears in the UI list

Constraints:
- Reuse existing UI, API, DB steps where possible
- Store shared state in World:
  - world.createdBookId
  - world.apiBooks
  - world.dbBooks
- Base URLs from projectConfig

Output:
- features/e2e/login-and-create-book.feature
- steps/e2e/login-and-create-book.steps.ts
```
