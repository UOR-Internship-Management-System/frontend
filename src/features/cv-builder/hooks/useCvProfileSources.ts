import { useQuery } from '@tanstack/react-query'
import {
  activitiesApi,
  awardsApi,
  certificatesApi,
  experienceApi,
} from '../../student-profile/api/studentProfileEntriesApi'
import { studentProfileKeys } from '../../student-profile/hooks/studentProfileKeys'
import type {
  Activity,
  Award,
  Certificate,
  Experience,
  PagedResponse,
  ProfileCollectionKind,
  ProfileCollectionQuery,
} from '../../student-profile/types/profileEntryTypes'

const sourcePageSize = 100
const sourceSort = 'updatedAt,desc'

export type CvProfileSourceItem = {
  id: string
  label: string
  defaultSelected: boolean
}

type CollectionList<TItem> = (
  query: ProfileCollectionQuery,
  signal?: AbortSignal,
) => Promise<PagedResponse<TItem>>

async function loadAll<TItem>(list: CollectionList<TItem>, signal: AbortSignal) {
  const query = { page: 0, size: sourcePageSize, sort: sourceSort, search: '' }
  const first = await list(query, signal)
  if (first.page.totalPages <= 1) return first.items

  const remaining = await Promise.all(
    Array.from({ length: first.page.totalPages - 1 }, (_, index) =>
      list({ ...query, page: index + 1 }, signal),
    ),
  )
  return [...first.items, ...remaining.flatMap((page) => page.items)]
}

function useCvProfileSource<TItem>(
  kind: ProfileCollectionKind,
  list: CollectionList<TItem>,
  mapItem: (item: TItem) => CvProfileSourceItem,
) {
  return useQuery({
    queryKey: [...studentProfileKeys.collection(kind), 'cv-source-summary'],
    queryFn: async ({ signal }) => (await loadAll(list, signal)).map(mapItem),
    staleTime: 60_000,
  })
}

export const useCvExperienceSources = () =>
  useCvProfileSource<Experience>('experience', experienceApi.list, (item) => ({
    id: item.id,
    label: `${item.positionTitle} at ${item.organization}`,
    defaultSelected: item.cvInclude,
  }))

export const useCvCertificateSources = () =>
  useCvProfileSource<Certificate>('certificates', certificatesApi.list, (item) => ({
    id: item.id,
    label: `${item.title} — ${item.issuer}`,
    defaultSelected: item.cvInclude,
  }))

export const useCvAwardSources = () =>
  useCvProfileSource<Award>('awards', awardsApi.list, (item) => ({
    id: item.id,
    label: `${item.title} — ${item.issuer}`,
    defaultSelected: item.cvInclude,
  }))

export const useCvActivitySources = () =>
  useCvProfileSource<Activity>('activities', activitiesApi.list, (item) => ({
    id: item.id,
    label: `${item.activityName} — ${item.roleTitle}`,
    defaultSelected: item.cvInclude,
  }))
