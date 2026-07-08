import type { ProblemDetails } from './problemDetails'

export type UiApiError = {
  status?: number
  message: string
}

export function mapApiError(error: unknown): UiApiError {
  if (isProblemDetails(error)) {
    return { status: error.status, message: error.title || safeFallback(error.status) }
  }

  if (error instanceof Error) {
    return { message: error.message || 'The request could not be completed.' }
  }

  return { message: 'The request could not be completed.' }
}

function safeFallback(status?: number) {
  if (status === 401) {
    return 'The email or password is incorrect.'
  }

  if (status === 403) {
    return 'This account cannot access the requested area.'
  }

  if (status === 429) {
    return 'Too many attempts. Please wait before trying again.'
  }

  return 'The request could not be completed.'
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return typeof value === 'object' && value !== null && 'title' in value && 'status' in value
}
