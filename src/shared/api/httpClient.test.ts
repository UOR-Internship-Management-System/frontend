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

  it('serializes JSON requests and preserves custom If-Match headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    await httpClient('/me/profile', {
      method: 'PATCH',
      body: { fullName: 'Student' },
      headers: { 'If-Match': '"3"' },
    })

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(request.body).toBe(JSON.stringify({ fullName: 'Student' }))
    expect(new Headers(request.headers).get('Content-Type')).toBe('application/json')
    expect(new Headers(request.headers).get('If-Match')).toBe('"3"')
  })

  it('sends FormData unchanged without a JSON content type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    const body = new FormData()
    body.set('file', new File(['photo'], 'photo.png', { type: 'image/png' }))

    await httpClient('/me/profile/photo', { method: 'PUT', body })

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(request.body).toBe(body)
    expect(new Headers(request.headers).has('Content-Type')).toBe(false)
  })

  it('returns undefined for 204 and a safe problem for non-JSON failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(null, { status: 204 })))
    await expect(
      httpClient<void>('/me/profile/photo', { method: 'DELETE' }),
    ).resolves.toBeUndefined()

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(new Response('Proxy failure', { status: 503 })),
    )
    await expect(httpClient('/me/profile')).rejects.toEqual(
      expect.objectContaining({ status: 503, code: 'HTTP_503' }),
    )
  })
})
