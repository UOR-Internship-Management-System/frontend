import { defineConfig, devices } from '@playwright/test'

const e2eHost = '127.0.0.1'
const e2ePort = 5174
const e2eBaseUrl = `http://${e2eHost}:${e2ePort}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 4,
  reporter: 'list',

  use: {
    baseURL: e2eBaseUrl,
    trace: 'on-first-retry',
  },

  webServer: {
    command: `npm run dev -- --mode e2e --host ${e2eHost} --port ${e2ePort} --strictPort`,
    url: e2eBaseUrl,
    reuseExistingServer: false,
    timeout: 120_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
