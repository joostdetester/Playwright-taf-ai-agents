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

Security
- Keep secrets out of the repo. Use `.env` locally and set secrets in CI provider.
