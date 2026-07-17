import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mocks/server'
import { resetStudentProfileMock } from '../mocks/handlers/studentHandlers'
import { resetStudentSkillsMock } from '../mocks/fixtures/skills.fixture'
import { resetStudentProjectsMock } from '../mocks/fixtures/studentProjects.fixture'
import { resetCvBuilderMock } from '../mocks/fixtures/cvBuilder.fixture'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })

  // MSW/Undici strict AbortSignal checking throws TypeError when receiving JSDOM's AbortSignal.
  // We strip the signal from the test fetch wrapper AFTER MSW has patched fetch.
  // This makes our wrapper the outermost layer, allowing MSW interception to succeed,
  // while preserving actual request cancellation logic in the application code.
  const originalFetch = window.fetch
  window.fetch = async (input, init) => {
    if (init?.signal && init.signal.constructor.name === 'AbortSignal') {
      delete init.signal
    }
    return originalFetch(input, init)
  }
})
afterEach(() => {
  server.resetHandlers()
  resetStudentProfileMock()
  resetStudentSkillsMock()
  resetStudentProjectsMock()
  resetCvBuilderMock()
})
afterAll(() => server.close())
