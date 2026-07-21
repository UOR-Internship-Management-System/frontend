import { formatIfMatchVersion } from '../../../shared/api/formatIfMatchVersion'
import { httpClient } from '../../../shared/api/httpClient'
import {
  shortlistCandidateMutationResponseSchema,
  shortlistCandidateRequestSchema,
  shortlistCreateRequestSchema,
  shortlistResponseSchema,
} from '../schemas/shortlistSchemas'
import type { AddShortlistCandidatesInput, ShortlistCreateInput } from '../types/shortlistTypes'

const shortlistsPath = '/admin/shortlists'

export const shortlistsApi = {
  async createDraft(input: ShortlistCreateInput) {
    const body = shortlistCreateRequestSchema.parse(input)
    return shortlistResponseSchema.parse(
      await httpClient<unknown>(shortlistsPath, { method: 'POST', body }),
    )
  },

  async addCandidates({ body: input, shortlistId, version }: AddShortlistCandidatesInput) {
    const body = shortlistCandidateRequestSchema.parse(input)
    return shortlistCandidateMutationResponseSchema.parse(
      await httpClient<unknown>(`${shortlistsPath}/${encodeURIComponent(shortlistId)}/candidates`, {
        method: 'POST',
        body,
        headers: { 'If-Match': formatIfMatchVersion(version) },
      }),
    )
  },
}
