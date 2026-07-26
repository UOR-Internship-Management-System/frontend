import { queryKeys } from '../../../shared/api/queryKeys'
import type { ShortlistDetailQuery, ShortlistsQuery } from '../types/shortlistTypes'

export const shortlistKeys = {
  all: [...queryKeys.protected, 'shortlists'] as const,

  lists: () => [...shortlistKeys.all, 'list'] as const,

  list: (query: ShortlistsQuery) => [...shortlistKeys.lists(), query] as const,

  details: () => [...shortlistKeys.all, 'detail'] as const,

  detailRoot: (shortlistId: string) => [...shortlistKeys.details(), shortlistId] as const,

  detail: (query: ShortlistDetailQuery) =>
    [...shortlistKeys.detailRoot(query.shortlistId), query] as const,
}
