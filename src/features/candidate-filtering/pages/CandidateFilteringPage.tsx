import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { CandidateResultsWorkspace } from '../components/CandidateResultsWorkspace'
import { CandidateSelectionPanel } from '../components/CandidateSelectionPanel'
import { useCandidateFilteringUrlState } from '../hooks/useCandidateFilteringUrlState'
import { useCandidateSelection } from '../hooks/useCandidateSelection'

export function CandidateFilteringPage() {
  const { candidateSearchInput, setCandidateSearchInput, state, updateState } =
    useCandidateFilteringUrlState()
  const selection = useCandidateSelection(state.runId)

  return (
    <main className="content-stack candidate-filtering-page">
      <PageHeader
        description="Apply runtime official GPA and declared-skill criteria, then select candidates manually."
        eyebrow="Administration"
        title="Candidate Filtering"
      />
      <div className="candidate-filtering-layout">
        <SectionCard aria-label="Candidate filtering criteria">
          <CandidateSelectionPanel state={state} updateState={updateState} />
        </SectionCard>
        <CandidateResultsWorkspace
          candidateSearchInput={candidateSearchInput}
          selection={selection}
          setCandidateSearchInput={setCandidateSearchInput}
          state={state}
          updateState={updateState}
        />
      </div>
    </main>
  )
}
