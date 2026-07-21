import { formatIfMatchVersion } from '../../../shared/api/formatIfMatchVersion'
import { httpClient } from '../../../shared/api/httpClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import {
  pagedShortlistResponseSchema,
  shortlistCandidateMutationResponseSchema,
  shortlistCandidateRequestSchema,
  shortlistCreateRequestSchema,
  shortlistDetailResponseSchema,
  shortlistFinalizeRequestSchema,
  shortlistFinalizeResponseSchema,
  shortlistResponseSchema,
} from '../schemas/shortlistSchemas'
import type {
  AddShortlistCandidatesInput,
  FinalizeShortlistInput,
  RemoveShortlistCandidateInput,
  ShortlistCreateInput,
  ShortlistDetailQuery,
  ShortlistsQuery,
} from '../types/shortlistTypes'

const shortlistsPath = '/admin/shortlists'

function shortlistPath(shortlistId: string) {
  return `${shortlistsPath}/${encodeURIComponent(shortlistId)}`
}

function shortlistCandidatesPath(shortlistId: string) {
  return `${shortlistPath(shortlistId)}/candidates`
}

export const shortlistsApi = {
  async listShortlists(query: ShortlistsQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `${shortlistsPath}${buildQueryString({
        page: query.page,
        size: query.size,
        sort: query.sort,
        search: query.search,
        status: query.status,
        companyId: query.companyId,
      })}`,
      { signal },
    )
    return pagedShortlistResponseSchema.parse(response)
  },

  async getShortlistDetail(query: ShortlistDetailQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `${shortlistPath(query.shortlistId)}${buildQueryString({
        candidatePage: query.candidatePage,
        candidateSize: query.candidateSize,
        candidateSearch: query.candidateSearch,
        sort: query.candidateSort,
      })}`,
      { signal },
    )
    return shortlistDetailResponseSchema.parse(response)
  },

  async createDraft(input: ShortlistCreateInput) {
    const body = shortlistCreateRequestSchema.parse(input)
    return shortlistResponseSchema.parse(
      await httpClient<unknown>(shortlistsPath, { method: 'POST', body }),
    )
  },

  async addCandidates({ body: input, shortlistId, version }: AddShortlistCandidatesInput) {
    const body = shortlistCandidateRequestSchema.parse(input)
    return shortlistCandidateMutationResponseSchema.parse(
      await httpClient<unknown>(shortlistCandidatesPath(shortlistId), {
        method: 'POST',
        body,
        headers: { 'If-Match': formatIfMatchVersion(version) },
      }),
    )
  },

  async removeCandidate({ shortlistId, studentId, version }: RemoveShortlistCandidateInput) {
    return shortlistCandidateMutationResponseSchema.parse(
      await httpClient<unknown>(
        `${shortlistCandidatesPath(shortlistId)}/${encodeURIComponent(studentId)}`,
        {
          method: 'DELETE',
          headers: { 'If-Match': formatIfMatchVersion(version) },
        },
      ),
    )
  },

  async finalize({ body: input, shortlistId, version }: FinalizeShortlistInput) {
    const body = shortlistFinalizeRequestSchema.parse(input)
    return shortlistFinalizeResponseSchema.parse(
      await httpClient<unknown>(`${shortlistPath(shortlistId)}/finalize`, {
        method: 'POST',
        body,
        headers: { 'If-Match': formatIfMatchVersion(version) },
      }),
    )
  },
}
