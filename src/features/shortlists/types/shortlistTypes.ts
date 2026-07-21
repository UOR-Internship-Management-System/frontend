import type {
  ApiCandidateSort,
  ApiPagedShortlistCandidateResponse,
  ApiPagedShortlistResponse,
  ApiShortlistCandidateMutationResponse,
  ApiShortlistCandidateRequest,
  ApiShortlistCandidateResponse,
  ApiShortlistCreateRequest,
  ApiShortlistDetailResponse,
  ApiShortlistFinalizeRequest,
  ApiShortlistFinalizeResponse,
  ApiShortlistResponse,
  ApiShortlistSort,
  ApiShortlistStatus,
} from '../../../shared/api/generated/cvManagementApi.types'

export type ShortlistStatus = ApiShortlistStatus
export type ShortlistSort = ApiShortlistSort
export type ShortlistCandidateSort = ApiCandidateSort
export type ShortlistPageSize = 20 | 50 | 100
export type ShortlistCandidatePageSize = 20 | 50 | 100

export type ShortlistCreateInput = ApiShortlistCreateRequest
export type Shortlist = ApiShortlistResponse
export type ShortlistDetail = ApiShortlistDetailResponse
export type ShortlistCandidate = ApiShortlistCandidateResponse
export type ShortlistCandidateMutation = ApiShortlistCandidateMutationResponse
export type ShortlistFinalizeResult = ApiShortlistFinalizeResponse
export type PagedShortlists = ApiPagedShortlistResponse
export type PagedShortlistCandidates = ApiPagedShortlistCandidateResponse

export type ShortlistsQuery = {
  page: number
  size: ShortlistPageSize
  sort: ShortlistSort
  search: string
  status?: ShortlistStatus
  companyId?: string
}

export type ShortlistDetailQuery = {
  shortlistId: string
  candidatePage: number
  candidateSize: ShortlistCandidatePageSize
  candidateSearch: string
  candidateSort: ShortlistCandidateSort
}

export type AddShortlistCandidatesInput = {
  shortlistId: string
  version: number
  body: ApiShortlistCandidateRequest
}

export type RemoveShortlistCandidateInput = {
  shortlistId: string
  studentId: string
  version: number
}

export type FinalizeShortlistInput = {
  shortlistId: string
  version: number
  body: ApiShortlistFinalizeRequest
}

export type ShortlistsUrlState = {
  search: string
  status?: ShortlistStatus
  companyId?: string
  sort: ShortlistSort
  page: number
  size: ShortlistPageSize
  selectedShortlistId?: string
  candidateSearch: string
  candidateSort: ShortlistCandidateSort
  candidatePage: number
  candidateSize: ShortlistCandidatePageSize
  summaryExportJobId?: string
  bulkCvExportJobId?: string
}
