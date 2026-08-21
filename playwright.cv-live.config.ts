import { defineConfig, devices } from '@playwright/test'

const frontendHost = '127.0.0.1'
const frontendPort = 5175

export default defineConfig({
  testDir: './e2e-live',
  testMatch: /cv-generation\.live\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/cv-live' }]],
  expect: { timeout: 30_000 },
  use: {
    baseURL: `http://${frontendHost}:${frontendPort}`,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --mode e2e --host ${frontendHost} --port ${frontendPort} --strictPort`,
    url: `http://${frontendHost}:${frontendPort}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium-cv-live',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
