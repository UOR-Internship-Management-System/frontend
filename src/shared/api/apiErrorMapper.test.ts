import { describe, expect, it } from 'vitest'
import { mapApiError } from './apiErrorMapper'

describe('mapApiError', () => {
  it('keeps authentication and protected-request 401 messages distinct', () => {
    const problem = {
      type: 'https://uor-cv-system/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Authentication is required.',
      correlationId: 'req-401',
    }

    expect(mapApiError(problem).message).toBe('The email or password is incorrect.')
    expect(mapApiError(problem, 'protected')).toEqual(
      expect.objectContaining({
        message: 'Your session has expired. Please sign in again.',
        correlationId: 'req-401',
      }),
    )
  })

  it('preserves valid field errors and safe conflict guidance', () => {
    const mapped = mapApiError(
      {
        type: 'https://uor-cv-system/errors/conflict',
        title: 'Conflict',
        status: 409,
        code: 'STALE_PROFILE',
        message: 'Profile changed.',
        correlationId: 'req-409',
        fieldErrors: [
          { field: 'phone', code: 'INVALID_PHONE', message: 'Enter a valid phone number.' },
          { field: 42, message: 'Invalid field shape.' },
        ],
      },
      'protected',
    )

    expect(mapped.message).toMatch(/reload the latest version/i)
    expect(mapped.fieldErrors).toEqual([
      { field: 'phone', code: 'INVALID_PHONE', message: 'Enter a valid phone number.' },
    ])
  })

  it('does not expose unknown error details', () => {
    expect(mapApiError(new Error('database password leaked'), 'protected')).toEqual({
      message: 'The request could not be completed.',
      fieldErrors: [],
    })
  })
})
