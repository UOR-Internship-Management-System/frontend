import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../shared/api/queryKeys'
import { shortlistsApi } from '../api/shortlistsApi'
import type { AddShortlistCandidatesInput, ShortlistCreateInput } from '../types/shortlistTypes'

export const shortlistKeys = {
  all: [...queryKeys.protected, 'shortlists'] as const,
  detail: (shortlistId: string) => [...shortlistKeys.all, 'detail', shortlistId] as const,
}

export function useCreateDraftShortlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ShortlistCreateInput) => shortlistsApi.createDraft(input),
    onSuccess: (shortlist) => {
      queryClient.setQueryData(shortlistKeys.detail(shortlist.shortlistId), shortlist)
      return queryClient.invalidateQueries({ queryKey: shortlistKeys.all })
    },
  })
}

export function useAddShortlistCandidates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AddShortlistCandidatesInput) => shortlistsApi.addCandidates(input),
    onSuccess: (result) =>
      queryClient.invalidateQueries({ queryKey: shortlistKeys.detail(result.shortlistId) }),
  })
}
