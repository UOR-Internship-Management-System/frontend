import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { TextField } from '../../../shared/components/forms/TextField'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { M3SelectField } from '../../../shared/components/forms/M3SelectField'
import { Button } from '../../../shared/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card'
import { Chip } from '../../../shared/components/ui/Chip'
import { SegmentedButton } from '../../../shared/components/ui/SegmentedButton'
import { useIsCompactLayout } from '../../../shared/hooks/useResponsiveLayout'
import { clampPage } from '../../../shared/utils/clampPage'
import {
  useCreateDraftShortlist,
  useAddShortlistCandidates,
} from '../../shortlists/hooks/useShortlists'
import {
  useCandidateFilteringCandidates,
  useCandidateFilteringRun,
} from '../hooks/useCandidateFiltering'
import type { CandidateSelectionState } from '../hooks/useCandidateSelection'
import { useClearFilteringSession } from '../hooks/useFilteringSession'
import type {
  CandidateFilteringCandidate,
  CandidateFilteringUrlState,
  CandidatePageSize,
} from '../types/candidateFilteringTypes'
import { SkeletonPagination, SkeletonTableGrid, SkeletonToolbar } from '../../../shared/skeletons'
import { CandidateResultsCardList } from './CandidateResultsCardList'
import { CandidateResultsTable } from './CandidateResultsTable'
import { CandidateSkillsModal } from './CandidateSkillsModal'
import { SelectedCandidatesReviewModal } from './SelectedCandidatesReviewModal'

type CfViewMode = 'table' | 'cards'

const viewOptions = [
  {
    value: 'table' as const,
    label: 'Table',
    icon: (
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
        table_rows
      </span>
    ),
  },
  {
    value: 'cards' as const,
    label: 'Cards',
    icon: (
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
        grid_view
      </span>
    ),
  },
]

