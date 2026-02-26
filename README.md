# Playwright BDD Template

Purpose: Minimal reusable Test Automation Framework template using Playwright, TypeScript, `playwright-bdd` (Gherkin feature files with Playwright runner), Allure reporting, and MCP agents scaffolding.

CI status badges (per SUT)
- Replace `<OWNER>/<REPO>` with your GitHub org/user and repo name.

[![SUT letsshop](https://github.com/<OWNER>/<REPO>/actions/workflows/sut-letsshop.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/sut-letsshop.yml)
[![SUT greenkart](https://github.com/<OWNER>/<REPO>/actions/workflows/sut-greenkart.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/sut-greenkart.yml)
[![SUT petstore](https://github.com/<OWNER>/<REPO>/actions/workflows/sut-petstore.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/sut-petstore.yml)
[![SUT bookstore](https://github.com/<OWNER>/<REPO>/actions/workflows/sut-bookstore.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/sut-bookstore.yml)
[![SUT dashboard](https://github.com/<OWNER>/<REPO>/actions/workflows/sut-dashboard.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/sut-dashboard.yml)

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

Video → Test workflow
- Step-by-step guide for creating a new test from a UI screen recording: `ai/video-to-test-readme.md`

How it works
- Feature files: `features/**.feature`
- Generation: `npx bddgen` generates Playwright tests from feature files (configured in `playwright.config.ts` using `defineBddConfig`).
- Step definitions: files under `steps/**` register steps via `createBdd(...)` (`Given/When/Then`).
- Allure: configured in `playwright.config.ts` via `allure-playwright` reporter. Steps are instrumented using `test.step`.

Configuration
- `config/project.config.ts` reads `.env` using `dotenv` and validates using `zod`.
- SUT-specific config modules live in `config/<sut>.config.ts` (e.g. `config/letsshop.config.ts`, `config/greenkart.config.ts`, `config/petstore.config.ts`, `config/bookstore.config.ts`).
	- Keep shared concerns (env loading, defaults, DB, MCP) in `project.config.ts`.
	- Keep per-SUT concerns (routes, spec paths, expected UI text) in the SUT config module.
- Do not commit secrets. Use `.env` locally and GitHub Secrets/Variables in CI.

Architecture rules
- UI steps must only use `pageobjects` (root) and page action helpers.
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

CI secrets mapping
- To run MCP servers or agents in CI you must store secrets in your Git provider (GitHub Secrets for GitHub Actions). Below are recommended secret names and their intended use:

	- `GITHUB_PERSONAL_ACCESS_TOKEN` : GitHub PAT used by GitHub MCP server or any GitHub API interactions.
	- `REST_BASE_URL` : optional base URL for the MCP REST shim.
	- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` : DB connection values for MCP services or tests that need remote DB access (CI jobs usually use service containers instead).

- In GitHub Actions you can map secrets into a job step's environment like this:

	```yaml
	env:
		GITHUB_PERSONAL_ACCESS_TOKEN: ${{ secrets.GITHUB_PERSONAL_ACCESS_TOKEN }}
		REST_BASE_URL: ${{ secrets.REST_BASE_URL }}
	```

- Recommendation: keep MCP disabled in CI by default (`MCP_ENABLED: false`), and enable it explicitly only for specialized workflows that require it. Use GitHub Secrets to inject tokens rather than committing them.

Security
- Keep secrets out of the repo. Use `.env` locally and set secrets in CI provider.

CI
- GitHub Actions (`.github/workflows/ci.yml`) runs on pushes/PRs to `main`.
- It executes `npm run bdd:dummy` and spins up a temporary MySQL service for DB feature tests.

GitLab CI
- Pipelines are configured in `.gitlab-ci.yml` with one job per SUT suite.
- Required GitLab CI/CD variables (Project → Settings → CI/CD → Variables):
	- `TEST_USER_EMAIL`
	- `TEST_USER_PASSWORD`
- MySQL is started as a CI service container for DB-enabled suites (letsshop/greenkart/bookstore).

Per-SUT reporting (GitHub Pages)
- Dedicated SUT workflows live under `.github/workflows/sut-*.yml` and run only one SUT suite.
- Each workflow publishes a lightweight status page (counts + status + Allure link) to `gh-pages` under `sut/<sut>/`.
- A central overview page is published under `sut/` (entry: `sut/index.html`).
