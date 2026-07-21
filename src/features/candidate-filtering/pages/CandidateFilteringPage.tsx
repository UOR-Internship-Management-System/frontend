import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { CandidateResultsWorkspace } from '../components/CandidateResultsWorkspace'
import { CandidateSelectionPanel } from '../components/CandidateSelectionPanel'
import { useCandidateFilteringUrlState } from '../hooks/useCandidateFilteringUrlState'
import { useCandidateSelection } from '../hooks/useCandidateSelection'

export function CandidateFilteringPage() {
  const { candidateSearchInput, setCandidateSearchInput, state, updateState } =
    useCandidateFilteringUrlState()
  const selection = useCandidateSelection(state.runId)

  return (
    <div className="content-stack candidate-filtering-page">
      <PageHeader
        description="Select an active placement request, apply runtime official GPA and declared-skill criteria, and manually review candidates."
        eyebrow="Administration"
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