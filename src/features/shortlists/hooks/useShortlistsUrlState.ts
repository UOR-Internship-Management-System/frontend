import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { readNonnegativeInteger, useUrlQueryState } from '../../../shared/hooks/useUrlQueryState'
import {
  shortlistCandidateSortSchema,
  shortlistSortSchema,
  shortlistStatusSchema,
} from '../schemas/shortlistSchemas'
import type {
  ShortlistCandidatePageSize,
  ShortlistPageSize,
  ShortlistsUrlState,
} from '../types/shortlistTypes'

const allowedSizes = [20, 50, 100] as const

const shortlistUrlKeys = [
  'shortlistSearch',
  'shortlistStatus',
  'shortlistCompanyId',
  'shortlistSort',
  'shortlistPage',
  'shortlistSize',
  'shortlistId',
  'shortlistCandidateSearch',
  'shortlistCandidateSort',
  'shortlistCandidatePage',
  'shortlistCandidateSize',
  'summaryExportJobId',
  'bulkCvExportJobId',
] as const

export const defaultShortlistsUrlState: ShortlistsUrlState = {
  search: '',
  status: undefined,
  companyId: undefined,
  sort: 'updatedAt,desc',
  page: 0,
  size: 20,
  selectedShortlistId: undefined,
  candidateSearch: '',
  candidateSort: 'officialGpa,desc',
  candidatePage: 0,
  candidateSize: 20,
  summaryExportJobId: undefined,
  bulkCvExportJobId: undefined,
}

function optionalUuid(value: string | null) {
  return value && z.string().uuid().safeParse(value).success ? value : undefined
}

function pageSize<TSize extends ShortlistPageSize | ShortlistCandidatePageSize>(
  value: string | null,
): TSize {
  const parsed = readNonnegativeInteger(value, 20)

  return (allowedSizes.includes(parsed as (typeof allowedSizes)[number]) ? parsed : 20) as TSize
}

export function parseShortlistsUrlState(parameters: URLSearchParams): ShortlistsUrlState {
  const status = shortlistStatusSchema.safeParse(parameters.get('shortlistStatus'))

  const sort = shortlistSortSchema.safeParse(parameters.get('shortlistSort'))

  const candidateSort = shortlistCandidateSortSchema.safeParse(
    parameters.get('shortlistCandidateSort'),
  )

  return {
    search: (parameters.get('shortlistSearch') ?? '').trim().slice(0, 120),

    status: status.success ? status.data : undefined,

    companyId: optionalUuid(parameters.get('shortlistCompanyId')),

    sort: sort.success ? sort.data : 'updatedAt,desc',

    page: readNonnegativeInteger(parameters.get('shortlistPage'), 0),

    size: pageSize<ShortlistPageSize>(parameters.get('shortlistSize')),

    selectedShortlistId: optionalUuid(parameters.get('shortlistId')),

    candidateSearch: (parameters.get('shortlistCandidateSearch') ?? '').trim().slice(0, 120),

    candidateSort: candidateSort.success ? candidateSort.data : 'officialGpa,desc',

    candidatePage: readNonnegativeInteger(parameters.get('shortlistCandidatePage'), 0),

    candidateSize: pageSize<ShortlistCandidatePageSize>(parameters.get('shortlistCandidateSize')),

    summaryExportJobId: optionalUuid(parameters.get('summaryExportJobId')),

    bulkCvExportJobId: optionalUuid(parameters.get('bulkCvExportJobId')),
  }
}

