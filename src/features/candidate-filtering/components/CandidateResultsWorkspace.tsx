import { useEffect, useMemo, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { Button } from '../../../shared/components/ui/Button'
import { Chip } from '../../../shared/components/ui/Chip'
import { clampPage } from '../../../shared/utils/clampPage'
import {
  useCandidateFilteringCandidates,
  useCandidateFilteringRun,
} from '../hooks/useCandidateFiltering'
import type { CandidateSelectionState } from '../hooks/useCandidateSelection'
import type {
  CandidateFilteringCandidate,
  CandidateFilteringUrlState,
} from '../types/candidateFilteringTypes'
import { CandidateResultsTable } from './CandidateResultsTable'
import { CandidateSkillsModal } from './CandidateSkillsModal'
import { SelectedCandidatesReviewModal } from './SelectedCandidatesReviewModal'

export function CandidateResultsWorkspace({
  selection,
  state,
  updateState,
}: {
  candidateSearchInput?: string
  selection: CandidateSelectionState
  setCandidateSearchInput?: (value: string) => void
  state: CandidateFilteringUrlState
  updateState: (patch: Partial<CandidateFilteringUrlState>) => void
}) {
  const [skillsCandidate, setSkillsCandidate] = useState<CandidateFilteringCandidate>()
  const [reviewOpen, setReviewOpen] = useState(false)
  const run = useCandidateFilteringRun(state.runId ?? null)
  const query = useMemo(
    () =>
      state.runId
        ? {
            filterRunId: state.runId,
            page: state.candidatePage,
            size: state.candidateSize,
            search: state.candidateSearch,
            sort: state.candidateSort,
          }
        : null,
    [
      state.candidatePage,
      state.candidateSearch,
      state.candidateSize,
      state.candidateSort,
      state.runId,
    ],
  )
  const candidates = useCandidateFilteringCandidates(query)

  useEffect(() => {
    if (!candidates.data) return
    const page = clampPage(
      state.candidatePage,
      candidates.data.page.totalElements,
      state.candidateSize,
    )
    if (page !== state.candidatePage) updateState({ candidatePage: page })
  }, [candidates.data, state.candidatePage, state.candidateSize, updateState])

  const error = run.error ?? candidates.error
  const mappedError = error ? mapApiError(error, 'protected') : null
  const pageItems = candidates.data?.items ?? []
  const selectedCount = selection.candidates.size

  return (
    <SectionCard aria-labelledby="candidate-results-title" className="candidate-results-workspace">
      <div className="candidate-results-heading">
        <div>
          <h2 id="candidate-results-title">Matching Students</h2>
          <p>
            {run.data
              ? `${run.data.request.companyName} · ${run.data.request.title}`
              : state.runId
                ? 'Loading filtering run context…'
                : 'Select an internship request to populate this workspace.'}
          </p>
        </div>
        <Chip>
          {candidates.data?.page.totalElements ?? run.data?.candidateCount ?? 0} Student Records Match
        </Chip>
      </div>

      <p aria-live="polite" className="company-updating">
        {candidates.isFetching && !candidates.isPending ? 'Updating candidate results…' : ''}
      </p>

      {!state.runId ? (
        <div className="candidate-results-empty-canvas">
          <EmptyState
            message="Select an active internship request to load the latest committed student data. Adjusting runtime criteria refreshes the deterministic results automatically."
            title="No internship request selected"
          />
        </div>
      ) : (
        <LoadingBoundary
          isLoading={run.isPending || candidates.isPending}
          label="Loading candidate results"
          minHeight={440}
          skeleton={<SkeletonBlock height={340} lines={0} variant="card" />}
        >
          {mappedError ? (
            <ErrorState
              correlationId={mappedError.correlationId}
              message={mappedError.message}
              onAction={() => void Promise.all([run.refetch(), candidates.refetch()])}
              title="Candidate results unavailable"
            />
          ) : candidates.data?.items.length ? (
            <>
              <CandidateResultsTable
                candidates={candidates.data.items}
                onShowSkills={setSkillsCandidate}
                onToggle={selection.toggle}
                onTogglePage={(select) => {
                  if (select) selection.selectMany(pageItems)
                  else selection.removeMany(pageItems.map((candidate) => candidate.studentId))
                }}
                selectedIds={new Set(selection.candidates.keys())}
              />
              <PaginationBar
                label="Candidate result pages"
                onPageChange={(candidatePage) => updateState({ candidatePage })}
                onPageSizeChange={() => undefined}
                page={candidates.data.page.page}
                pageSizeOptions={[5]}
                size={candidates.data.page.size}
                totalElements={candidates.data.page.totalElements}
                totalPages={candidates.data.page.totalPages}
              />
            </>
          ) : (
            <EmptyState
              message="No candidates satisfy the current runtime GPA and declared-skill criteria."
              title="No candidates found"
            />
          )}
        </LoadingBoundary>
      )}

      <footer className="global-actions-toolbar" role="status">
        <div>
          <strong>{selectedCount} selected</strong>
          <span>Selections persist across result pages for this filtering run.</span>
        </div>
        <div>
          <Button
            onClick={() => setReviewOpen(true)}
            variant="secondary"
          >
            Review Selected Shortlist
          </Button>
          <Button
            disabled={selectedCount === 0 || !state.runId}
            onClick={() => setReviewOpen(true)}
          >
            Confirm &amp; Lock Final Shortlist
          </Button>
        </div>
      </footer>

      {skillsCandidate ? (
        <CandidateSkillsModal
          candidate={skillsCandidate}
          onClose={() => setSkillsCandidate(undefined)}
        />
      ) : null}
      {reviewOpen && state.runId ? (
        <SelectedCandidatesReviewModal
          onClose={() => setReviewOpen(false)}
          guidanceValue={run.data?.request.shortlistGuidanceValue ?? null}
          requestId={state.requestId ?? run.data?.request.requestId ?? ''}
          runId={state.runId}
          selection={selection}
        />
      ) : null}
    </SectionCard>
  )
}
