import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  outputDir: './artifacts/test-results',
  // Jev calls are fast, but a full flow against a dev server is not.
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: './artifacts/report', open: 'never' }],
    ['./src/jevReporter.ts'],
  ],
  use: {
    baseURL,
    // Every test is filmed. The HTML report embeds the recording.
    video: { mode: 'on', size: { width: 1280, height: 800 } },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 800 },
    locale: 'es-AR',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
