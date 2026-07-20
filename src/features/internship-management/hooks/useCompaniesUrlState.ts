import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { readNonnegativeInteger, useUrlQueryState } from '../../../shared/hooks/useUrlQueryState'
import { companySortSchema } from '../schemas/internshipSchemas'
import type { CompaniesUrlState, CompanyPageSize } from '../types/internshipManagementTypes'

const allowedSizes = [20, 50, 100] as const
const companyUrlKeys = [
  'companySearch',
  'companyActive',
  'companySort',
  'companyPage',
  'companySize',
  'companyId',
] as const

export const defaultCompaniesUrlState: CompaniesUrlState = {
  page: 0,
  size: 20,
  sort: 'name,asc',
  search: '',
  active: undefined,
  selectedCompanyId: undefined,
}

export function parseCompaniesUrlState(parameters: URLSearchParams): CompaniesUrlState {
  const size = readNonnegativeInteger(parameters.get('companySize'), 20)
  const active = parameters.get('companyActive')
  const selectedCompanyId = parameters.get('companyId')
  const sort = companySortSchema.safeParse(parameters.get('companySort'))

  return {
    page: readNonnegativeInteger(parameters.get('companyPage'), 0),
    size: allowedSizes.includes(size as CompanyPageSize) ? (size as CompanyPageSize) : 20,
    sort: sort.success ? sort.data : 'name,asc',
    search: (parameters.get('companySearch') ?? '').trim().slice(0, 120),
    active: active === 'true' ? true : active === 'false' ? false : undefined,
    selectedCompanyId:
      selectedCompanyId && z.string().uuid().safeParse(selectedCompanyId).success
        ? selectedCompanyId
        : undefined,
  }
}

export function serializeCompaniesUrlState(state: CompaniesUrlState) {
  const parameters = new URLSearchParams()
  if (state.search) parameters.set('companySearch', state.search)
  if (state.active !== undefined) parameters.set('companyActive', String(state.active))
  if (state.sort !== 'name,asc') parameters.set('companySort', state.sort)
  if (state.page > 0) parameters.set('companyPage', String(state.page))
  if (state.size !== 20) parameters.set('companySize', String(state.size))
  if (state.selectedCompanyId) parameters.set('companyId', state.selectedCompanyId)
  return parameters
}

export function useCompaniesUrlState() {
  const [state, setState] = useUrlQueryState({
    ownedKeys: companyUrlKeys,
    parse: parseCompaniesUrlState,
    serialize: serializeCompaniesUrlState,
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
    (patch: Partial<CompaniesUrlState>) => {
      const resetsPage = Object.keys(patch).some(
        (key) => !['page', 'selectedCompanyId'].includes(key),
      )
      setState({ ...state, ...patch, page: resetsPage ? 0 : (patch.page ?? state.page) })
    },
    [setState, state],
  )

  return { state, searchInput, setSearchInput, updateState }
}
