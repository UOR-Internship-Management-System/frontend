import { afterEach, describe, expect, it, vi } from 'vitest'
import { authTokenStorage } from './authTokenStorage'
import { httpDownloadClient } from './httpDownloadClient'
import { sessionEvents } from '../auth/sessionEvents'

describe('httpDownloadClient', () => {
  afterEach(() => {
    authTokenStorage.clearToken()
    vi.unstubAllGlobals()
  })

  it('downloads a PDF with authentication, request ID, cancellation, and a safe filename', async () => {
    authTokenStorage.setToken('student-token')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('pdf-content', {
        headers: {
          'Content-Type': 'application/pdf; charset=binary',
          'Content-Disposition': 'attachment; filename="../student cv.PDF"',
          'Content-Length': '11',
        },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()

    const result = await httpDownloadClient('/me/cv/latest/download', {
      signal: controller.signal,
    })

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit
    const headers = new Headers(request.headers)
    expect(headers.get('Accept')).toBe('application/pdf')
    expect(headers.get('Authorization')).toBe('Bearer student-token')
    expect(headers.get('X-Request-Id')).toBeTruthy()
    expect(request.method).toBe('GET')
    expect(request.signal).toBe(controller.signal)
    expect(result.filename).toBe('student cv.pdf')
    expect(result.contentType).toBe('application/pdf')
    expect(result.contentLength).toBe(11)
    expect(result.blob.size).toBe(11)
  })

  it('prefers an RFC 5987 filename and falls back safely when a filename is absent', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response('pdf', {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition':
                "attachment; filename=old.pdf; filename*=UTF-8''final%20cv.pdf",
            },
          }),
        )
        .mockResolvedValueOnce(
          new Response('pdf', { headers: { 'Content-Type': 'application/pdf' } }),
        ),
    )

    await expect(httpDownloadClient('/me/cv/latest/download')).resolves.toMatchObject({
      filename: 'final cv.pdf',
    })
    await expect(httpDownloadClient('/me/cv/latest/download')).resolves.toMatchObject({
      filename: 'student-cv.pdf',
    })
  })

  it.each(['text/html', 'application/zip', 'application/octet-stream'])(
    'rejects a successful %s response before exposing a file',
    async (contentType) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response('not-pdf', {
            headers: { 'Content-Type': contentType },
          }),
        ),
      )

      await expect(httpDownloadClient('/me/cv/latest/download')).rejects.toEqual(
        expect.objectContaining({ code: 'INVALID_PDF_RESPONSE' }),
      )
    },
  )

  it('rejects an empty PDF response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(null, {
          headers: { 'Content-Type': 'application/pdf' },
        }),
      ),
    )

    await expect(httpDownloadClient('/me/cv/latest/download')).rejects.toEqual(
      expect.objectContaining({ code: 'INVALID_PDF_RESPONSE' }),
    )
  })

  it.each([404, 503])('throws Problem Details for a %s JSON error', async (status) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            type: 'https://uor-cv-system/errors/cv-download',
            title: 'CV download failed',
            status,
            code: status === 404 ? 'CV_NOT_SAVED' : 'CV_FILE_UNAVAILABLE',
            message: 'The requested PDF is unavailable.',
            correlationId: `req-${status}`,
          }),
          { status, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    )

    await expect(httpDownloadClient('/me/cv/latest/download')).rejects.toEqual(
      expect.objectContaining({ status, correlationId: `req-${status}` }),
    )
  })

  it('announces an authenticated session expiry on 401', async () => {
    authTokenStorage.setToken('student-token')
    const onExpired = vi.fn()
    const unsubscribe = sessionEvents.subscribe(onExpired)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('Unauthorized', {
          status: 401,
          headers: { 'X-Request-Id': 'req-401' },
        }),
      ),
    )

    await expect(httpDownloadClient('/me/cv/latest/download')).rejects.toEqual(
      expect.objectContaining({ status: 401, correlationId: 'req-401' }),
    )
    expect(onExpired).toHaveBeenCalledOnce()
    unsubscribe()
  })
})
