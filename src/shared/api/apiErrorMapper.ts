import type { ProblemDetails } from './problemDetails'

export type UiApiError = {
  status?: number
  message: string
}

export function mapApiError(error: unknown): UiApiError {
  if (isProblemDetails(error)) {
    return { status: error.status, message: safeFallback(error.status, error.title) }
  }

  return { message: 'The request could not be completed.' }
}

function safeFallback(status?: number, title?: string) {
  if (status === 401) {
    return 'The email or password is incorrect.'
  }

  if (status === 403) {
    return 'This account cannot access the requested area.'
  }

  if (status === 429) {
    return 'Too many attempts. Please wait before trying again.'
  }

  if (status === 400 && title && /otp/i.test(title)) {
    return 'The OTP could not be verified. Please check the code and try again.'
  }

  if (status === 400) {
    return 'Please check the entered details and try again.'
  }

  return 'The request could not be completed.'
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return typeof value === 'object' && value !== null && 'title' in value && 'status' in value
}
