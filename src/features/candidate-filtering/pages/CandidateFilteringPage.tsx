import { useEffect } from 'react'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { CandidateResultsWorkspace } from '../components/CandidateResultsWorkspace'
import { CandidateSelectionPanel } from '../components/CandidateSelectionPanel'
import { useCandidateFilteringUrlState } from '../hooks/useCandidateFilteringUrlState'
import { useCandidateSelection } from '../hooks/useCandidateSelection'

const pageTitle =
  'Interactive Candidate Filtering Dashboard | Ruhuna CS CV Management System'

export function CandidateFilteringPage() {
  const {
    candidateSearchInput,
    setCandidateSearchInput,
    state,
    updateState,
  } = useCandidateFilteringUrlState()
  const selection = useCandidateSelection(state.runId)

  useEffect(() => {
    const previousTitle = document.title
    document.title = pageTitle

    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <div className="content-stack candidate-filtering-page">
      <PageHeader
        description="Recruitment decision-support workspace. Select an active internship request, adjust deterministic runtime filters, review matching students, and manually finalize the shortlist."
        title="Interactive Candidate Filtering Dashboard"
      />

      <div className="candidate-filtering-layout split-dashboard-pane">
        <CandidateSelectionPanel state={state} updateState={updateState} />
        <CandidateResultsWorkspace
          candidateSearchInput={candidateSearchInput}
          selection={selection}
          setCandidateSearchInput={setCandidateSearchInput}
          state={state}
          updateState={updateState}
        />
      </div>
    </div>
  )
}
