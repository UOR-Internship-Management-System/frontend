import { useMutation, useQueryClient } from '@tanstack/react-query'
import { academicLedgerApi } from '../api/academicLedgerApi'
import { academicLedgerKeys } from './academicLedgerQueryKeys'

export function useCommitLedger(uploadId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => academicLedgerApi.commit(uploadId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: academicLedgerKeys.uploads() }),
        queryClient.invalidateQueries({ queryKey: academicLedgerKeys.upload(uploadId) }),
        queryClient.invalidateQueries({ queryKey: academicLedgerKeys.validation(uploadId) }),
      ])
    },
  })
}
