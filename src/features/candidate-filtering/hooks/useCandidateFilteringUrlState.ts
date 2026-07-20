import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { readNonnegativeInteger, useUrlQueryState } from '../../../shared/hooks/useUrlQueryState'
import {
  candidateSortSchema,
  filterSkillMatchModeSchema,
} from '../schemas/candidateFilteringSchemas'
import type {
  CandidateFilteringUrlState,
  CandidatePageSize,
} from '../types/candidateFilteringTypes'

const allowedSizes = [20, 50, 100] as const
const filteringUrlKeys = [
  'requestId',
  'minGpa',
  'maxGpa',
  'requestSkillIds',
  'additionalSkillIds',
  'matchMode',
  'runId',
  'candidateSearch',
  'candidateSort',
  'candidatePage',
  'candidateSize',
] as const

export const defaultCandidateFilteringUrlState: CandidateFilteringUrlState = {
  requestId: undefined,
  minGpa: undefined,
  maxGpa: undefined,
  requestSkillIds: [],
  additionalSkillIds: [],
  matchMode: 'AND',
  runId: undefined,
  candidateSearch: '',
  candidateSort: 'officialGpa,desc',
  candidatePage: 0,
  candidateSize: 20,
}

function optionalUuid(value: string | null) {
  return value && z.string().uuid().safeParse(value).success ? value : undefined
}

function uuidList(parameters: URLSearchParams, key: string) {
  return [
    ...new Set(
      parameters.getAll(key).filter((value) => z.string().uuid().safeParse(value).success),
    ),
  ]
}

function optionalGpa(value: string | null) {
  if (!value || !/^\d(?:\.\d{1,2})?$/.test(value)) return undefined
  const parsed = Number(value)
  return parsed >= 0 && parsed <= 4 ? parsed : undefined
}

export function parseCandidateFilteringUrlState(
  parameters: URLSearchParams,
): CandidateFilteringUrlState {
  const candidateSize = readNonnegativeInteger(parameters.get('candidateSize'), 20)
  const matchMode = filterSkillMatchModeSchema.safeParse(parameters.get('matchMode'))
  const candidateSort = candidateSortSchema.safeParse(parameters.get('candidateSort'))
  return {
    requestId: optionalUuid(parameters.get('requestId')),
    minGpa: optionalGpa(parameters.get('minGpa')),
    maxGpa: optionalGpa(parameters.get('maxGpa')),
    requestSkillIds: uuidList(parameters, 'requestSkillIds'),
    additionalSkillIds: uuidList(parameters, 'additionalSkillIds'),
    matchMode: matchMode.success ? matchMode.data : 'AND',
    runId: optionalUuid(parameters.get('runId')),
    candidateSearch: (parameters.get('candidateSearch') ?? '').trim().slice(0, 120),
    candidateSort: candidateSort.success ? candidateSort.data : 'officialGpa,desc',
    candidatePage: readNonnegativeInteger(parameters.get('candidatePage'), 0),
    candidateSize: allowedSizes.includes(candidateSize as CandidatePageSize)
      ? (candidateSize as CandidatePageSize)
      : 20,
  }
}

export function serializeCandidateFilteringUrlState(state: CandidateFilteringUrlState) {
  const parameters = new URLSearchParams()
  if (state.requestId) parameters.set('requestId', state.requestId)
  if (state.minGpa !== undefined) parameters.set('minGpa', String(state.minGpa))
  if (state.maxGpa !== undefined) parameters.set('maxGpa', String(state.maxGpa))
  for (const skillId of state.requestSkillIds) parameters.append('requestSkillIds', skillId)
  for (const skillId of state.additionalSkillIds) parameters.append('additionalSkillIds', skillId)
  if (state.matchMode !== 'AND') parameters.set('matchMode', state.matchMode)
  if (state.runId) parameters.set('runId', state.runId)
  if (state.candidateSearch) parameters.set('candidateSearch', state.candidateSearch)
  if (state.candidateSort !== 'officialGpa,desc') {
    parameters.set('candidateSort', state.candidateSort)
  }
  if (state.candidatePage > 0) parameters.set('candidatePage', String(state.candidatePage))
  if (state.candidateSize !== 20) parameters.set('candidateSize', String(state.candidateSize))
  return parameters
}

export function useCandidateFilteringUrlState() {
  const [state, setState] = useUrlQueryState({
    ownedKeys: filteringUrlKeys,
    parse: parseCandidateFilteringUrlState,
    serialize: serializeCandidateFilteringUrlState,
  })
  const [candidateSearchInput, setCandidateSearchInput] = useState(state.candidateSearch)
  const debouncedSearch = useDebouncedValue(candidateSearchInput.trim(), 300)

  useEffect(() => setCandidateSearchInput(state.candidateSearch), [state.candidateSearch])
  useEffect(() => {
    const candidateSearch = debouncedSearch.trim().slice(0, 120)
    if (
      candidateSearchInput.trim().slice(0, 120) !== candidateSearch ||
      candidateSearch === state.candidateSearch
    ) {
      return
    }
    setState({ ...state, candidatePage: 0, candidateSearch }, { replace: true })
  }, [candidateSearchInput, debouncedSearch, setState, state])

  const updateState = useCallback(
    (patch: Partial<CandidateFilteringUrlState>) => {
      const requestChanged = 'requestId' in patch && patch.requestId !== state.requestId
      const resetsCandidatePage = Object.keys(patch).some((key) =>
        ['candidateSearch', 'candidateSort', 'candidateSize'].includes(key),
      )
      setState({
        ...state,
        ...patch,
        ...(requestChanged
          ? { runId: undefined, requestSkillIds: [], candidatePage: 0 }
          : resetsCandidatePage
            ? { candidatePage: 0 }
            : {}),
      })
    },
    [setState, state],
  )

  return { state, candidateSearchInput, setCandidateSearchInput, updateState }
}
