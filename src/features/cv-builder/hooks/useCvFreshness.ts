import { useQuery } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { cvBuilderApi } from '../api/cvBuilderApi'
import { cvBuilderKeys } from './cvBuilderKeys'

const nonRetryableStatuses = new Set([400, 401, 403, 404, 409, 415, 422, 429])

export function shouldRetryCvQuery(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && (nonRetryableStatuses.has(status) || status < 500)) return false
  return failureCount < 1
}

export function useCvFreshness() {
  return useQuery({
    queryKey: cvBuilderKeys.freshness(),
    queryFn: ({ signal }) => cvBuilderApi.getFreshness(signal),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: shouldRetryCvQuery,
  })
}
