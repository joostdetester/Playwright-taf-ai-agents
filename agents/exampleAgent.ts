import fs from 'fs';
import path from 'path';

// Example agent: reads a prompt file and returns a safe instruction object.
export async function run(prompt: string, options: any) {
  try {
    const promptsDir = path.join(process.cwd(), 'ai', 'prompts');
    // If prompt name provided, try to include the prompt file text (non-secret)
    let promptText = prompt;
    if (!promptText && options?.promptFile) {
      const filePath = path.join(promptsDir, options.promptFile);
      if (fs.existsSync(filePath)) {
        promptText = fs.readFileSync(filePath, 'utf8');
      }
    }

    // Return a structured result — do not perform side-effects here.
    return { ok: true, agent: 'exampleAgent', prompt: promptText ?? null };
  } catch (err: any) {
    return { ok: false, reason: err?.message ?? String(err) };
  }
}
