import { config } from '../../config/project.config';
import path from 'path';

/*
  agentOrchestrator.runAgent

  Purpose:
  - Dynamically loads and executes an "agent" module by name.
  - Agents are expected to export an async `run(prompt, options)` function.

  Safety and environment checks:
  - The orchestrator will not run agents when `config.mcpEnabled` is falsy
    or when running in CI (`process.env.CI`). This prevents accidental
    execution of local-modifying agents in CI or when disabled by config.

  How module resolution works:
  - It resolves agents relative to the repository root using
    `process.cwd()` and the `agents` folder (e.g. <repo>/agents/<name>.ts).
  - If you move agents to a different location (for example into
    `.vscode/agents`), update this path accordingly or provide a wrapper
    loader that resolves to the new folder.

  Return values:
  - On success the return value is whatever the agent `run()` returns.
  - On failure the function returns an object of shape `{ ok: false, reason }`.
    Callers can inspect `reason` for logging or error handling.

  Security note:
  - Avoid checking secrets into the repo. Use environment variables
    (e.g. `.vscode/.env.agents`) and CI secret injection. Agents that
    perform side effects should be audited and used only in trusted
    environments.
*/

export async function runAgent(prompt: string, agentName: string, options: any = {}) {
  // Guard: don't run agents when disabled or in CI
  if (!config.mcpEnabled || process.env.CI) {
    console.warn('MCP agents disabled in this environment');
    return { ok: false, reason: 'disabled' };
  }

  // Agents are expected to be simple modules with a `run` export.
  try {
    // Resolve to <repo-root>/agents/<agentName>.ts by default.
    // Change this path if you relocate your agents directory.
    const agentPath = path.join(process.cwd(), 'agents', agentName + '.ts');

    // Dynamic import allows loading TS/JS modules at runtime.
    const mod = await import(agentPath);

    // Verify the module exposes a `run` function before calling.
    if (typeof mod.run === 'function') {
      return await mod.run(prompt, options);
    }

    // Module found but no runnable entrypoint.
    return { ok: false, reason: 'no-run' };
  } catch (err: any) {
    // Return error information; callers should avoid leaking secrets from
    // `err` in public logs.
    return { ok: false, reason: err?.message ?? String(err) };
  }
}
