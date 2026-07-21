import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { shortlistsApi } from '../api/shortlistsApi'
import type {
  AddShortlistCandidatesInput,
  FinalizeShortlistInput,
  RemoveShortlistCandidateInput,
  ShortlistCreateInput,
  ShortlistDetailQuery,
  ShortlistsQuery,
} from '../types/shortlistTypes'
import { shortlistKeys } from './shortlistQueryKeys'

export function shouldRetryShortlistQuery(failureCount: number, error: unknown) {
  if (error instanceof ZodError) {
    return false
  }

  const status = mapApiError(error, 'protected').status

  if (status && status < 500) {
    return false
  }

  return failureCount < 1
}

export function useShortlists(query: ShortlistsQuery) {
  return useQuery({
    queryKey: shortlistKeys.list(query),
    queryFn: ({ signal }) => shortlistsApi.listShortlists(query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryShortlistQuery,
  })
}

export function useShortlistDetail(query: ShortlistDetailQuery | null) {
  const fallbackQuery: ShortlistDetailQuery = {
    shortlistId: '',
    candidatePage: 0,
    candidateSize: 20,
    candidateSearch: '',
    candidateSort: 'officialGpa,desc',
  }

  const resolvedQuery = query ?? fallbackQuery

  return useQuery({
    enabled: Boolean(query),
    queryKey: shortlistKeys.detail(resolvedQuery),
    queryFn: ({ signal }) => shortlistsApi.getShortlistDetail(resolvedQuery, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryShortlistQuery,
  })
}

function refreshShortlistState(
  queryClient: ReturnType<typeof useQueryClient>,
  shortlistId: string,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: shortlistKeys.lists(),
    }),
    queryClient.invalidateQueries({
      queryKey: shortlistKeys.detailRoot(shortlistId),
    }),
  ])
}

function recoverStaleShortlistState(
  queryClient: ReturnType<typeof useQueryClient>,
  shortlistId: string,
  error: unknown,
) {
  const status = mapApiError(error, 'protected').status

  if (status !== 412 && status !== 428) {
    return undefined
  }

  return queryClient.invalidateQueries({
    queryKey: shortlistKeys.detailRoot(shortlistId),
  })
}

export function useCreateDraftShortlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ShortlistCreateInput) => shortlistsApi.createDraft(input),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: shortlistKeys.lists(),
      }),
  })
}

export function useAddShortlistCandidates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddShortlistCandidatesInput) => shortlistsApi.addCandidates(input),

    onSuccess: (result) => refreshShortlistState(queryClient, result.shortlistId),

    onError: (error, input) => recoverStaleShortlistState(queryClient, input.shortlistId, error),
  })
}

export function useRemoveShortlistCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RemoveShortlistCandidateInput) => shortlistsApi.removeCandidate(input),

    onSuccess: (result) => refreshShortlistState(queryClient, result.shortlistId),

    onError: (error, input) => recoverStaleShortlistState(queryClient, input.shortlistId, error),
  })
}

export function useFinalizeShortlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: FinalizeShortlistInput) => shortlistsApi.finalize(input),

    onSuccess: (result) => refreshShortlistState(queryClient, result.shortlistId),

    onError: (error, input) => recoverStaleShortlistState(queryClient, input.shortlistId, error),
  })
}

export function getShortlistMutationErrorMessage(error: unknown) {
  const mapped = mapApiError(error, 'protected')

  if (mapped.status === 412) {
    return 'This shortlist changed. The latest version is being reloaded; review it before trying again.'
  }

  if (mapped.status === 428) {
    return 'The latest shortlist version is required. Reload the shortlist before making this change.'
  }

  if (mapped.status === 409) {
    return 'The shortlist state no longer allows this change. It may already be finalized or another shortlist may exist for the request.'
  }

  return mapped.message
}
