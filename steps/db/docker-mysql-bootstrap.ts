import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { open, unlink, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type DbConfig = {
  host?: string;
  port?: string | number;
  user?: string;
  password?: string;
  name?: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runDocker(args: string[]) {
  return execFileAsync('docker', args, { windowsHide: true });
}

async function withFileLock<T>(lockName: string, fn: () => Promise<T>): Promise<T> {
  const lockPath = path.join(os.tmpdir(), lockName);
  const timeoutMs = 120_000;
  const start = Date.now();

  // Acquire lock via exclusive create. If stale, remove it.
  // This provides a cross-process mutex across Playwright workers.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const handle = await open(lockPath, 'wx');
      await handle.close();
      break;
    } catch {
      // stale lock cleanup
      try {
        const s = await stat(lockPath);
        const ageMs = Date.now() - s.mtimeMs;
        if (ageMs > 5 * 60_000) {
          await unlink(lockPath);
          continue;
        }
      } catch {
        // ignore
      }

      if (Date.now() - start > timeoutMs) {
        throw new Error('Timed out waiting for Docker/MySQL bootstrap lock.');
      }
      await sleep(500);
    }
  }

  try {
    return await fn();
  } finally {
    try {
      await unlink(lockPath);
    } catch {
      // ignore
    }
  }
}

async function isDockerAvailable(): Promise<boolean> {
  try {
    await runDocker(['info']);
    return true;
  } catch {
    return false;
  }
}

async function tryStartDockerDesktopWindows() {
  if (process.platform !== 'win32') return;

  const candidates = [
    'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe',
    'C:\\Program Files (x86)\\Docker\\Docker\\Docker Desktop.exe',
  ];

  const exe = candidates.find((p) => existsSync(p));
  if (!exe) return;

  // Fire-and-forget: Docker Desktop takes time to bring up the daemon.
  try {
    await execFileAsync('powershell', [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      `Start-Process -FilePath \"${exe}\"`,
    ]);
  } catch {
    // Ignore; we'll fail later if docker is still unavailable.
  }
}

async function waitForDocker(timeoutMs: number) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isDockerAvailable()) return;
    await sleep(1500);
  }
  throw new Error('Docker daemon is not available. Start Docker Desktop and retry.');
}

async function isContainerRunning(name: string): Promise<boolean> {
  const { stdout } = await runDocker(['ps', '--filter', `name=^/${name}$`, '--format', '{{.Names}}']);
  return stdout.trim() === name;
}

async function containerExists(name: string): Promise<boolean> {
  const { stdout } = await runDocker(['ps', '-a', '--filter', `name=^/${name}$`, '--format', '{{.Names}}']);
  return stdout.trim() === name;
}

async function ensureMysqlContainer(db: Required<Pick<DbConfig, 'port' | 'user' | 'password' | 'name'>>) {
  const containerName = process.env.DB_DOCKER_CONTAINER ?? 'taf-mysql';
  const port = Number(db.port);

  // Cross-worker lock: multiple Playwright workers may try to bootstrap at once.
  await withFileLock('taf-mysql-bootstrap.lock', async () => {
    if (await isContainerRunning(containerName)) return;

    if (await containerExists(containerName)) {
      // Prefer starting an existing container instead of recreating it.
      try {
        await runDocker(['start', containerName]);
        return;
      } catch {
        // Fall through to recreate if start fails.
        try {
          await runDocker(['rm', '-f', containerName]);
        } catch {
          // ignore
        }
      }
    }

    // Use the same password for root + the app user for local dev convenience.
    // Avoid leaking secrets by not rethrowing raw exec errors (they can echo args).
    try {
      await runDocker([
        'run',
        '-d',
        '--name',
        containerName,
        '-p',
        `${port}:3306`,
        '-e',
        `MYSQL_ROOT_PASSWORD=${db.password}`,
        '-e',
        `MYSQL_DATABASE=${db.name}`,
        '-e',
        `MYSQL_USER=${db.user}`,
        '-e',
        `MYSQL_PASSWORD=${db.password}`,
        'mysql:8.0',
        '--default-authentication-plugin=mysql_native_password',
      ]);
    } catch (err: any) {
      const stderr = String(err?.stderr ?? '').trim();
      const hint = stderr ? ` Docker said: ${stderr}` : '';
      throw new Error(`Failed to start MySQL docker container "${containerName}".${hint}`);
    }
  });
}

/**
 * Ensures Docker is running (and attempts to start Docker Desktop on Windows),
 * then ensures a local MySQL container is running for DB tests.
 */
export async function ensureDockerMysqlForDbTests(db: DbConfig) {
  if (process.env.CI) return;
  if (process.env.DB_DOCKER_AUTOSTART === 'false') return;

  const host = (db.host ?? '').trim().toLowerCase();
  if (host && host !== 'localhost' && host !== '127.0.0.1') return;

  const port = db.port ?? 3307;
  const user = db.user ?? 'test';
  const password = db.password ?? 'test';
  const name = db.name ?? 'testdb';

  if (!(await isDockerAvailable())) {
    await tryStartDockerDesktopWindows();
    await waitForDocker(120_000);
  }

  await ensureMysqlContainer({ port, user, password, name });
}
