import { useEffect, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { SortSelect } from '../../../shared/components/data/SortSelect'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'
import { Chip } from '../../../shared/components/ui/Chip'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import { clampPage } from '../../../shared/utils/clampPage'
import {
  getShortlistMutationErrorMessage,
  useRemoveShortlistCandidate,
  type useShortlistDetail,
} from '../hooks/useShortlists'
import type { ShortlistCandidate, ShortlistsUrlState } from '../types/shortlistTypes'
import { FinalizeShortlistDialog } from './FinalizeShortlistDialog'
import { ShortlistGuidanceWarning } from './ShortlistGuidanceWarning'
import { ShortlistReviewTable } from './ShortlistReviewTable'
import { ShortlistExportPanel } from './ShortlistExportPanel'

type ShortlistDetailQuery = ReturnType<typeof useShortlistDetail>

const dateFormatter = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const candidateSortOptions = [
  { value: 'officialGpa,desc', label: 'Official GPA · High to low' },
  { value: 'officialGpa,asc', label: 'Official GPA · Low to high' },
  { value: 'fullName,asc', label: 'Student name · A–Z' },
  { value: 'indexNumber,asc', label: 'Index number · A–Z' },
] as const

export function ShortlistDetailWorkspace({
  candidateSearchInput,
  detail,
  onCandidateSearchInputChange,
  onMissingShortlist,
  onStateChange,
  selectedShortlistId,
  state,
}: {
  candidateSearchInput: string
  detail: ShortlistDetailQuery
  onCandidateSearchInputChange: (value: string) => void
  onMissingShortlist: () => void
  onStateChange: (patch: Partial<ShortlistsUrlState>) => void
  selectedShortlistId?: string
  state: ShortlistsUrlState
}) {
  const { notify } = useNotifications()
  const removeCandidate = useRemoveShortlistCandidate()
  const [candidateToRemove, setCandidateToRemove] = useState<ShortlistCandidate>()
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [mutationError, setMutationError] = useState<string>()

  const resolvedDetail =
    detail.data?.shortlist.shortlistId === selectedShortlistId ? detail.data : undefined

  useEffect(() => {
    const page = resolvedDetail?.candidates.page
    if (!page) return
    const nextPage = clampPage(state.candidatePage, page.totalElements, state.candidateSize)
    if (nextPage !== state.candidatePage) {
      onStateChange({ candidatePage: nextPage })
    }
  }, [onStateChange, resolvedDetail?.candidates.page, state.candidatePage, state.candidateSize])

  useEffect(() => {
    if (!detail.isError) return
    const mapped = mapApiError(detail.error, 'protected')
    if (mapped.status === 404) onMissingShortlist()
  }, [detail.error, detail.isError, onMissingShortlist])

  if (!selectedShortlistId) {
    return (
      <SectionCard aria-labelledby="shortlist-detail-title" className="shortlist-detail-workspace">
        <EmptyState
          message="Select a shortlist from the directory to review its request context and candidates."
          title="No shortlist selected"
        />
      </SectionCard>
    )
  }

  const mappedError = detail.isError ? mapApiError(detail.error, 'protected') : null
  const shortlist = resolvedDetail?.shortlist
  const candidates = resolvedDetail?.candidates
  const isDraft = shortlist?.status === 'DRAFT'

  const confirmRemoval = async () => {
    if (!shortlist || !candidateToRemove || shortlist.status !== 'DRAFT') return

    setMutationError(undefined)
    try {
      const result = await removeCandidate.mutateAsync({
        shortlistId: shortlist.shortlistId,
        studentId: candidateToRemove.studentId,
        version: shortlist.version,
      })
      notify({
        tone: 'success',
        title: 'Candidate removed',
        message: `${candidateToRemove.fullName} was removed. ${result.selectedCandidateCount} candidates remain.`,
      })
      setCandidateToRemove(undefined)
    } catch (reason) {
      setMutationError(getShortlistMutationErrorMessage(reason))
      const status = mapApiError(reason, 'protected').status
      if (status === 404) onMissingShortlist()
      if (status === 409 || status === 412 || status === 428) {
        await detail.refetch()
      }
    }
  }

  return (
    <SectionCard aria-labelledby="shortlist-detail-title" className="shortlist-detail-workspace">
      <LoadingBoundary
        isLoading={detail.isPending || (detail.isFetching && !resolvedDetail)}
        label="Loading shortlist details"
        minHeight={620}
        skeleton={<SkeletonBlock height={520} lines={0} variant="card" />}
      >
        {mappedError ? (
          <ErrorState
            correlationId={mappedError.correlationId}
            message={mappedError.message}
            onAction={() => void detail.refetch()}
            title="Shortlist details unavailable"
          />
        ) : shortlist && candidates ? (
          <>
            <div className="shortlist-detail-heading">
              <div>
                <p className="shortlist-detail-eyebrow">{shortlist.request.companyName}</p>
                <h2 id="shortlist-detail-title">{shortlist.name || shortlist.request.title}</h2>
                <p>{shortlist.request.title}</p>
              </div>
              <StatusBadge tone={shortlist.status === 'FINALIZED' ? 'success' : 'neutral'}>
                {shortlist.status === 'FINALIZED' ? 'Finalized' : 'Draft'}
              </StatusBadge>
            </div>

            <dl className="shortlist-summary-grid">
              <div>
                <dt>Selected candidates</dt>
                <dd>{shortlist.selectedCandidateCount}</dd>
              </div>
              <div>
                <dt>Guidance value</dt>
                <dd>{shortlist.guidanceValue ?? 'Not provided'}</dd>
              </div>
              <div>
                <dt>Request status</dt>
                <dd>{shortlist.request.status}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{dateFormatter.format(new Date(shortlist.updatedAt))}</dd>
              </div>
            </dl>

            <ShortlistGuidanceWarning shortlist={shortlist} />

            {shortlist.status === 'DRAFT' ? (
              <div className="shortlist-finalization-actions">
                <div>
                  <h3>Finalize manual selection</h3>
                  <p>
                    Finalization makes candidate membership read-only. Guidance remains advisory.
                  </p>
                  {shortlist.selectedCandidateCount === 0 ? (
                    <p id="shortlist-finalization-disabled-reason">
                      Add at least one candidate before finalizing.
                    </p>
                  ) : null}
                </div>
                <Button
                  aria-describedby={
                    shortlist.selectedCandidateCount === 0
                      ? 'shortlist-finalization-disabled-reason'
                      : undefined
                  }
                  disabled={shortlist.selectedCandidateCount === 0}
                  onClick={() => setFinalizeOpen(true)}
                >
                  Finalize shortlist
                </Button>
              </div>
            ) : null}

            {shortlist.status === 'FINALIZED' ? (
              <div className="shortlist-readonly-notice" role="status">
                This shortlist was finalized
                {shortlist.finalizedAt
                  ? ` on ${dateFormatter.format(new Date(shortlist.finalizedAt))}`
                  : ''}
                . Candidate membership is read-only.
              </div>
            ) : null}

            <div className="shortlist-candidate-heading">
              <div>
                <h3>Selected candidates</h3>
                <p>
                  Candidate membership is controlled manually. Ordering follows the selected table
                  sort.
                </p>
              </div>
              <Chip>{candidates.page.totalElements} candidates</Chip>
            </div>

            <div className="shortlist-candidate-toolbar">
              <label>
                <span>Search candidates</span>
                <SearchInput
                  aria-label="Search shortlist candidates"
                  maxLength={120}
                  onChange={(event) => onCandidateSearchInputChange(event.target.value)}
                  placeholder="Student name or index number"
                  value={candidateSearchInput}
                />
              </label>
              <label>
                <span>Sort candidates</span>
                <SortSelect
                  aria-label="Sort shortlist candidates"
                  onChange={(event) =>
                    onStateChange({
                      candidateSort: event.target.value as ShortlistsUrlState['candidateSort'],
                    })
                  }
                  value={state.candidateSort}
                >
                  {candidateSortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SortSelect>
              </label>
            </div>

            <p aria-live="polite" className="shortlist-updating">
              {detail.isFetching && !detail.isPending ? 'Updating shortlist candidates…' : ''}
            </p>

            {candidates.items.length ? (
              <>
                <ShortlistReviewTable
                  candidates={candidates.items}
                  isDraft={Boolean(isDraft)}
                  onRemove={(candidate) => {
                    setMutationError(undefined)
                    setCandidateToRemove(candidate)
                  }}
                  removingStudentId={
                    removeCandidate.isPending ? candidateToRemove?.studentId : undefined
                  }
                />
                <PaginationBar
                  label="Shortlist candidate pages"
                  onPageChange={(candidatePage) => onStateChange({ candidatePage })}
                  onPageSizeChange={(candidateSize) =>
                    onStateChange({
                      candidateSize: candidateSize as ShortlistsUrlState['candidateSize'],
                    })
                  }
                  page={candidates.page.page}
                  pageSizeOptions={[20, 50, 100]}
                  size={candidates.page.size}
                  totalElements={candidates.page.totalElements}
                  totalPages={candidates.page.totalPages}
                />
              </>
            ) : (
              <EmptyState
                action={
                  state.candidateSearch ? (
                    <Button
                      onClick={() => {
                        onCandidateSearchInputChange('')
                        onStateChange({
                          candidateSearch: '',
                          candidatePage: 0,
                        })
                      }}
                      variant="secondary"
                    >
                      Clear candidate search
                    </Button>
                  ) : undefined
                }
                message={
                  state.candidateSearch
                    ? 'No selected candidates match the current search.'
                    : isDraft
                      ? 'This draft shortlist does not contain any candidates yet.'
                      : 'This finalized shortlist contains no candidates.'
                }
                title={
                  state.candidateSearch
                    ? 'No matching candidates'
                    : 'No candidates in this shortlist'
                }
              />
            )}

            <ShortlistExportPanel
              onStateChange={onStateChange}
              shortlist={shortlist}
              state={state}
            />

            {finalizeOpen && shortlist.status === 'DRAFT' ? (
              <FinalizeShortlistDialog
                onClose={() => setFinalizeOpen(false)}
                onMissingShortlist={() => {
                  setFinalizeOpen(false)
                  onMissingShortlist()
                }}
                onRecover={() => detail.refetch()}
                shortlist={shortlist}
              />
            ) : null}

            {candidateToRemove && shortlist.status === 'DRAFT' ? (
              <ConfirmDialog
                closeDisabled={removeCandidate.isPending}
                onClose={() => {
                  if (!removeCandidate.isPending) {
                    setCandidateToRemove(undefined)
                    setMutationError(undefined)
                  }
                }}
                title="Remove candidate from draft"
              >
                <div className="shortlist-remove-dialog">
                  <p>
                    Remove <strong>{candidateToRemove.fullName}</strong> (
                    {candidateToRemove.indexNumber}) from this draft shortlist?
                  </p>
                  <p>This changes only shortlist membership. Student-owned data is not modified.</p>
                  {mutationError ? (
                    <p className="inline-alert" role="alert">
                      {mutationError}
                    </p>
                  ) : null}
                  <div className="modal-actions">
                    <Button
                      disabled={removeCandidate.isPending}
                      onClick={() => {
                        setCandidateToRemove(undefined)
                        setMutationError(undefined)
                      }}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      isLoading={removeCandidate.isPending}
                      onClick={() => void confirmRemoval()}
                    >
                      Remove candidate
                    </Button>
                  </div>
                </div>
              </ConfirmDialog>
            ) : null}
          </>
        ) : null}
      </LoadingBoundary>
    </SectionCard>
  )
}
