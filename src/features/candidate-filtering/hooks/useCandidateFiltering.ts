import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { candidateFilteringApi } from '../api/candidateFilteringApi'
import type {
  CandidateFilteringCriteriaInput,
  CandidateResultsQuery,
} from '../types/candidateFilteringTypes'
import { candidateFilteringKeys } from './candidateFilteringQueryKeys'

function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && status < 500) return false
  return failureCount < 1
}

export function useCreateCandidateFilteringRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CandidateFilteringCriteriaInput) => candidateFilteringApi.createRun(input),
    onSuccess: (run) => {
      queryClient.setQueryData(candidateFilteringKeys.run(run.filterRunId), run)
      return queryClient.invalidateQueries({ queryKey: candidateFilteringKeys.runs() })
    },
  })
}

export function useCandidateFilteringRun(filterRunId: string | null) {
  return useQuery({
    enabled: Boolean(filterRunId),
    queryKey: candidateFilteringKeys.run(filterRunId ?? ''),
    queryFn: ({ signal }) => candidateFilteringApi.getRun(filterRunId ?? '', signal),
    retry: shouldRetry,
  })
}

export function useCandidateFilteringCandidates(query: CandidateResultsQuery | null) {
  const fallback: CandidateResultsQuery = {
    filterRunId: '',
    page: 0,
    size: 5,
    search: '',
    sort: 'officialGpa,desc',
  }
  const resolved = query ?? fallback
  return useQuery({
    enabled: Boolean(query),
    queryKey: candidateFilteringKeys.candidates(resolved),
    queryFn: ({ signal }) => candidateFilteringApi.listCandidates(resolved, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetry,
  })
}
