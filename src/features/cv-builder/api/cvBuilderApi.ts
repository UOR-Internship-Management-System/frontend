import { httpDownloadClient } from '../../../shared/api/httpDownloadClient'
import { httpClient } from '../../../shared/api/httpClient'
import {
  cvFreshnessSchema,
  cvPreviewRequestSchema,
  cvPreviewSchema,
  cvSaveRequestSchema,
  cvSchema,
} from '../schemas/cvBuilderSchemas'
import type { CvPreviewRequest } from '../types/cvBuilderTypes'

export const cvBuilderApi = {
  async getFreshness(signal?: AbortSignal) {
    const response = await httpClient<unknown>('/me/cv/source-freshness', { signal })
    return cvFreshnessSchema.parse(response)
  },

  async createPreview(body: CvPreviewRequest, signal?: AbortSignal) {
    const request = cvPreviewRequestSchema.parse(body)
    const response = await httpClient<unknown>('/me/cv/preview', {
      method: 'POST',
      body: request,
      signal,
    })
    return cvPreviewSchema.parse(response)
  },

  async getCurrent(signal?: AbortSignal) {
    const response = await httpClient<unknown>('/me/cv', { signal })
    return cvSchema.parse(response)
  },

  async saveCurrent(previewId: string, revision: number | null, signal?: AbortSignal) {
    const request = cvSaveRequestSchema.parse({ previewId })
    const response = await httpClient<unknown>('/me/cv', {
      method: 'PUT',
      body: request,
      headers: revision === null ? { 'If-None-Match': '*' } : { 'If-Match': `"${revision}"` },
      signal,
    })
    return cvSchema.parse(response)
  },

  async downloadCurrent(signal?: AbortSignal) {
    return httpDownloadClient('/me/cv/download', { signal })
  },
}
