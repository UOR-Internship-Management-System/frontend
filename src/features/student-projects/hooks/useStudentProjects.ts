import { useQuery } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { studentProjectsApi } from '../api/studentProjectsApi'
import type { StudentProjectQuery } from '../types/studentProjectTypes'
import { studentProjectKeys } from './studentProjectKeys'

const nonRetryableStatuses = new Set([400, 401, 403, 404, 409, 412, 415, 422, 428, 429])

export function shouldRetryStudentProjectQuery(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && (nonRetryableStatuses.has(status) || status < 500)) return false
  return failureCount < 1
}

export function useStudentProjects(query: StudentProjectQuery) {
  return useQuery({
    queryKey: studentProjectKeys.list(query),
    queryFn: ({ signal }) => studentProjectsApi.list(query, signal),
    retry: shouldRetryStudentProjectQuery,
  })
}
