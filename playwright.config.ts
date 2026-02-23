import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts'],
});

export default defineConfig({
  testDir,
  timeout: 30_000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 }
  },
  reporter: [ ['list'], ['allure-playwright'] ]
});
