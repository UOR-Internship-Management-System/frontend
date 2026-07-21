import type {
  ApiShortlistCandidateMutationResponse,
  ApiShortlistCandidateRequest,
  ApiShortlistCreateRequest,
  ApiShortlistResponse,
} from '../../../shared/api/generated/cvManagementApi.types'

export type ShortlistCreateInput = ApiShortlistCreateRequest
export type Shortlist = ApiShortlistResponse
export type ShortlistCandidateMutation = ApiShortlistCandidateMutationResponse
export type AddShortlistCandidatesInput = {
  shortlistId: string
  version: number
  body: ApiShortlistCandidateRequest
}
