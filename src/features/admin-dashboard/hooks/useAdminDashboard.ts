import { useQuery } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { adminDashboardApi } from '../api/adminDashboardApi'
import { mapAdminDashboard } from '../mappers/adminDashboardMapper'
import { adminDashboardKeys } from './adminDashboardQueryKeys'

const nonRetryableStatuses = new Set([400, 401, 403, 404, 409, 413, 415, 422, 429])

export function shouldRetryAdminDashboard(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && (status < 500 || nonRetryableStatuses.has(status))) return false
  return failureCount < 1
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardKeys.metrics(),
    queryFn: ({ signal }) => adminDashboardApi.getMetrics(signal),
    retry: shouldRetryAdminDashboard,
    select: mapAdminDashboard,
  })
}
