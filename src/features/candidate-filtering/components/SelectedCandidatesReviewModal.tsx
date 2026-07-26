import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import {
  useAddShortlistCandidates,
  useCreateDraftShortlist,
  useFinalizeShortlist,
} from '../../shortlists/hooks/useShortlists'
import type { CandidateSelectionState } from '../hooks/useCandidateSelection'

const gpaFormatter = new Intl.NumberFormat('en-LK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

type DraftCheckpoint = {
  shortlistId: string
  version: number
  phase: 'DRAFT_CREATED' | 'CANDIDATES_ADDED'
}

type HandoffError = {
  message: string
  correlationId?: string
}

function shortlistLocation(shortlistId?: string) {
  if (!shortlistId) return routePaths.adminShortlists

  return `${routePaths.adminShortlists}?shortlistId=${encodeURIComponent(shortlistId)}`
}

export function SelectedCandidatesReviewModal({
  guidanceValue,
  onClose,
  requestId,
  runId,
  selection,
}: {
  guidanceValue: number | null
  onClose: () => void
  requestId: string
  runId: string
  selection: CandidateSelectionState
}) {
  const navigate = useNavigate()
  const { notify } = useNotifications()
  const createDraft = useCreateDraftShortlist()
  const addCandidates = useAddShortlistCandidates()
  const finalizeShortlist = useFinalizeShortlist()
  const [draftCheckpoint, setDraftCheckpoint] = useState<DraftCheckpoint>()
  const [handoffError, setHandoffError] = useState<HandoffError>()
  const [requiresShortlistReview, setRequiresShortlistReview] = useState(false)
  const [guidanceAcknowledged, setGuidanceAcknowledged] = useState(false)

  const candidates = [...selection.candidates.values()]
  const guidanceExceeded = guidanceValue !== null && candidates.length > guidanceValue
  const isPending = createDraft.isPending || addCandidates.isPending || finalizeShortlist.isPending
  const hasValidContext = Boolean(requestId && runId)
  const selectionPersisted = draftCheckpoint?.phase === 'CANDIDATES_ADDED'

  const openShortlists = () => {
    navigate(shortlistLocation(draftCheckpoint?.shortlistId))
  }

  const requireShortlistReview = (message: string, correlationId?: string) => {
    setRequiresShortlistReview(true)
    setHandoffError({ message, correlationId })
  }

  const addSelectedCandidates = async (
    checkpoint: DraftCheckpoint,
    studentIds: string[],
  ): Promise<DraftCheckpoint | undefined> => {
    try {
      const result = await addCandidates.mutateAsync({
        shortlistId: checkpoint.shortlistId,
        version: checkpoint.version,
        body: { studentIds },
      })
      const nextCheckpoint: DraftCheckpoint = {
        shortlistId: checkpoint.shortlistId,
        version: result.version,
        phase: 'CANDIDATES_ADDED',
      }
      setDraftCheckpoint(nextCheckpoint)
      return nextCheckpoint
    } catch (reason) {
      const mapped = mapApiError(reason, 'protected')

      if (mapped.status === 409) {
        requireShortlistReview(
          'The draft shortlist can no longer accept these candidates. Open Shortlists to review its latest state.',
          mapped.correlationId,
        )
      } else if (mapped.status === 412 || mapped.status === 428) {
        requireShortlistReview(
          'The draft shortlist changed after it was created. Open Shortlists to reload the latest version before changing candidates.',
          mapped.correlationId,
        )
      } else if (mapped.status === 404) {
        requireShortlistReview(
          'The created draft shortlist could not be found. Open Shortlists to review the available records.',
          mapped.correlationId,
        )
      } else {
        setHandoffError({
          message: `The selected candidates could not be added. Your manual selection is retained; retry the operation. ${mapped.message}`,
          correlationId: mapped.correlationId,
        })
      }

      return undefined
    }
  }

  const finalizeDraftShortlist = async (checkpoint: DraftCheckpoint) => {
    try {
      const finalized = await finalizeShortlist.mutateAsync({
        shortlistId: checkpoint.shortlistId,
        version: checkpoint.version,
        body: {
          acknowledgeGuidanceWarning: guidanceExceeded ? guidanceAcknowledged : false,
          finalizationNote: null,
        },
      })

      selection.clear()
      notify({
        tone: 'success',
        title: 'Shortlist allocation finalized',
        message: `${finalized.selectedCandidateCount} manually selected candidate${finalized.selectedCandidateCount === 1 ? '' : 's'} finalized.`,
      })
      navigate(shortlistLocation(checkpoint.shortlistId))
    } catch (reason) {
      const mapped = mapApiError(reason, 'protected')

      if (mapped.status === 409) {
        requireShortlistReview(
          'The shortlist can no longer be finalized from this dialog. Open Shortlists to review its latest state.',
          mapped.correlationId,
        )
      } else if (mapped.status === 412 || mapped.status === 428) {
        requireShortlistReview(
          'The shortlist changed before finalization. Open Shortlists to reload and review the latest version.',
          mapped.correlationId,
        )
      } else if (mapped.status === 404) {
        requireShortlistReview(
          'The shortlist could not be found. Open Shortlists to review the available records.',
          mapped.correlationId,
        )
      } else {
        setHandoffError({
          message: `The candidates were added to the draft, but finalization failed. Retry finalization without adding them again. ${mapped.message}`,
          correlationId: mapped.correlationId,
        })
      }
    }
  }

  const submitShortlist = async () => {
    if (!candidates.length || !hasValidContext || isPending) return

    setHandoffError(undefined)
    setRequiresShortlistReview(false)
    const studentIds = candidates.map((candidate) => candidate.studentId)
    let checkpoint = draftCheckpoint

    if (!checkpoint) {
      try {
        const shortlist = await createDraft.mutateAsync({
          requestId,
          filterRunId: runId,
        })
        checkpoint = {
          shortlistId: shortlist.shortlistId,
          version: shortlist.version,
          phase: 'DRAFT_CREATED',
        }
        setDraftCheckpoint(checkpoint)
      } catch (reason) {
        const mapped = mapApiError(reason, 'protected')

        if (mapped.status === 409) {
          requireShortlistReview(
            'A shortlist already exists for this internship request. Open Shortlists to review it.',
            mapped.correlationId,
          )
        } else {
          setHandoffError({
            message: mapped.message,
            correlationId: mapped.correlationId,
          })
        }
        return
      }
    }

    if (checkpoint.phase === 'DRAFT_CREATED') {
      const nextCheckpoint = await addSelectedCandidates(checkpoint, studentIds)
      if (!nextCheckpoint) return
      checkpoint = nextCheckpoint
    }

    await finalizeDraftShortlist(checkpoint)
  }

  return (
    <Modal
      closeDisabled={isPending}
      description="Review the manually selected candidates before finalizing shortlist membership."
      onClose={onClose}
      size="wide"
      title="Review Selected Shortlist"
    >
      <div className="selected-candidates-review">
        <p aria-live="polite">
          {candidates.length} candidate
          {candidates.length === 1 ? '' : 's'} selected.
        </p>

        <ul>
          {candidates.map((candidate) => (
            <li key={candidate.studentId}>
              <div>
                <strong>{candidate.fullName}</strong>
                <span>{candidate.indexNumber}</span>
              </div>

              <span>
                Official GPA:{' '}
                {candidate.officialGpa === null
                  ? 'Not available'
                  : gpaFormatter.format(candidate.officialGpa)}
              </span>

              {candidate.hasExistingActiveShortlist ? (
                <StatusBadge tone="neutral">
                  {`Already shortlisted in ${candidate.existingActiveShortlistCount} active request${
                    candidate.existingActiveShortlistCount === 1 ? '' : 's'
                  }`}
                </StatusBadge>
              ) : null}

              <Button
                disabled={isPending || selectionPersisted}
                onClick={() => selection.remove(candidate.studentId)}
                variant="secondary"
              >
                Remove {candidate.fullName}
              </Button>
            </li>
          ))}
        </ul>

        {!hasValidContext ? (
          <div className="inline-alert" role="alert">
            The filtering run context is unavailable. Close this dialog and run filtering again.
          </div>
        ) : null}

        {selectionPersisted ? (
          <div className="inline-alert" role="status">
            Candidate membership is saved in the draft shortlist. Retry finalization or open
            Shortlists to make further changes.
          </div>
        ) : null}

        {guidanceExceeded ? (
          <label className="shortlist-guidance-acknowledgement">
            <input
              checked={guidanceAcknowledged}
              disabled={isPending}
              onChange={(event) => setGuidanceAcknowledged(event.target.checked)}
              type="checkbox"
            />
            <span>
              The selected count exceeds the advisory guidance of {guidanceValue}. I acknowledge
              this warning and want to continue with the manual selection.
            </span>
          </label>
        ) : null}

        {handoffError ? (
          <div className="inline-alert" role="alert">
            <span>{handoffError.message}</span>

            {handoffError.correlationId ? (
              <span> Reference: {handoffError.correlationId}</span>
            ) : null}
          </div>
        ) : null}

        <div className="modal-actions">
          <Button
            disabled={!candidates.length || isPending || selectionPersisted}
            onClick={selection.clear}
            variant="secondary"
          >
            Clear all
          </Button>

          {requiresShortlistReview ? (
            <Button disabled={isPending} onClick={openShortlists}>
              Open Shortlists
            </Button>
          ) : (
            <Button
              disabled={
                !candidates.length ||
                !hasValidContext ||
                (guidanceExceeded && !guidanceAcknowledged)
              }
              isLoading={isPending}
              onClick={() => void submitShortlist()}
            >
              {selectionPersisted ? 'Retry finalization' : 'Finalize Shortlist'}
            </Button>
          )}

          <Button disabled={isPending} onClick={onClose} variant="secondary">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}
