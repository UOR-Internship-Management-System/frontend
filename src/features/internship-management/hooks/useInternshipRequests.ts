import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { internshipManagementApi } from '../api/internshipManagementApi'
import type {
  InternshipRequestCreateInput,
  InternshipRequestDeleteInput,
  InternshipRequestsQuery,
  InternshipRequestUpdateInput,
  RequiredSkillsQuery,
} from '../types/internshipManagementTypes'
import { internshipManagementKeys } from './internshipManagementQueryKeys'

export function shouldRetryInternshipRequestQuery(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && status < 500) return false
  return failureCount < 1
}

export function useInternshipRequests(query: InternshipRequestsQuery | null) {
  const fallbackQuery: InternshipRequestsQuery = {
    page: 0,
    size: 20,
    sort: 'createdAt,desc',
    search: '',
  }
  const resolvedQuery = query ?? fallbackQuery
  return useQuery({
    enabled: Boolean(query),
    queryKey: internshipManagementKeys.requestList(resolvedQuery),
    queryFn: ({ signal }) => internshipManagementApi.listInternshipRequests(resolvedQuery, signal),
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

export function useCreateInternshipRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InternshipRequestCreateInput) =>
      internshipManagementApi.createInternshipRequest(input),
    onSuccess: (request) => {
      queryClient.setQueryData(internshipManagementKeys.requestDetail(request.requestId), request)
      return queryClient.invalidateQueries({ queryKey: internshipManagementKeys.requests() })
    },
  })
}

export function useUpdateInternshipRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InternshipRequestUpdateInput) =>
      internshipManagementApi.updateInternshipRequest(input),
    onSuccess: (request) => {
      queryClient.setQueryData(internshipManagementKeys.requestDetail(request.requestId), request)
      return queryClient.invalidateQueries({ queryKey: internshipManagementKeys.requests() })
    },
  })
}

export function useDeleteInternshipRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InternshipRequestDeleteInput) =>
      internshipManagementApi.deleteInternshipRequest(input),
    onSuccess: (_result, input) => {
      queryClient.removeQueries({
        queryKey: internshipManagementKeys.requestDetail(input.requestId),
      })
      return queryClient.invalidateQueries({ queryKey: internshipManagementKeys.requests() })
    },
  })
}

export function getInternshipRequestMutationErrorMessage(error: unknown) {
  const mapped = mapApiError(error, 'protected')
  if (mapped.status === 412) return 'This request changed. Reload the latest version and try again.'
  if (mapped.status === 428) return 'Reload this request before deleting it.'
  if (mapped.status === 409)
    return 'This internship request cannot be deleted because linked data is in use.'
  return mapped.message
}
