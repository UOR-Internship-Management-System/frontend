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

  /*
   * This checkpoint is intentionally retained after draft creation.
   *
   * If candidate addition fails, retrying uses this existing shortlist
   * instead of creating a second draft for the same internship request.
   */
  const [draftCheckpoint, setDraftCheckpoint] = useState<DraftCheckpoint>()
  const [handoffError, setHandoffError] = useState<HandoffError>()
  const [requiresShortlistReview, setRequiresShortlistReview] = useState(false)
  const [guidanceAcknowledged, setGuidanceAcknowledged] = useState(false)

  const candidates = [...selection.candidates.values()]
  const guidanceExceeded = guidanceValue !== null && candidates.length > guidanceValue
  const isPending = createDraft.isPending || addCandidates.isPending || finalizeShortlist.isPending
  const hasValidContext = Boolean(requestId && runId)

  const openShortlists = () => {
    navigate(shortlistLocation(draftCheckpoint?.shortlistId))
  }

  const addSelectedCandidates = async (
    checkpoint: DraftCheckpoint,
    studentIds: string[],
  ): Promise<boolean> => {
    try {
      const result = await addCandidates.mutateAsync({
        shortlistId: checkpoint.shortlistId,
        version: checkpoint.version,
        body: { studentIds },
      })

      const finalizedCheckpoint = {
        shortlistId: checkpoint.shortlistId,
        version: result.version,
      }
      setDraftCheckpoint(finalizedCheckpoint)

      const finalized = await finalizeShortlist.mutateAsync({
        shortlistId: finalizedCheckpoint.shortlistId,
        version: finalizedCheckpoint.version,
        body: {
          acknowledgeGuidanceWarning: guidanceExceeded ? guidanceAcknowledged : false,
          finalizationNote: null,
        },
      })

      /*
       * Selections are cleared only after both operations have succeeded.
       * They remain available when candidate addition fails.
       */
      selection.clear()

      notify({
        tone: 'success',
        title: 'Shortlist allocation finalized',
        message: `${finalized.selectedCandidateCount} manually selected candidate${finalized.selectedCandidateCount === 1 ? '' : 's'} locked.`,
      })

      navigate(shortlistLocation(checkpoint.shortlistId))
      return true
    } catch (reason) {
      const mapped = mapApiError(reason, 'protected')

      /*
       * A 409 during candidate addition is not necessarily the same as
       * a duplicate-shortlist conflict during creation. The shortlist
       * may have been finalized or otherwise changed.
       */
      if (mapped.status === 409) {
        setRequiresShortlistReview(true)
        setHandoffError({
          message:
            'The draft shortlist can no longer accept these candidates. Open Shortlists to review its latest state.',
          correlationId: mapped.correlationId,
        })
      } else if (mapped.status === 412 || mapped.status === 428) {
        /*
         * Retrying with the same stale version would repeatedly fail.
         * Require the Admin to reload the latest shortlist instead.
         */
        setRequiresShortlistReview(true)
        setHandoffError({
          message:
            'The draft shortlist changed after it was created. Open Shortlists to reload the latest version before changing candidates.',
          correlationId: mapped.correlationId,
        })
      } else if (mapped.status === 404) {
        setRequiresShortlistReview(true)
        setHandoffError({
          message:
            'The created draft shortlist could not be found. Open Shortlists to review the available records.',
          correlationId: mapped.correlationId,
        })
      } else {
        /*
         * For network and transient server failures, retain the draft
         * checkpoint and allow candidate addition to be retried without
         * creating another shortlist.
         */
        setHandoffError({
          message: `The shortlist could not be finalized. Your manual selection is retained; retry the operation. ${mapped.message}`,
          correlationId: mapped.correlationId,
        })
      }

      return false
    }
  }

  const createDraftShortlist = async () => {
    if (!candidates.length || !hasValidContext || isPending) return

    setHandoffError(undefined)
    setRequiresShortlistReview(false)

    /*
     * Snapshot the current explicit selection before starting the
     * asynchronous operation.
     */
    const studentIds = candidates.map((candidate) => candidate.studentId)
    let checkpoint = draftCheckpoint

    /*
     * Skip draft creation when a previous attempt already created it.
     */
    if (!checkpoint) {
      try {
        const shortlist = await createDraft.mutateAsync({
          requestId,
          filterRunId: runId,
        })

        checkpoint = {
          shortlistId: shortlist.shortlistId,
          version: shortlist.version,
        }

        setDraftCheckpoint(checkpoint)
      } catch (reason) {
        const mapped = mapApiError(reason, 'protected')

        /*
         * A 409 at this stage means the internship request already owns
         * a shortlist. This is distinct from candidate-addition conflicts.
         */
        if (mapped.status === 409) {
          setRequiresShortlistReview(true)
          setHandoffError({
            message:
              'A shortlist already exists for this internship request. Open Shortlists to review it.',
            correlationId: mapped.correlationId,
          })
        } else {
          setHandoffError({
            message: mapped.message,
            correlationId: mapped.correlationId,
          })
        }

        return
      }
    }

    await addSelectedCandidates(checkpoint, studentIds)
  }

  return (
    <Modal
      closeDisabled={isPending}
      description="Review the manually selected candidates before permanently locking shortlist membership."
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
                  {`${candidate.existingActiveShortlistCount} existing`}
                </StatusBadge>
              ) : null}

              <Button
                disabled={isPending}
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
            disabled={!candidates.length || isPending}
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
              onClick={() => void createDraftShortlist()}
            >
              {draftCheckpoint ? 'Retry and lock shortlist' : 'Confirm & Lock Final Shortlist'}
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