export function serializeShortlistsUrlState(state: ShortlistsUrlState) {
  const parameters = new URLSearchParams()

  if (state.search) {
    parameters.set('shortlistSearch', state.search)
  }

  if (state.status) {
    parameters.set('shortlistStatus', state.status)
  }

  if (state.companyId) {
    parameters.set('shortlistCompanyId', state.companyId)
  }

  if (state.sort !== 'updatedAt,desc') {
    parameters.set('shortlistSort', state.sort)
  }

  if (state.page > 0) {
    parameters.set('shortlistPage', String(state.page))
  }

  if (state.size !== 20) {
    parameters.set('shortlistSize', String(state.size))
  }

  if (state.selectedShortlistId) {
    parameters.set('shortlistId', state.selectedShortlistId)
  }

  if (state.candidateSearch) {
    parameters.set('shortlistCandidateSearch', state.candidateSearch)
  }

  if (state.candidateSort !== 'officialGpa,desc') {
    parameters.set('shortlistCandidateSort', state.candidateSort)
  }

  if (state.candidatePage > 0) {
    parameters.set('shortlistCandidatePage', String(state.candidatePage))
  }

  if (state.candidateSize !== 20) {
    parameters.set('shortlistCandidateSize', String(state.candidateSize))
  }

  if (state.summaryExportJobId) {
    parameters.set('summaryExportJobId', state.summaryExportJobId)
  }

  if (state.bulkCvExportJobId) {
    parameters.set('bulkCvExportJobId', state.bulkCvExportJobId)
  }

  return parameters
}

export function useShortlistsUrlState() {
  const [state, setState] = useUrlQueryState({
    ownedKeys: shortlistUrlKeys,
    parse: parseShortlistsUrlState,
    serialize: serializeShortlistsUrlState,
  })

  const [searchInput, setSearchInput] = useState(state.search)

  const [candidateSearchInput, setCandidateSearchInput] = useState(state.candidateSearch)

  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300)

  const debouncedCandidateSearch = useDebouncedValue(candidateSearchInput.trim(), 300)

  useEffect(() => {
    setSearchInput(state.search)
  }, [state.search])

  useEffect(() => {
    setCandidateSearchInput(state.candidateSearch)
  }, [state.candidateSearch])

  useEffect(() => {
    const search = debouncedSearch.slice(0, 120)

    const candidateSearch = debouncedCandidateSearch.slice(0, 120)

    const searchChanged = searchInput.trim().slice(0, 120) === search && search !== state.search

    const candidateSearchChanged =
      candidateSearchInput.trim().slice(0, 120) === candidateSearch &&
      candidateSearch !== state.candidateSearch

    if (!searchChanged && !candidateSearchChanged) {
      return
    }

    setState(
      {
        ...state,

        ...(searchChanged
          ? {
              search,
              page: 0,
            }
          : {}),

        ...(candidateSearchChanged
          ? {
              candidateSearch,
              candidatePage: 0,
            }
          : {}),
      },
      {
        replace: true,
      },
    )
  }, [
    candidateSearchInput,
    debouncedCandidateSearch,
    debouncedSearch,
    searchInput,
    setState,
    state,
  ])

  const updateState = useCallback(
    (patch: Partial<ShortlistsUrlState>) => {
      const selectedShortlistChanged =
        'selectedShortlistId' in patch && patch.selectedShortlistId !== state.selectedShortlistId

      const resetsListPage = Object.keys(patch).some((key) =>
        ['search', 'status', 'companyId', 'sort', 'size'].includes(key),
      )

      const resetsCandidatePage = Object.keys(patch).some((key) =>
        ['candidateSearch', 'candidateSort', 'candidateSize'].includes(key),
      )

      if (selectedShortlistChanged) {
        setCandidateSearchInput('')
      }

      setState({
        ...state,
        ...patch,

        ...(resetsListPage
          ? {
              page: 0,
            }
          : {}),

        ...(resetsCandidatePage
          ? {
              candidatePage: 0,
            }
          : {}),

        ...(selectedShortlistChanged
          ? {
              candidateSearch: '',
              candidateSort: 'officialGpa,desc' as const,
              candidatePage: 0,
              candidateSize: 20 as const,
              summaryExportJobId: undefined,
              bulkCvExportJobId: undefined,
            }
          : {}),
      })
    },
    [setState, state],
  )

  return {
    state,
    searchInput,
    setSearchInput,
    candidateSearchInput,
    setCandidateSearchInput,
    updateState,
  }
}
