// Small example agent demonstrating a simple response
export async function run(prompt: string, options: any) {
  const reply = {
    ok: true,
    agent: 'helloAgent',
    message: `Hello from helloAgent. Received prompt: ${String(prompt).slice(0,200)}`,
    timestamp: new Date().toISOString()
  };
  return reply;
}
