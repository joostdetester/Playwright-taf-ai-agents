# MCP Servers (local dev)

This folder contains guidance for running Model Context Protocol (MCP) servers locally and how this project uses `.vscode/mcp.json` together with a local env file `.vscode/.env.agents`.

Quick notes
- Keep secrets out of source control. Use `.vscode/.env.agents` for local dev only (this repo already ignores it).
- `ai/orchestration/agentOrchestrator.ts` expects agents in `agents/` by default — update it if you relocate agents.

Load env (PowerShell)
```powershell
# Load simple KEY=VALUE env pairs from .vscode/.env.agents into the current shell
Get-Content .vscode/.env.agents | ForEach-Object { if ($_ -match '=') { $parts = $_ -split '='; Set-Item -Path Env:$($parts[0]) -Value $parts[1] } }
```

One-liner run examples
- Start the filesystem MCP server (example):
```powershell
npx -y @modelcontextprotocol/server-filesystem "C:/Users/joost/OneDrive/Documenten/Projects"
```
- Start the Playwright MCP helper:
```powershell
npx @playwright/mcp@latest
```
- Start the REST MCP shim (if installed globally or via npm):
```powershell
node path/to/dkmaker-mcp-rest-api/build/index.js
```
- Run the GitHub MCP server via Docker (example):
```powershell
docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
```

VS Code integration
- VS Code MCP integrations and some CLI runners read `.vscode/mcp.json`.
- That file contains server entries and environment placeholders; fill `.vscode/.env.agents` with your secrets locally before starting.

Security and best practices
- Never commit `.vscode/.env.agents` — use CI/CD secret stores for pipeline runs.
- Only run agents that perform side effects on trusted developer machines.

If you want, I can add launch tasks or npm scripts to start the most-used MCP servers for you.
