import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { readNonnegativeInteger, useUrlQueryState } from '../../../shared/hooks/useUrlQueryState'
import {
  internshipRequestSortSchema,
  internshipRequestStatusSchema,
} from '../schemas/internshipSchemas'
import type {
  InternshipRequestPageSize,
  InternshipRequestsUrlState,
} from '../types/internshipManagementTypes'

const allowedSizes = [20, 50, 100] as const

export const defaultInternshipRequestsUrlState: InternshipRequestsUrlState = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
  search: '',
  status: undefined,
  companyId: undefined,
  selectedRequestId: undefined,
}

function optionalUuid(value: string | null) {
  return value && z.string().uuid().safeParse(value).success ? value : undefined
}

export function parseInternshipRequestsUrlState(
  parameters: URLSearchParams,
): InternshipRequestsUrlState {
  const size = readNonnegativeInteger(parameters.get('requestSize'), 20)
  const sort = internshipRequestSortSchema.safeParse(parameters.get('requestSort'))
  const status = internshipRequestStatusSchema.safeParse(parameters.get('requestStatus'))

  return {
    page: readNonnegativeInteger(parameters.get('requestPage'), 0),
    size: allowedSizes.includes(size as InternshipRequestPageSize)
      ? (size as InternshipRequestPageSize)
      : 20,
    sort: sort.success ? sort.data : 'createdAt,desc',
    search: (parameters.get('requestSearch') ?? '').trim().slice(0, 120),
    status: status.success ? status.data : undefined,
    companyId: optionalUuid(parameters.get('requestCompanyId')),
    selectedRequestId: optionalUuid(parameters.get('requestId')),
  }
}

export function serializeInternshipRequestsUrlState(state: InternshipRequestsUrlState) {
  const parameters = new URLSearchParams()
  if (state.search) parameters.set('requestSearch', state.search)
  if (state.status) parameters.set('requestStatus', state.status)
  if (state.companyId) parameters.set('requestCompanyId', state.companyId)
  if (state.sort !== 'createdAt,desc') parameters.set('requestSort', state.sort)
  if (state.page > 0) parameters.set('requestPage', String(state.page))
  if (state.size !== 20) parameters.set('requestSize', String(state.size))
  if (state.selectedRequestId) parameters.set('requestId', state.selectedRequestId)
  return parameters
}

export function useInternshipRequestsUrlState() {
  const [state, setState] = useUrlQueryState({
    parse: parseInternshipRequestsUrlState,
    serialize: serializeInternshipRequestsUrlState,
  })
  const [searchInput, setSearchInput] = useState(state.search)
  const debouncedSearch = useDebouncedValue(searchInput, 300)

  useEffect(() => setSearchInput(state.search), [state.search])
  useEffect(() => {
    const search = debouncedSearch.trim().slice(0, 120)
    if (searchInput.trim().slice(0, 120) !== search || search === state.search) return
    setState({ ...state, page: 0, search }, { replace: true })
  }, [debouncedSearch, searchInput, setState, state])

  const updateState = useCallback(
    (patch: Partial<InternshipRequestsUrlState>) => {
      const resetsPage = Object.keys(patch).some(
        (key) => !['page', 'selectedRequestId'].includes(key),
      )
      setState({ ...state, ...patch, page: resetsPage ? 0 : (patch.page ?? state.page) })
    },
    [setState, state],
  )

  return { state, searchInput, setSearchInput, updateState }
}
