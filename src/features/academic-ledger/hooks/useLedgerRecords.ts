import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { academicLedgerApi } from '../api/academicLedgerApi'
import type { LedgerStagedRowsQuery } from '../types/academicLedgerTypes'
import { academicLedgerKeys } from './academicLedgerQueryKeys'
import { shouldRetryAcademicLedger } from './useLedgerUpload'

export function useLedgerStagedRows(uploadId: string | null, query: LedgerStagedRowsQuery) {
  return useQuery({
    enabled: Boolean(uploadId),
    queryKey: academicLedgerKeys.stagedRows(uploadId ?? '', query),
    queryFn: ({ signal }) => academicLedgerApi.listStagedRows(uploadId ?? '', query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryAcademicLedger,
  })
}

export function useLedgerValidation(uploadId: string | null) {
  return useQuery({
    enabled: Boolean(uploadId),
    queryKey: academicLedgerKeys.validation(uploadId ?? ''),
    queryFn: ({ signal }) => academicLedgerApi.getValidation(uploadId ?? '', signal),
    retry: shouldRetryAcademicLedger,
  })
}
