import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts'],
});

const isDebug = !!process.env.PWDEBUG;

export default defineConfig({
  testDir,
  timeout: 30_000,
  use: {
    // In debug mode: use a deterministic viewport (matches your current screen viewport).
    headless: isDebug ? false : true,
    viewport: isDebug ? { width: 1358, height: 1270 } : { width: 1280, height: 720 },
    // Keep window stable in debug (maximize makes viewport vary).
    launchOptions: isDebug ? { args: ['--window-position=0,0'] } : undefined,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [ ['list'], ['allure-playwright'] ]
});
