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