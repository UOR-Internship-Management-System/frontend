import { defineConfig, devices } from '@playwright/test'

const e2eHost = '127.0.0.1'
const e2ePort = 5174
const e2eBaseUrl = `http://${e2eHost}:${e2ePort}`
const localChromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const chromiumLaunchOverride = localChromiumExecutable
  ? { launchOptions: { executablePath: localChromiumExecutable } }
  : {}

const visualTestMatch = /skeleton-visuals\.spec\.ts/

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 4,
  reporter: 'list',

  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    },
  },

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
      testIgnore: visualTestMatch,
      use: { ...devices['Desktop Chrome'], ...chromiumLaunchOverride },
    },
    {
      name: 'firefox',
      testIgnore: visualTestMatch,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: visualTestMatch,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'edge',
      testIgnore: visualTestMatch,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'msedge',
      },
    },
    {
      name: 'chromium-desktop-light',
      testMatch: visualTestMatch,
      use: {
        ...devices['Desktop Chrome'],
        ...chromiumLaunchOverride,
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'chromium-tablet-light',
      testMatch: visualTestMatch,
      use: {
        ...devices['Desktop Chrome'],
        ...chromiumLaunchOverride,
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'chromium-mobile-light',
      testMatch: visualTestMatch,
      use: {
        ...devices['Desktop Chrome'],
        ...chromiumLaunchOverride,
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'chromium-desktop-dark',
      testMatch: visualTestMatch,
      use: {
        ...devices['Desktop Chrome'],
        ...chromiumLaunchOverride,
        colorScheme: 'dark',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'chromium-reduced-motion',
      testMatch: visualTestMatch,
      use: {
        ...devices['Desktop Chrome'],
        ...chromiumLaunchOverride,
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
})
