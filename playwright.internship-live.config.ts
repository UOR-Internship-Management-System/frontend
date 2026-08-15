import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

const localEnvironmentFile = '.env.e2e-live.local'
if (existsSync(localEnvironmentFile)) {
  process.loadEnvFile(localEnvironmentFile)
}

const backendOrigin =
  process.env.CV_E2E_BACKEND_ORIGIN?.trim().replace(/\/$/, '') || 'http://127.0.0.1:8080'
const e2eHost = '127.0.0.1'
const e2ePort = 5175
const e2eBaseUrl = `http://${e2eHost}:${e2ePort}`
const localChromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH

export default defineConfig({
  testDir: './e2e-live',
  testMatch: /internship-management\.live\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: 'list',

  expect: {
    timeout: 15_000,
  },

  use: {
    baseURL: e2eBaseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command: `npm run dev -- --mode e2e --host ${e2eHost} --port ${e2ePort} --strictPort`,
    url: e2eBaseUrl,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_API_BASE_URL: `${backendOrigin}/api/v1`,
    },
  },

  projects: [
    {
      name: 'chromium-live-backend',
      use: {
        ...devices['Desktop Chrome'],
        ...(localChromiumExecutable
          ? { launchOptions: { executablePath: localChromiumExecutable } }
          : {}),
      },
    },
  ],
})
