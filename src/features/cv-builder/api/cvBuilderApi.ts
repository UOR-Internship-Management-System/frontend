import { z } from 'zod'
import { httpDownloadClient } from '../../../shared/api/httpDownloadClient'
import { httpClient } from '../../../shared/api/httpClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import {
  cvFreshnessSchema,
  cvPreviewRequestSchema,
  cvPreviewSchema,
  cvVersionCreateRequestSchema,
  cvVersionSchema,
  pagedCvVersionsSchema,
} from '../schemas/cvBuilderSchemas'
import type { CvPreviewRequest, CvVersionQuery } from '../types/cvBuilderTypes'

const uuidSchema = z.string().uuid()

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

  async saveVersion(previewId: string, signal?: AbortSignal) {
    const request = cvVersionCreateRequestSchema.parse({ previewId })
    const response = await httpClient<unknown>('/me/cv/versions', {
      method: 'POST',
      body: request,
      signal,
    })
    return cvVersionSchema.parse(response)
  },

  async listVersions(query: CvVersionQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/me/cv/versions${buildQueryString({
        page: query.page,
        size: query.size,
        sort: query.sort,
      })}`,
      { signal },
    )
    return pagedCvVersionsSchema.parse(response)
  },

  async getVersion(cvVersionId: string, signal?: AbortSignal) {
    const id = uuidSchema.parse(cvVersionId)
    const response = await httpClient<unknown>(`/me/cv/versions/${id}`, { signal })
    return cvVersionSchema.parse(response)
  },

  async downloadVersion(cvVersionId: string, signal?: AbortSignal) {
    const id = uuidSchema.parse(cvVersionId)
    return httpDownloadClient(`/me/cv/versions/${id}/download`, { signal })
  },

  async downloadLatest(signal?: AbortSignal) {
    return httpDownloadClient('/me/cv/latest/download', { signal })
  },
}
