import { config } from '../../config/project.config';
import path from 'path';

export async function runAgent(prompt: string, agentName: string, options: any = {}) {
  if (!config.mcpEnabled || process.env.CI) {
    console.warn('MCP agents disabled in this environment');
    return { ok: false, reason: 'disabled' };
  }
  // Agents are simple modules under /agents
  try {
    const agentPath = path.join(process.cwd(), 'agents', agentName + '.ts');
    const mod = await import(agentPath);
    if (typeof mod.run === 'function') {
      return await mod.run(prompt, options);
    }
    return { ok: false, reason: 'no-run' };
  } catch (err: any) {
    return { ok: false, reason: err?.message ?? String(err) };
  }
}
