import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { internshipManagementApi } from '../api/internshipManagementApi'
import type {
  InternshipRequestsQuery,
  RequiredSkillsQuery,
} from '../types/internshipManagementTypes'
import { internshipManagementKeys } from './internshipManagementQueryKeys'

export function shouldRetryInternshipRequestQuery(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && status < 500) return false
  return failureCount < 1
}

export function useInternshipRequests(query: InternshipRequestsQuery) {
  return useQuery({
    queryKey: internshipManagementKeys.requestList(query),
    queryFn: ({ signal }) => internshipManagementApi.listInternshipRequests(query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryInternshipRequestQuery,
  })
}

export function useInternshipRequest(requestId: string | null) {
  return useQuery({
    enabled: Boolean(requestId),
    queryKey: internshipManagementKeys.requestDetail(requestId ?? ''),
    queryFn: ({ signal }) => internshipManagementApi.getInternshipRequest(requestId ?? '', signal),
    retry: shouldRetryInternshipRequestQuery,
  })
}

export function useRequiredSkills(query: RequiredSkillsQuery | null) {
  const fallbackQuery: RequiredSkillsQuery = { requestId: '', page: 0, size: 20 }
  const resolvedQuery = query ?? fallbackQuery
  return useQuery({
    enabled: Boolean(query),
    queryKey: internshipManagementKeys.requiredSkills(resolvedQuery),
    queryFn: ({ signal }) => internshipManagementApi.listRequiredSkills(resolvedQuery, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryInternshipRequestQuery,
  })
}
