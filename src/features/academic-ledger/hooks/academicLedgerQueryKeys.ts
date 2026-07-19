import { queryKeys } from '../../../shared/api/queryKeys'
import type { LedgerStagedRowsQuery, LedgerUploadsQuery } from '../types/academicLedgerTypes'

export const academicLedgerKeys = {
  all: [...queryKeys.protected, 'academic-ledger'] as const,
  uploads: () => [...academicLedgerKeys.all, 'uploads'] as const,
  uploadList: (query: LedgerUploadsQuery) =>
    [...academicLedgerKeys.uploads(), 'list', query] as const,
  upload: (uploadId: string) => [...academicLedgerKeys.uploads(), uploadId] as const,
  stagedRows: (uploadId: string, query: LedgerStagedRowsQuery) =>
    [...academicLedgerKeys.upload(uploadId), 'staged-rows', query] as const,
  validation: (uploadId: string) => [...academicLedgerKeys.upload(uploadId), 'validation'] as const,
}
