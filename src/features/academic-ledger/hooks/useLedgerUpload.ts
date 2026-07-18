import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { academicLedgerApi } from '../api/academicLedgerApi'
import { ledgerPollInterval } from '../mappers/academicLedgerMappers'
import type { LedgerUploadsQuery } from '../types/academicLedgerTypes'
import { academicLedgerKeys } from './academicLedgerQueryKeys'

export function shouldRetryAcademicLedger(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && status < 500) return false
  return failureCount < 1
}

export function useLedgerUploads(query: LedgerUploadsQuery) {
  return useQuery({
    queryKey: academicLedgerKeys.uploadList(query),
    queryFn: ({ signal }) => academicLedgerApi.listUploads(query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryAcademicLedger,
  })
}

export function useLedgerUploadDetail(uploadId: string | null) {
  return useQuery({
    enabled: Boolean(uploadId),
    queryKey: academicLedgerKeys.upload(uploadId ?? ''),
    queryFn: ({ signal }) => academicLedgerApi.getUpload(uploadId ?? '', signal),
    refetchInterval: (query) => ledgerPollInterval(query.state.data),
    retry: shouldRetryAcademicLedger,
  })
}

export function useUploadLedger() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => academicLedgerApi.upload(file),
    onSuccess: async ({ data }) => {
      queryClient.setQueryData(academicLedgerKeys.upload(data.uploadId), data)
      await queryClient.invalidateQueries({ queryKey: academicLedgerKeys.uploads() })
    },
  })
}
