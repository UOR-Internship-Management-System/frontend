import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { CandidateResultsWorkspace } from '../components/CandidateResultsWorkspace'
import { CandidateSelectionPanel } from '../components/CandidateSelectionPanel'
import { useCandidateFilteringUrlState } from '../hooks/useCandidateFilteringUrlState'
import { useCandidateSelection } from '../hooks/useCandidateSelection'

export function CandidateFilteringPage() {
  const { state, updateState } = useCandidateFilteringUrlState()
  const selection = useCandidateSelection(state.runId)

  return (
    <div className="content-stack candidate-filtering-page">
      <PageHeader
        description="Recruitment decision-support workspace. Select an active internship request, adjust deterministic runtime filters, review matching students, and manually lock the final shortlist."
        title="Interactive Candidate Filtering Dashboard"
      />

      <div className="candidate-filtering-layout split-dashboard-pane">
        <CandidateSelectionPanel state={state} updateState={updateState} />
        <CandidateResultsWorkspace
          selection={selection}
          state={state}
          updateState={updateState}
        />
      </div>
    </div>
  )
}
