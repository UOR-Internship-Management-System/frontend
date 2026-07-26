import { httpClient } from '../../../shared/api/httpClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import {
  candidateFilteringCriteriaRequestSchema,
  candidateFilteringRunResponseSchema,
  pagedCandidateFilteringCandidateResponseSchema,
} from '../schemas/candidateFilteringSchemas'
import type {
  CandidateFilteringCriteriaInput,
  CandidateResultsQuery,
} from '../types/candidateFilteringTypes'

const filteringRunsPath = '/admin/candidate-filtering/runs'

function filteringRunPath(filterRunId: string) {
  return `${filteringRunsPath}/${encodeURIComponent(filterRunId)}`
}

export const candidateFilteringApi = {
  async createRun(input: CandidateFilteringCriteriaInput) {
    const body = candidateFilteringCriteriaRequestSchema.parse(input)
    return candidateFilteringRunResponseSchema.parse(
      await httpClient<unknown>(filteringRunsPath, { method: 'POST', body }),
    )
  },

  async getRun(filterRunId: string, signal?: AbortSignal) {
    return candidateFilteringRunResponseSchema.parse(
      await httpClient<unknown>(filteringRunPath(filterRunId), { signal }),
    )
  },

  async listCandidates(query: CandidateResultsQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `${filteringRunPath(query.filterRunId)}/candidates${buildQueryString({
        page: query.page,
        size: query.size,
        search: query.search,
        sort: query.sort,
      })}`,
      { signal },
    )
    return pagedCandidateFilteringCandidateResponseSchema.parse(response)
  },
}
