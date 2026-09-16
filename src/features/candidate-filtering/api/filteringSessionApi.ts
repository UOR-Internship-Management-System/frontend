import { httpClient } from '../../../shared/api/httpClient'
import {
  adminFilteringSessionResponseSchema,
  adminFilteringSessionUpsertRequestSchema,
} from '../schemas/filteringSessionSchemas'
import type { AdminFilteringSessionUpsertRequest } from '../schemas/filteringSessionSchemas'

const sessionPath = '/admin/filtering-session'

export const filteringSessionApi = {
  async getMine(signal?: AbortSignal) {
    return adminFilteringSessionResponseSchema.parse(
      await httpClient<unknown>(sessionPath, { signal }),
    )
  },

  async save(input: AdminFilteringSessionUpsertRequest) {
    const body = adminFilteringSessionUpsertRequestSchema.parse(input)
    return adminFilteringSessionResponseSchema.parse(
      await httpClient<unknown>(sessionPath, { method: 'PUT', body }),
    )
  },

  async clearMine() {
    await httpClient<void>(sessionPath, { method: 'DELETE' })
  },
}
