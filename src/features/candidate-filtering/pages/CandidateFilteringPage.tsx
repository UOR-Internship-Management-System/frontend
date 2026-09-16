import { useEffect, useRef } from 'react'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { useShortlistDetail } from '../../shortlists/hooks/useShortlists'
import { CandidateResultsWorkspace } from '../components/CandidateResultsWorkspace'
import { CandidateSelectionPanel } from '../components/CandidateSelectionPanel'
import { useCandidateFilteringUrlState } from '../hooks/useCandidateFilteringUrlState'
import { useCandidateSelection } from '../hooks/useCandidateSelection'
import { useSaveFilteringSession } from '../hooks/useFilteringSession'
import type { CandidateFilteringCandidate } from '../types/candidateFilteringTypes'

const pageTitle = 'Interactive Candidate Filtering Dashboard | Ruhuna CS CV Management System'

export function CandidateFilteringPage() {
  const { candidateSearchInput, setCandidateSearchInput, state, updateState } =
    useCandidateFilteringUrlState()
  const selection = useCandidateSelection(state.runId)
  const saveSession = useSaveFilteringSession()
  const saveSessionTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const previousTitle = document.title
    document.title = pageTitle

    return () => {
      document.title = previousTitle
    }
  }, [])

  // Restores a drafted shortlist's manual candidate selection once the request hand-off from
  // "Back to finalize shortlist" (Shortlists page) has produced a fresh filtering run here.
  const restoreShortlistId = state.restoreShortlistId
  const restoreDetail = useShortlistDetail(
    restoreShortlistId
      ? {
          shortlistId: restoreShortlistId,
          candidatePage: 0,
          candidateSize: 100,
          candidateSearch: '',
          candidateSort: 'officialGpa,desc',
        }
      : null,
  )
  const restoredForRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (!restoreShortlistId || !state.runId || !restoreDetail.data) return
    if (restoredForRef.current === restoreShortlistId) return
    restoredForRef.current = restoreShortlistId

    const candidates: CandidateFilteringCandidate[] = restoreDetail.data.candidates.items.map(
      (candidate) => ({
        studentId: candidate.studentId,
        indexNumber: candidate.indexNumber,
        fullName: candidate.fullName,
        officialGpa: candidate.officialGpa,
        gpaAvailabilityStatus: candidate.gpaAvailabilityStatus,
        matchingDeclaredSkills: [],
        declaredSkillCount: 0,
        hasLatestSavedCv: candidate.hasLatestSavedCv,
        hasExistingActiveShortlist: candidate.hasExistingActiveShortlist,
        existingActiveShortlistCount: candidate.existingActiveShortlistCount,
      }),
    )
    selection.selectMany(candidates)
    // `restoreShortlistId` deliberately stays in the URL after this: it also identifies the
    // draft being resumed so Draft/Finalize can act on that exact shortlist instead of
    // colliding with the one-shortlist-per-request rule by trying to create a new one.
  }, [restoreDetail.data, restoreShortlistId, selection, state.runId])

  const resumingShortlist =
    restoreShortlistId && restoreDetail.data
      ? { shortlistId: restoreShortlistId, version: restoreDetail.data.shortlist.version }
      : undefined
  const clearResumedShortlist = () => updateState({ restoreShortlistId: undefined })

  // Persists the in-progress filtering session (criteria run + manual selection) so it survives
  // navigation away from this page, debounced to avoid saving on every keystroke/toggle.
  useEffect(
    () => () => {
      if (saveSessionTimeoutRef.current !== undefined) {
        window.clearTimeout(saveSessionTimeoutRef.current)
      }
    },
    [],
  )
  useEffect(() => {
    if (saveSessionTimeoutRef.current !== undefined) {
      window.clearTimeout(saveSessionTimeoutRef.current)
      saveSessionTimeoutRef.current = undefined
    }
    // Nothing meaningful to persist yet, and this also covers the moment right after a
    // successful Draft/Finalize clears the selection — without this guard, that clear would
    // otherwise re-trigger a save that resurrects the session just deleted on success.
    if (!state.runId || restoreShortlistId || selection.candidates.size === 0) return
    const runId = state.runId
    const studentIds = [...selection.candidates.keys()]
    saveSessionTimeoutRef.current = window.setTimeout(() => {
      saveSessionTimeoutRef.current = undefined
      void saveSession.mutateAsync({ filterRunId: runId, selectedStudentIds: studentIds })
    }, 800)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.runId, selection.candidates, restoreShortlistId])

  return (
    <div className="cf-page">
      <PageHeader
        description="Select an internship request, review matching students against deterministic runtime filters, and manually finalize the shortlist."
        title="Interactive Candidate Filtering Dashboard"
      />

      <div className="cf-layout">
        <CandidateSelectionPanel state={state} updateState={updateState} />
        <CandidateResultsWorkspace
          candidateSearchInput={candidateSearchInput}
          onResumedShortlistSettled={clearResumedShortlist}
          resumingShortlist={resumingShortlist}
          selection={selection}
          setCandidateSearchInput={setCandidateSearchInput}
          state={state}
          updateState={updateState}
        />
      </div>
    </div>
  )
}
