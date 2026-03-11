import fs from 'fs';
import path from 'path';

export type PersistedAeUser = {
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

const storePath = path.join(process.cwd(), 'artifacts', 'automationexercise', 'user.json');

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function saveAeUser(user: { name: string; email: string; password: string }) {
  const dir = path.dirname(storePath);
  fs.mkdirSync(dir, { recursive: true });

  const payload: PersistedAeUser = {
    name: user.name.trim(),
    email: user.email.trim(),
    password: user.password,
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(storePath, JSON.stringify(payload, null, 2), 'utf-8');
}

export function loadAeUser(): PersistedAeUser | null {
  if (!fs.existsSync(storePath)) return null;

  try {
    const raw = fs.readFileSync(storePath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<PersistedAeUser>;

    if (!isNonEmptyString(parsed.name) || !isNonEmptyString(parsed.email) || !isNonEmptyString(parsed.password)) {
      return null;
    }

    return {
      name: parsed.name,
      email: parsed.email,
      password: parsed.password,
      createdAt: isNonEmptyString(parsed.createdAt) ? parsed.createdAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function getAeUserStorePath() {
  return storePath;
}
