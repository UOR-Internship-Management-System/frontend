import { afterEach, describe, expect, it, vi } from 'vitest'
import { authTokenStorage } from './authTokenStorage'
import { httpClient } from './httpClient'
import { sessionEvents } from '../auth/sessionEvents'

describe('httpClient protected-session handling', () => {
  afterEach(() => {
    authTokenStorage.clearToken()
    vi.unstubAllGlobals()
  })

  it('announces one protected session expiry when an authenticated request returns 401', async () => {
    const onExpired = vi.fn()
    const unsubscribe = sessionEvents.subscribe(onExpired)
    authTokenStorage.setToken('student-token')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            type: 'https://uor-cv-system/errors/unauthorized',
            title: 'Unauthorized',
            status: 401,
            code: 'UNAUTHORIZED',
            message: 'Authentication is required.',
            correlationId: 'req-401',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    await expect(httpClient('/me/profile')).rejects.toEqual(
      expect.objectContaining({ status: 401, correlationId: 'req-401' }),
    )
    expect(onExpired).toHaveBeenCalledOnce()
    unsubscribe()
  })
})
