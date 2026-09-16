import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { queryKeys } from '../../../shared/api/queryKeys'
import { filteringSessionApi } from '../api/filteringSessionApi'
import type { AdminFilteringSessionUpsertRequest } from '../schemas/filteringSessionSchemas'

export const filteringSessionKeys = {
  mine: () => [...queryKeys.protected, 'filtering-session'] as const,
}

function shouldRetryFilteringSession(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && status < 500) return false
  return failureCount < 1
}

/**
 * Reads the current Admin's single in-progress Candidate Filtering session, if any.
 * A missing session (404) is a normal, expected state, not surfaced as `isError`.
 */
export function useMyFilteringSession(enabled = true) {
  const query = useQuery({
    enabled,
    queryKey: filteringSessionKeys.mine(),
    queryFn: ({ signal }) => filteringSessionApi.getMine(signal),
    retry: shouldRetryFilteringSession,
  })
  const isMissing = query.isError && mapApiError(query.error, 'protected').status === 404
  return { ...query, isError: query.isError && !isMissing, isMissing }
}

export function useSaveFilteringSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AdminFilteringSessionUpsertRequest) => filteringSessionApi.save(input),
    onSuccess: (session) => queryClient.setQueryData(filteringSessionKeys.mine(), session),
  })
}

export function useClearFilteringSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => filteringSessionApi.clearMine(),
    onSuccess: () => queryClient.removeQueries({ queryKey: filteringSessionKeys.mine() }),
  })
}
