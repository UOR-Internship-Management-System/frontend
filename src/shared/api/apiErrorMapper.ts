import type { FieldError, ProblemDetails } from './problemDetails'

export type UiApiError = {
  status?: number
  code?: string
  message: string
  correlationId?: string
  fieldErrors: FieldError[]
}

export type ApiErrorContext = 'authentication' | 'protected'

export function mapApiError(
  error: unknown,
  context: ApiErrorContext = 'authentication',
): UiApiError {
  const problem = readProblemDetails(error)
  if (problem) {
    return {
      status: problem.status,
      code: problem.code,
      message: safeFallback(problem.status, problem.title, problem.message, context),
      correlationId: problem.correlationId,
      fieldErrors: normalizeFieldErrors(problem.fieldErrors),
    }
  }

  return { message: 'The request could not be completed.', fieldErrors: [] }
}

function safeFallback(
  status: number | undefined,
  title: string | undefined,
  message: string | undefined,
  context: ApiErrorContext,
) {
  if (status === 401) {
    return context === 'protected'
      ? 'Your session has expired. Please sign in again.'
      : 'The email or password is incorrect.'
  }

  if (status === 403) {
    return context === 'protected'
      ? 'You do not have permission to access this information.'
      : 'This account cannot access the requested area.'
  }

  if (status === 409 || status === 412) {
    return 'This information changed since it was loaded. Reload the latest version and try again.'
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

  if (status === 422) {
    return message || 'Please correct the highlighted fields and try again.'
  }

  if (status === 404) {
    return 'The requested information could not be found.'
  }

  if (status && status >= 500) {
    return 'The service is temporarily unavailable. Please try again.'
  }

  return 'The request could not be completed.'
}

function readProblemDetails(value: unknown): Partial<ProblemDetails> | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const candidate = value as Record<string, unknown>
  if (typeof candidate.status !== 'number' || typeof candidate.title !== 'string') {
    return null
  }

  return {
    status: candidate.status,
    title: candidate.title,
    code: typeof candidate.code === 'string' ? candidate.code : undefined,
    message: typeof candidate.message === 'string' ? candidate.message : undefined,
    correlationId:
      typeof candidate.correlationId === 'string' ? candidate.correlationId : undefined,
    fieldErrors: Array.isArray(candidate.fieldErrors)
      ? (candidate.fieldErrors as FieldError[])
      : undefined,
  }
}

function normalizeFieldErrors(value: FieldError[] | undefined): FieldError[] {
  if (!value) {
    return []
  }

  return value.filter(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.field === 'string' &&
      typeof item.message === 'string',
  )
}
