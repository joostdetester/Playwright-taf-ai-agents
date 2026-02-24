---
title: Get Books by Author prompt
description: Prompt to generate BDD feature and steps that query API and DB for books by author.
owner: team-qa
tags: [prompt,api,db,get-books]
version: 1.0
---

```prompt
# Test: Get books by author

Context:
We use the Rahul Shetty Library API and a MySQL database with a books table.

Goal:
Generate:
1. A BDD feature file in features/api
2. Step definitions in steps/api
3. Reuse existing steps
4. Do not overwrite existing steps

Constraints:
- Base URL from projectConfig.api.baseUrl
- Store API results in World.apiBooks
- Store DB results in World.dbBooks

Output:
- features/api/get-books-by-author.feature
- steps/api/library.steps.ts
```
# Test: Get books by author

Context:
We use the Rahul Shetty Library API and a MySQL database with a books table.

Goal:
Generate:
1. A BDD feature file in features/api
2. Step definitions in steps/api
3. Reuse existing steps
4. Do not overwrite existing steps

Constraints:
- Base URL from projectConfig.api.baseUrl
- Store API results in World.apiBooks
- Store DB results in World.dbBooks

Output:
- features/api/get-books-by-author.feature
- steps/api/library.steps.ts