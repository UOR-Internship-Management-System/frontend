import type { ProblemDetails } from './problemDetails'

export type UiApiError = {
  status?: number
  message: string
}

export function mapApiError(error: unknown): UiApiError {
  if (isProblemDetails(error)) {
    return { status: error.status, message: error.title }
  }

  if (error instanceof Error) {
    return { message: error.message }
  }

  return { message: 'The request could not be completed.' }
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return typeof value === 'object' && value !== null && 'title' in value && 'status' in value
}
