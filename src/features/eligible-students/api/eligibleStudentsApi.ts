import { httpClient } from '../../../shared/api/httpClient'
import {
  eligibleStudentImportResultSchema,
  eligibleStudentPagedResponseSchema,
  eligibleStudentSchema,
} from '../schemas/eligibleStudentSchemas'
import type {
  EligibleStudent,
  EligibleStudentImportResult,
  EligibleStudentQuery,
  EligibleStudentRequest,
  PagedResponse,
} from '../types/eligibleStudentTypes'

const basePath = '/admin/eligible-students'

function listPath(query: EligibleStudentQuery) {
  const parameters = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    sort: query.sort,
  })
  if (query.search.trim()) parameters.set('search', query.search.trim())
  return `${basePath}?${parameters.toString()}`
}

export const eligibleStudentsApi = {
  async list(query: EligibleStudentQuery, signal?: AbortSignal): Promise<PagedResponse<EligibleStudent>> {
    return eligibleStudentPagedResponseSchema.parse(
      await httpClient<unknown>(listPath(query), { signal }),
    ) as PagedResponse<EligibleStudent>
  },
  async create(values: EligibleStudentRequest): Promise<EligibleStudent> {
    return eligibleStudentSchema.parse(
      await httpClient<unknown>(basePath, { method: 'POST', body: values }),
    ) as EligibleStudent
  },
  async update(id: string, values: EligibleStudentRequest): Promise<EligibleStudent> {
    return eligibleStudentSchema.parse(
      await httpClient<unknown>(`${basePath}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: values,
      }),
    ) as EligibleStudent
  },
  async remove(id: string): Promise<void> {
    await httpClient<void>(`${basePath}/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
  async importFile(file: File): Promise<EligibleStudentImportResult> {
    const body = new FormData()
    body.set('file', file)
    return eligibleStudentImportResultSchema.parse(
      await httpClient<unknown>(`${basePath}/import`, { method: 'POST', body }),
    ) as EligibleStudentImportResult
  },
}
