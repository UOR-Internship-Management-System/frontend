import { useQuery } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { studentDashboardApi } from '../api/studentDashboardApi'
import { studentDashboardKeys } from './studentDashboardKeys'

const nonRetryableStatuses = new Set([400, 401, 403, 404, 409, 412, 415, 422, 429])

export function shouldRetryStudentDashboardQuery(failureCount: number, error: unknown) {
  if (error instanceof ZodError) {
    return false
  }

  const status = mapApiError(error, 'protected').status

  if (status && (nonRetryableStatuses.has(status) || status < 500)) {
    return false
  }

  return failureCount < 1
}

export function useStudentDashboard() {
  return useQuery({
    queryKey: studentDashboardKeys.metrics(),
    queryFn: () => studentDashboardApi.getMetrics(),
    retry: shouldRetryStudentDashboardQuery,
  })
}
