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
