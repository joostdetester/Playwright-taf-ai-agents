// config/project.config.ts
import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

// Load .env from project root (ignored by git)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// During local development (not CI), also attempt to load
// .vscode/.env.agents for MCP-related secrets and overrides.
// We only set variables that are not already present to avoid
// unintentionally overwriting environment-provided secrets.
try {
  if (!process.env.CI) {
    const agentsEnvPath = path.resolve(process.cwd(), '.vscode', '.env.agents');
    if (fs.existsSync(agentsEnvPath)) {
      const file = fs.readFileSync(agentsEnvPath, 'utf8');
      const parsed = dotenv.parse(file);
      for (const key of Object.keys(parsed)) {
        if (process.env[key] === undefined) {
          process.env[key] = parsed[key];
        }
      }
    }
  }
} catch (err) {
  // Fail silently — loading local env is convenience only.
}

// Schema: keep BASE_URL required for real runs, others optional
const schema = z.object({
  BASE_URL: z.string().url().optional(), // optional to allow first run without .env
  API_BASE_URL: z.string().url().optional(),
  MCP_ENABLED: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

// Fallbacks for developer experience (first run)
const envData = parsed.success
  ? parsed.data
  : {
      BASE_URL: process.env.BASE_URL,
      API_BASE_URL: process.env.API_BASE_URL,
      MCP_ENABLED: process.env.MCP_ENABLED,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME,
    };

// Final normalized config (guaranteed values where needed)
const baseUrl = envData.BASE_URL ?? 'http://localhost:3000';
const apiBaseUrl = envData.API_BASE_URL ?? 'https://rahulshettyacademy.com';

export const projectConfig = {
  ui: {
    baseUrl,
  },
  api: {
    baseUrl: apiBaseUrl,
  },
  mcpEnabled: envData.MCP_ENABLED !== 'false',
  db: {
    host: envData.DB_HOST,
    port: envData.DB_PORT,
    user: envData.DB_USER,
    password: envData.DB_PASSWORD,
    name: envData.DB_NAME,
  },
};

// Backwards-compatible alias (if some files import `config`)
export const config = projectConfig;

export type ProjectConfig = typeof projectConfig;