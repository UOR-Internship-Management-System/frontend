import type {
  ApiCandidateFilteringCandidateResponse,
  ApiCandidateFilteringCriteriaRequest,
  ApiCandidateFilteringCriteriaResponse,
  ApiCandidateFilteringRunResponse,
  ApiCandidateSort,
  ApiFilterSkillMatchMode,
  ApiPagedCandidateFilteringCandidateResponse,
} from '../../../shared/api/generated/cvManagementApi.types'

export type FilterSkillMatchMode = ApiFilterSkillMatchMode
export type CandidateSort = ApiCandidateSort
export type CandidateFilteringCriteriaInput = ApiCandidateFilteringCriteriaRequest
export type CandidateFilteringCriteria = ApiCandidateFilteringCriteriaResponse
export type CandidateFilteringRun = ApiCandidateFilteringRunResponse
export type CandidateFilteringCandidate = ApiCandidateFilteringCandidateResponse
export type PagedCandidateFilteringCandidates = ApiPagedCandidateFilteringCandidateResponse

export type CandidatePageSize = 5 | 20 | 50 | 100
export type CandidateResultsQuery = {
  filterRunId: string
  page: number
  size: CandidatePageSize
  search: string
  sort: CandidateSort
}

export type CandidateFilteringUrlState = {
  requestId?: string
  minGpa?: number
  maxGpa?: number
  requestSkillIds: string[]
  additionalSkillIds: string[]
  matchMode: FilterSkillMatchMode
  runId?: string
  candidateSearch: string
  candidateSort: CandidateSort
  candidatePage: number
  candidateSize: CandidatePageSize
}
