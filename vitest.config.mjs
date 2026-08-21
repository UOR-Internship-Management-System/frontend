import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: ['e2e/**', 'e2e-live/**', 'node_modules/**', '.kilo/**', 'dist/**'],
    globals: true,
    setupFiles: './src/test/setupTests.ts',
    css: true,
  },
})
