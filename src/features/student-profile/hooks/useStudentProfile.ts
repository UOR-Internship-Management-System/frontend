import { useQuery } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { studentProfileApi } from '../api/studentProfileApi'
import { studentProfileKeys } from './studentProfileKeys'

const nonRetryableStatuses = new Set([400, 401, 403, 404, 409, 412, 415, 422, 429])

export function shouldRetryStudentProfileQuery(failureCount: number, error: unknown) {
  if (error instanceof ZodError) {
    return false
  }

  const status = mapApiError(error, 'protected').status
  if (status && (nonRetryableStatuses.has(status) || status < 500)) {
    return false
  }

  return failureCount < 1
}

export function useStudentProfile() {
  return useQuery({
    queryKey: studentProfileKeys.core(),
    queryFn: ({ signal }) => studentProfileApi.getCurrent(signal),
    retry: shouldRetryStudentProfileQuery,
  })
}