export function CandidateResultsWorkspace({
  candidateSearchInput,
  onResumedShortlistSettled,
  resumingShortlist,
  selection,
  setCandidateSearchInput,
  state,
  updateState,
}: {
  candidateSearchInput: string
  /** Called once a resumed draft (see `resumingShortlist`) has been drafted again or finalized. */
  onResumedShortlistSettled?: () => void
  /** Set when this page was opened via Shortlists "Back to finalize shortlist" for an existing draft. */
  resumingShortlist?: { shortlistId: string; version: number }
  selection: CandidateSelectionState
  setCandidateSearchInput: (value: string) => void
  state: CandidateFilteringUrlState
  updateState: (patch: Partial<CandidateFilteringUrlState>) => void
}) {
  const [skillsCandidate, setSkillsCandidate] = useState<CandidateFilteringCandidate>()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [viewMode, setViewMode] = useState<CfViewMode>('table')
  const [draftError, setDraftError] = useState<{ message: string; isConflict: boolean }>()
  const isCompact = useIsCompactLayout()
  const navigate = useNavigate()
  const { notify } = useNotifications()
  const createDraft = useCreateDraftShortlist()
  const addCandidates = useAddShortlistCandidates()
  const clearSession = useClearFilteringSession()
  const draftPending = createDraft.isPending || addCandidates.isPending
  const effectiveViewMode: CfViewMode = isCompact ? 'cards' : viewMode
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
  const resultCount = candidates.data?.page.totalElements ?? run.data?.candidateCount ?? 0

  const draftShortlist = async () => {
    const requestId = state.requestId ?? run.data?.request.requestId
    if (!requestId || !state.runId || selection.candidates.size === 0) return
    setDraftError(undefined)
    try {
      const shortlist = resumingShortlist
        ? resumingShortlist
        : await createDraft.mutateAsync({ requestId, filterRunId: state.runId })
      await addCandidates.mutateAsync({
        shortlistId: shortlist.shortlistId,
        version: shortlist.version,
        body: { studentIds: [...selection.candidates.keys()] },
      })
      selection.clear()
      await clearSession.mutateAsync().catch(() => undefined)
      onResumedShortlistSettled?.()
      notify({
        tone: 'success',
        title: 'Shortlist drafted',
        message: 'Find it under Shortlists → Drafted whenever you want to finish it.',
      })
    } catch (reason) {
      const mapped = mapApiError(reason, 'protected')
      setDraftError({
        message:
          mapped.status === 409
            ? 'A shortlist already exists for this internship request. Open Shortlists to review it.'
            : mapped.message,
        isConflict: mapped.status === 409,
      })
    }
  }

  return (
    <Card aria-labelledby="candidate-results-title" className="cf-results-card" variant="outlined">
      <CardHeader className="cf-results-heading">
        <div>
          <CardTitle id="candidate-results-title">Matching Students</CardTitle>
          <p className="cf-results-context">
            {run.data
              ? `${run.data.request.companyName} · ${run.data.request.title}`
              : state.runId
                ? 'Loading filtering run context…'
                : 'Select an internship request to populate this workspace.'}
          </p>
        </div>
        <Chip>
          {resultCount} matching student{resultCount === 1 ? '' : 's'}
        </Chip>
      </CardHeader>
      <CardContent className="cf-results-content">
        <div aria-label="Candidate result controls" className="cf-results-toolbar">
          <TextField
            className="cf-toolbar-field"
            type="search"
            label="Search candidates"
            aria-label="Search candidates by name or index number"
            disabled={!state.runId}
            maxLength={120}
            onChange={(event) => setCandidateSearchInput(event.target.value)}
            placeholder="Search by name or index number"
            value={candidateSearchInput}
            leadingIcon={
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                search
              </span>
            }
          />
          <M3SelectField
            className="cf-toolbar-field"
            label="Sort results"
            aria-label="Sort candidate results"
            disabled={!state.runId}
            onChange={(value) =>
              updateState({
                candidateSort: value as CandidateFilteringUrlState['candidateSort'],
              })
            }
            value={state.candidateSort}
            options={[
              { value: 'officialGpa,desc', label: 'Official GPA: high to low' },
              { value: 'officialGpa,asc', label: 'Official GPA: low to high' },
              { value: 'fullName,asc', label: 'Name: A to Z' },
              { value: 'indexNumber,asc', label: 'Index number: ascending' },
            ]}
          />
          {isCompact ? null : (
            <div className="cf-view-toggle">
              <SegmentedButton
                ariaLabel="View mode"
                onChange={setViewMode}
                options={viewOptions}
                value={viewMode}
              />
            </div>
          )}
        </div>

        <p aria-live="polite" className="cf-updating-status">
          {candidates.isFetching && !candidates.isPending ? 'Updating candidate results…' : ''}
        </p>

        {!state.runId ? (
          <div className="cf-results-empty-canvas">
            <EmptyState
              message="Select an internship request to load the latest committed student data. Adjusting runtime criteria refreshes the deterministic results automatically."
              title="No internship request selected"
            />
          </div>
        ) : (
          <LoadingBoundary
            isLoading={run.isPending || candidates.isPending}
            label="Loading candidate results"
            minHeight={440}
            skeleton={
              <>
                <SkeletonToolbar fields={2} />
                <SkeletonTableGrid
                  columns={5}
                  gridTemplateColumns="repeat(5, minmax(100px, 1fr))"
                  rows={5}
                />
                <SkeletonPagination />
              </>
            }
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
                <div className="cf-data-container">
                  {effectiveViewMode === 'table' ? (
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
                  ) : (
                    <CandidateResultsCardList
                      candidates={candidates.data.items}
                      onShowSkills={setSkillsCandidate}
                      onToggle={selection.toggle}
                      selectedIds={new Set(selection.candidates.keys())}
                    />
                  )}
                </div>
                <PaginationBar
                  label="Candidate result pages"
                  onPageChange={(candidatePage) => updateState({ candidatePage })}
                  onPageSizeChange={(candidateSize) =>
                    updateState({ candidateSize: candidateSize as CandidatePageSize })
                  }
                  page={candidates.data.page.page}
                  pageSizeOptions={[5, 20, 50, 100]}
                  size={candidates.data.page.size}
                  totalElements={candidates.data.page.totalElements}
                  totalPages={candidates.data.page.totalPages}
                />
              </>
            ) : (
              <EmptyState
                message={
                  state.candidateSearch
                    ? 'No candidates match the current search and runtime filtering criteria.'
                    : 'No candidates satisfy the current runtime GPA and declared-skill criteria.'
                }
                title="No candidates found"
              />
            )}
          </LoadingBoundary>
        )}

        {draftError ? (
          <div className="inline-alert" role="alert">
            <span>{draftError.message}</span>
            {draftError.isConflict ? (
              <Button onClick={() => navigate(routePaths.adminShortlists)} size="sm" variant="text">
                Open Shortlists
              </Button>
            ) : null}
          </div>
        ) : null}

        <footer aria-label="Manual shortlist selection actions" className="cf-selection-action-bar">
          <div>
            <strong>{selectedCount} selected</strong>
            <span>Selections persist across result pages for this filtering run.</span>
          </div>
          <div>
            <Button
              disabled={selectedCount === 0 || !state.runId || draftPending}
              isLoading={draftPending}
              onClick={() => void draftShortlist()}
              variant="outlined"
            >
              Draft Shortlist
            </Button>
            <Button
              disabled={selectedCount === 0 || !state.runId}
              onClick={() => setReviewOpen(true)}
            >
              Finalize Shortlist
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
            existingShortlist={resumingShortlist}
            guidanceValue={run.data?.request.shortlistGuidanceValue ?? null}
            onClose={() => setReviewOpen(false)}
            onSettled={onResumedShortlistSettled}
            requestId={state.requestId ?? run.data?.request.requestId ?? ''}
            runId={state.runId}
            selection={selection}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}
