# Playwright BDD Template

Purpose: Minimal reusable Test Automation Framework template using Playwright, TypeScript, `playwright-bdd` (Gherkin feature files with Playwright runner), Allure reporting, and MCP agents scaffolding.

Quick start
- Copy `.env.example` to `.env` and set `BASE_URL`.
- Install dependencies:

```bash
npm ci
npx playwright install
```

- Run the BDD tests:

```bash
npm run bdd
```

- Run the dummy CI suite locally:

```bash
npm run bdd:dummy
```

How it works
- Feature files: `features/**.feature`
- Generation: `npx bddgen` generates Playwright tests from feature files (configured in `playwright.config.ts` using `defineBddConfig`).
- Step definitions: files under `steps/**` register steps via `createBdd(...)` (`Given/When/Then`).
- Allure: configured in `playwright.config.ts` via `allure-playwright` reporter. Steps are instrumented using `test.step`.

Configuration
- `config/project.config.ts` reads `.env` using `dotenv` and validates using `zod`.
- Do not commit secrets. Use `.env` locally and GitHub Secrets/Variables in CI.

Architecture rules
- UI steps must only use `ui/pages` and `page` actions.
- API steps must only use `api/clients`.
- DB steps must only use `db/repositories`.
- Cross-layer usage should be explicit in Gherkin and reviewed.

MCP agents
- Agents live under `agents/` and are orchestrated by `ai/orchestration/agentOrchestrator.ts`.
- Agents are disabled in CI (honors `MCP_ENABLED` and `CI`).

Using MCP and local agent secrets
- Local env file: create `.vscode/.env.agents` to store MCP-related variables for local development. Example variables:

	- `AGENT_GITHUB_PAT` — (optional) GitHub PAT for GitHub MCP server
	- `REST_BASE_URL` — base URL for any REST MCP server you run
	- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` — DB connection for local MCP services
	- `EXCEL_MCP_PAGING_CELLS_LIMIT` — example for Excel MCP

- Security: `.vscode/.env.agents` is ignored by git (see `.gitignore`). Do NOT commit secrets.

Running MCP servers
- We provide a `.vscode/mcp.json` file with example server entries. To run the MCP servers locally you can use the Model Context Protocol runner tools (example):

```powershell
# Load local env vars into the shell (PowerShell) - adjust path if needed
Get-Content .vscode/.env.agents | ForEach-Object { if ($_ -match '=') { $parts = $_ -split '='; Set-Item -Path Env:$($parts[0]) -Value $parts[1] } }

# Start filesystem MCP server (example using npx)
npx @modelcontextprotocol/server-filesystem "C:/Users/joost/OneDrive/Documenten/Projects"

# Or use the VS Code MCP integration which reads .vscode/mcp.json and the env file
```

Notes and best practices
- Keep production secrets in your CI provider or secret manager; only use `.vscode/.env.agents` for local development.
- If you move the `agents/` folder, update `ai/orchestration/agentOrchestrator.ts` to point to the new path (it resolves agents from the repo root by default).
- Agents that modify files or perform side effects should be run only in trusted local environments, not CI.

Security
- Keep secrets out of the repo. Use `.env` locally and set secrets in CI provider.

CI
- GitHub Actions (`.github/workflows/ci.yml`) runs on pushes/PRs to `main`.
- It executes `npm run bdd:dummy` and spins up a temporary MySQL service for DB feature tests.
