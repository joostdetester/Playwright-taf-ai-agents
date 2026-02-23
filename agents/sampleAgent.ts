export async function run(prompt: string, options: any) {
  // This agent demonstrates how an MCP agent could modify feature files or steps.
  // For safety, it only returns instructions. Implementations that modify files
  // must be used locally and are disabled in CI.
  return { ok: true, message: `Received prompt: ${prompt}` };
}
