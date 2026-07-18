import { httpClient } from '../../../shared/api/httpClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import { gpaSummarySchema, pagedAcademicRecordsSchema } from '../schemas/academicRecordSchemas'
import type { AcademicRecordQuery } from '../types/academicRecordTypes'

export const academicRecordsApi = {
  async getGpa(signal?: AbortSignal) {
    const response = await httpClient<unknown>('/me/academic-records/gpa', { signal })
    return gpaSummarySchema.parse(response)
  },

  async list(query: AcademicRecordQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/me/academic-records${buildQueryString({
        page: query.page,
        size: query.size,
        sort: query.sort,
        search: query.search,
      })}`,
      { signal },
    )
    return pagedAcademicRecordsSchema.parse(response)
  },
}
