import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts'],
});

const isDebug = !!process.env.PWDEBUG;

const viewportWidth = Number.parseInt(process.env.PW_VIEWPORT_WIDTH ?? '', 10);
const viewportHeight = Number.parseInt(process.env.PW_VIEWPORT_HEIGHT ?? '', 10);
const deviceScaleFactor = Number.parseFloat(process.env.PW_DEVICE_SCALE_FACTOR ?? '');

const viewport = {
  width: Number.isFinite(viewportWidth) ? viewportWidth : 1920,
  height: Number.isFinite(viewportHeight) ? viewportHeight : 1080,
};

const resolvedDeviceScaleFactor = Number.isFinite(deviceScaleFactor) ? deviceScaleFactor : 1;

export default defineConfig({
  testDir,
  timeout: 90_000,
  use: {
    // Deterministic viewport across machines/monitors.
    // Override via env vars: PW_VIEWPORT_WIDTH, PW_VIEWPORT_HEIGHT, PW_DEVICE_SCALE_FACTOR.
    headless: isDebug ? false : true,
    viewport,
    deviceScaleFactor: resolvedDeviceScaleFactor,
    // Keep window stable in headed mode (maximize makes viewport vary).
    launchOptions: isDebug
      ? { args: [`--window-size=${viewport.width},${viewport.height}`, '--window-position=0,0'] }
      : undefined,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [ ['list'], ['allure-playwright'] ]
});
