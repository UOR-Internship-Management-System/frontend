import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { Checkbox } from '../../../shared/components/forms/Checkbox'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import {
  useAddShortlistCandidates,
  useCreateDraftShortlist,
  useFinalizeShortlist,
} from '../../shortlists/hooks/useShortlists'
import type { CandidateSelectionState } from '../hooks/useCandidateSelection'
import { useClearFilteringSession } from '../hooks/useFilteringSession'

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
  existingShortlist,
  guidanceValue,
  onClose,
  onSettled,
  requestId,
  runId,
  selection,
}: {
  /**
   * When finalizing a draft resumed via Shortlists "Back to finalize shortlist", the draft
   * already exists — this skips the create-draft step so a second attempt doesn't collide with
   * the one-shortlist-per-request constraint.
   */
  existingShortlist?: { shortlistId: string; version: number }
  guidanceValue: number | null
  onClose: () => void
  /** Called once the resumed draft (if any) has been finalized or otherwise settled. */
  onSettled?: () => void
  requestId: string
  runId: string
  selection: CandidateSelectionState
}) {
  const navigate = useNavigate()
  const { notify } = useNotifications()
  const createDraft = useCreateDraftShortlist()
  const addCandidates = useAddShortlistCandidates()
  const finalizeShortlist = useFinalizeShortlist()
  const clearSession = useClearFilteringSession()
  const [draftCheckpoint, setDraftCheckpoint] = useState<DraftCheckpoint | undefined>(() =>
    existingShortlist
      ? {
          shortlistId: existingShortlist.shortlistId,
          version: existingShortlist.version,
          phase: 'DRAFT_CREATED',
        }
      : undefined,
  )
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
      await clearSession.mutateAsync().catch(() => undefined)
      notify({
        tone: 'success',
        title: 'Shortlist allocation finalized',
        message: `${finalized.selectedCandidateCount} manually selected candidate${finalized.selectedCandidateCount === 1 ? '' : 's'} finalized.`,
      })
      onSettled?.()
      onClose()
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
      <div className="cf-review-modal">
        <p aria-live="polite" className="cf-review-summary">
          {candidates.length} candidate
          {candidates.length === 1 ? '' : 's'} selected.
        </p>

        <ul className="cf-review-list">
          {candidates.map((candidate) => (
            <li className="cf-review-item" key={candidate.studentId}>
              <div className="cf-review-item-identity">
                <strong>{candidate.fullName}</strong>
                <span>{candidate.indexNumber}</span>
              </div>

              <span className="cf-review-item-gpa">
                Official GPA:{' '}
                {candidate.officialGpa === null
                  ? 'Not available'
                  : gpaFormatter.format(candidate.officialGpa)}
              </span>

              {candidate.hasExistingActiveShortlist ? (
                <StatusBadge tone="neutral">
                  {`Already shortlisted in ${candidate.existingActiveShortlistCount} other shortlist${
                    candidate.existingActiveShortlistCount === 1 ? '' : 's'
                  }`}
                </StatusBadge>
              ) : null}

              <Button
                disabled={isPending || selectionPersisted}
                onClick={() => selection.remove(candidate.studentId)}
                size="sm"
                variant="outlined"
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
          <div className="cf-guidance-warning">
            <Checkbox
              checked={guidanceAcknowledged}
              disabled={isPending}
              label={
                <>
                  The selected count exceeds the advisory guidance of {guidanceValue}. I acknowledge
                  this warning and want to continue with the manual selection.
                </>
              }
              onChange={(event) => setGuidanceAcknowledged(event.target.checked)}
            />
          </div>
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
            variant="outlined"
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

          <Button disabled={isPending} onClick={onClose} variant="outlined">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}
