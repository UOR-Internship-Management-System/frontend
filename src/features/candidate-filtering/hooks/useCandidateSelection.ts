import { useEffect, useMemo, useReducer } from 'react'
import type { CandidateFilteringCandidate } from '../types/candidateFilteringTypes'

type SelectionState = {
  runId?: string
  candidates: Map<string, CandidateFilteringCandidate>
}

type SelectionAction =
  | { type: 'activate'; runId?: string }
  | { type: 'toggle'; candidate: CandidateFilteringCandidate }
  | { type: 'selectMany'; candidates: CandidateFilteringCandidate[] }
  | { type: 'removeMany'; studentIds: string[] }
  | { type: 'remove'; studentId: string }
  | { type: 'clear' }

function reducer(state: SelectionState, action: SelectionAction): SelectionState {
  if (action.type === 'activate') {
    return action.runId === state.runId ? state : { runId: action.runId, candidates: new Map() }
  }
  if (action.type === 'clear') return { ...state, candidates: new Map() }

  const candidates = new Map(state.candidates)
  if (action.type === 'remove') candidates.delete(action.studentId)
  else if (action.type === 'removeMany') {
    for (const studentId of action.studentIds) candidates.delete(studentId)
  } else if (action.type === 'selectMany') {
    for (const candidate of action.candidates) candidates.set(candidate.studentId, candidate)
  } else if (candidates.has(action.candidate.studentId)) {
    candidates.delete(action.candidate.studentId)
  } else {
    candidates.set(action.candidate.studentId, action.candidate)
  }

  return { ...state, candidates }
}

export function useCandidateSelection(runId?: string) {
  const [state, dispatch] = useReducer(reducer, { runId, candidates: new Map() })
  useEffect(() => dispatch({ type: 'activate', runId }), [runId])

  return useMemo(
    () => ({
      candidates: state.candidates,
      clear: () => dispatch({ type: 'clear' }),
      remove: (studentId: string) => dispatch({ type: 'remove', studentId }),
      removeMany: (studentIds: string[]) => dispatch({ type: 'removeMany', studentIds }),
      selectMany: (candidates: CandidateFilteringCandidate[]) =>
        dispatch({ type: 'selectMany', candidates }),
      toggle: (candidate: CandidateFilteringCandidate) => dispatch({ type: 'toggle', candidate }),
    }),
    [state.candidates],
  )
}

export type CandidateSelectionState = ReturnType<typeof useCandidateSelection>