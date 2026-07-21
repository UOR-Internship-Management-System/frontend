import type {
  ApiBulkCvExportCreateRequest,
  ApiExportJobResponse,
  ApiExportJobStatus,
  ApiExportType,
  ApiShortlistSummaryExportCreateRequest,
} from '../../../shared/api/generated/cvManagementApi.types'
import type { DownloadContentType } from '../../../shared/api/httpDownloadClient'

export type ExportJob = ApiExportJobResponse
export type ExportJobStatus = ApiExportJobStatus
export type ExportType = ApiExportType
export type ShortlistSummaryExportInput = ApiShortlistSummaryExportCreateRequest
export type BulkCvExportInput = ApiBulkCvExportCreateRequest
export type ExportJobStartResult = { job: ExportJob; retryAfterSeconds: number | null }
export type ExportDownloadInput = {
  exportJobId: string
  contentType: Extract<DownloadContentType, 'text/csv' | 'application/zip'>
}
export type CandidateCvDownloadInput = { studentId: string; fallbackFilename: string }
