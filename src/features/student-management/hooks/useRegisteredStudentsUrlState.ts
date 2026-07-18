import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { readNonnegativeInteger, useUrlQueryState } from '../../../shared/hooks/useUrlQueryState'
import type { RegisteredStudentsQuery } from '../types/studentManagementTypes'

export const registeredStudentSorts = [
  'fullName,asc',
  'officialGpa,desc',
  'officialGpa,asc',
  'indexNumber,asc',
] as const

const allowedSizes = [20, 50, 100] as const
export const defaultRegisteredStudentsQuery: RegisteredStudentsQuery = {
  page: 0,
  size: 20,
  sort: 'fullName,asc',
  search: '',
}

export function parseRegisteredStudentsQuery(parameters: URLSearchParams): RegisteredStudentsQuery {
  const rawSort = parameters.get('sort')
  const rawLevel = parameters.get('level')
  const rawSize = readNonnegativeInteger(parameters.get('size'), 20)
  const search = (parameters.get('search') ?? '').trim().slice(0, 120)

  return {
    page: readNonnegativeInteger(parameters.get('page'), 0),
    size: allowedSizes.includes(rawSize as 20 | 50 | 100) ? (rawSize as 20 | 50 | 100) : 20,
    sort: registeredStudentSorts.includes(rawSort as RegisteredStudentsQuery['sort'])
      ? (rawSort as RegisteredStudentsQuery['sort'])
      : 'fullName,asc',
    search,
    level: rawLevel === '3' ? 3 : rawLevel === '4' ? 4 : undefined,
  }
}

export function serializeRegisteredStudentsQuery(query: RegisteredStudentsQuery) {
  const parameters = new URLSearchParams()
  if (query.search) parameters.set('search', query.search)
  if (query.level) parameters.set('level', String(query.level))
  if (query.sort !== 'fullName,asc') parameters.set('sort', query.sort)
  if (query.page > 0) parameters.set('page', String(query.page))
  if (query.size !== 20) parameters.set('size', String(query.size))
  return parameters
}

export function useRegisteredStudentsUrlState() {
  const [query, setQuery] = useUrlQueryState({
    parse: parseRegisteredStudentsQuery,
    serialize: serializeRegisteredStudentsQuery,
  })
  const [searchInput, setSearchInput] = useState(query.search)
  const debouncedSearch = useDebouncedValue(searchInput, 300)

  useEffect(() => setSearchInput(query.search), [query.search])
  useEffect(() => {
    const nextSearch = debouncedSearch.trim().slice(0, 120)
    if (searchInput.trim().slice(0, 120) !== nextSearch) return
    if (nextSearch !== query.search) {
      setQuery({ ...query, page: 0, search: nextSearch }, { replace: true })
    }
  }, [debouncedSearch, query, searchInput, setQuery])

  const updateQuery = useCallback(
    (patch: Partial<RegisteredStudentsQuery>) => {
      const resetsPage = Object.keys(patch).some((key) => key !== 'page')
      setQuery({ ...query, ...patch, page: resetsPage ? 0 : (patch.page ?? query.page) })
    },
    [query, setQuery],
  )

  return { query, searchInput, setSearchInput, updateQuery }
}
