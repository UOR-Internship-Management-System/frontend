import { httpClient, httpClientWithResponse } from '../../../shared/api/httpClient'
import { httpDownloadClient } from '../../../shared/api/httpDownloadClient'
import {
  bulkCvExportCreateRequestSchema,
  exportJobResponseSchema,
  shortlistSummaryExportCreateRequestSchema,
} from '../schemas/exportSchemas'
import type {
  BulkCvExportInput,
  CandidateCvDownloadInput,
  ExportDownloadInput,
  ShortlistSummaryExportInput,
} from '../types/exportTypes'

const exportsPath = '/admin/exports'
function shortlistExportPath(shortlistId: string) {
  return `${exportsPath}/shortlists/${encodeURIComponent(shortlistId)}`
}
function exportJobPath(exportJobId: string) {
  return `${exportsPath}/${encodeURIComponent(exportJobId)}`
}
function parseRetryAfter(value: string | null) {
  if (!value || !/^\d+$/.test(value.trim())) return null
  const seconds = Number(value)
  return Number.isSafeInteger(seconds) && seconds > 0 ? seconds : null
}

export const exportsApi = {
  async startSummaryExport(
    shortlistId: string,
    input: ShortlistSummaryExportInput = { format: 'CSV' },
    signal?: AbortSignal,
  ) {
    const response = await httpClientWithResponse<unknown>(shortlistExportPath(shortlistId), {
      method: 'POST',
      body: shortlistSummaryExportCreateRequestSchema.parse(input),
      signal,
    })
    return {
      job: exportJobResponseSchema.parse(response.data),
      retryAfterSeconds: parseRetryAfter(response.headers.get('Retry-After')),
    }
  },

  async startBulkCvExport(
    shortlistId: string,
    input: BulkCvExportInput = { format: 'ZIP' },
    signal?: AbortSignal,
  ) {
    const response = await httpClientWithResponse<unknown>(
      `${shortlistExportPath(shortlistId)}/bulk-cvs`,
      {
        method: 'POST',
        body: bulkCvExportCreateRequestSchema.parse(input),
        signal,
      },
    )
    return {
      job: exportJobResponseSchema.parse(response.data),
      retryAfterSeconds: parseRetryAfter(response.headers.get('Retry-After')),
    }
  },

  async getExportJob(exportJobId: string, signal?: AbortSignal) {
    return exportJobResponseSchema.parse(
      await httpClient<unknown>(exportJobPath(exportJobId), { signal }),
    )
  },

  async downloadExport({ contentType, exportJobId }: ExportDownloadInput, signal?: AbortSignal) {
    const bulkSuffix = contentType === 'application/zip' ? '/bulk-cvs' : ''
    return httpDownloadClient(`${exportJobPath(exportJobId)}${bulkSuffix}/download`, {
      signal,
      expectedContentType: contentType,
      fallbackFilename: contentType === 'text/csv' ? 'shortlist.csv' : 'shortlist-cvs.zip',
    })
  },

  async downloadCandidateCv(
    { fallbackFilename, studentId }: CandidateCvDownloadInput,
    signal?: AbortSignal,
  ) {
    return httpDownloadClient(
      `/admin/students/${encodeURIComponent(studentId)}/latest-cv/download`,
      { signal, expectedContentType: 'application/pdf', fallbackFilename },
    )
  },
}
