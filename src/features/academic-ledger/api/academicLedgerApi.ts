import { httpClient, httpClientWithResponse } from '../../../shared/api/httpClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import {
  ledgerCommitResponseSchema,
  ledgerUploadDetailSchema,
  ledgerValidationResultSchema,
  pagedLedgerStagedRowsSchema,
  pagedLedgerUploadsSchema,
} from '../schemas/ledgerSchemas'
import type { LedgerStagedRowsQuery, LedgerUploadsQuery } from '../types/academicLedgerTypes'

function parseRetryAfter(value: string | null) {
  if (!value || !/^\d+$/.test(value.trim())) return null
  const seconds = Number(value)
  return Number.isSafeInteger(seconds) && seconds > 0 ? seconds : null
}

export const academicLedgerApi = {
  async upload(file: File, signal?: AbortSignal) {
    const body = new FormData()
    body.set('file', file)
    const response = await httpClientWithResponse<unknown>('/admin/academic-ledger/uploads', {
      method: 'POST',
      body,
      signal,
    })
    return {
      data: ledgerUploadDetailSchema.parse(response.data),
      location: response.headers.get('Location'),
      retryAfterSeconds: parseRetryAfter(response.headers.get('Retry-After')),
    }
  },

  async listUploads(query: LedgerUploadsQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/admin/academic-ledger/uploads${buildQueryString({
        page: query.page,
        size: query.size,
        sort: query.sort,
        search: query.search,
        status: query.status,
        validationStatus: query.validationStatus,
      })}`,
      { signal },
    )
    return pagedLedgerUploadsSchema.parse(response)
  },

  async getUpload(uploadId: string, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/admin/academic-ledger/uploads/${encodeURIComponent(uploadId)}`,
      { signal },
    )
    return ledgerUploadDetailSchema.parse(response)
  },

  async listStagedRows(uploadId: string, query: LedgerStagedRowsQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/admin/academic-ledger/uploads/${encodeURIComponent(uploadId)}/staged-rows${buildQueryString(
        {
          page: query.page,
          size: query.size,
          sort: query.sort,
          search: query.search,
          validationStatus: query.validationStatus,
        },
      )}`,
      { signal },
    )
    return pagedLedgerStagedRowsSchema.parse(response)
  },

  async getValidation(uploadId: string, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/admin/academic-ledger/uploads/${encodeURIComponent(uploadId)}/validation-results`,
      { signal },
    )
    return ledgerValidationResultSchema.parse(response)
  },

  async commit(uploadId: string, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/admin/academic-ledger/uploads/${encodeURIComponent(uploadId)}/commit`,
      { method: 'POST', body: { confirm: true }, signal },
    )
    return ledgerCommitResponseSchema.parse(response)
  },
}
