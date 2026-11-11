import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  expect: { timeout: 15000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    channel: 'chrome',
    headless: true,
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 1100 },
  },
  timeout: 60000,
});
