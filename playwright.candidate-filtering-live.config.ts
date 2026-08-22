import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

const localEnvironmentFile = '.env.e2e-live.local'
if (existsSync(localEnvironmentFile)) {
  process.loadEnvFile(localEnvironmentFile)
}

const backendOrigin =
  process.env.CV_E2E_BACKEND_ORIGIN?.trim().replace(/\/$/, '') || 'http://127.0.0.1:8080'
const frontendHost = '127.0.0.1'
const frontendPort = 5177
const frontendOrigin = `http://${frontendHost}:${frontendPort}`
const localChromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH

export default defineConfig({
  testDir: './e2e-live',
  testMatch: /candidate-filtering\.live\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report/candidate-filtering-live' }],
  ],
  expect: { timeout: 30_000 },
  use: {
    baseURL: frontendOrigin,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --mode e2e --host ${frontendHost} --port ${frontendPort} --strictPort`,
    url: frontendOrigin,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_API_BASE_URL: `${backendOrigin}/api/v1`,
      VITE_ENABLE_API_MOCKS: 'false',
    },
  },
  projects: [
    {
      name: 'chromium-candidate-filtering-live',
      use: {
        ...devices['Desktop Chrome'],
        ...(localChromiumExecutable
          ? { launchOptions: { executablePath: localChromiumExecutable } }
          : {}),
      },
    },
  ],
})
