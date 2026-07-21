import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { CandidateSelectionState } from '../hooks/useCandidateSelection'
import {
  useAddShortlistCandidates,
  useCreateDraftShortlist,
} from '../../shortlists/hooks/useShortlists'

const gpaFormatter = new Intl.NumberFormat('en-LK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function SelectedCandidatesReviewModal({
  onClose,
  requestId,
  runId,
  selection,
}: {
  onClose: () => void
  requestId: string
  runId: string
  selection: CandidateSelectionState
}) {
  const navigate = useNavigate()
  const { notify } = useNotifications()
  const createDraft = useCreateDraftShortlist()
  const addCandidates = useAddShortlistCandidates()
  const [handoffError, setHandoffError] = useState<string>()
  const [duplicateConflict, setDuplicateConflict] = useState(false)
  const candidates = [...selection.candidates.values()]
  const isPending = createDraft.isPending || addCandidates.isPending

  const createDraftShortlist = async () => {
    if (!candidates.length) return
    setHandoffError(undefined)
    setDuplicateConflict(false)
    try {
      const shortlist = await createDraft.mutateAsync({ requestId, filterRunId: runId })
      const result = await addCandidates.mutateAsync({
        shortlistId: shortlist.shortlistId,
        version: shortlist.version,
        body: { studentIds: candidates.map((candidate) => candidate.studentId) },
      })
      selection.clear()
      notify({
        tone: 'success',
        title: 'Draft shortlist created',
        message: `${result.addedCount} added · ${result.alreadyPresentCount} already present.`,
      })
      navigate(`${routePaths.adminShortlists}?shortlistId=${shortlist.shortlistId}`)
    } catch (reason) {
      const mapped = mapApiError(reason, 'protected')
      if (mapped.status === 409) {
        setDuplicateConflict(true)
        setHandoffError(
          'A shortlist already exists for this internship request. Open Shortlists to review it.',
        )
      } else setHandoffError(mapped.message)
    }
  }
  return (
    <Modal
      closeDisabled={isPending}
      description="Review explicit selections from every result page in this filtering run."
      onClose={onClose}
      size="wide"
      title="Selected candidates"
    >
      <div className="selected-candidates-review">
        <p aria-live="polite">
          {candidates.length} candidate{candidates.length === 1 ? '' : 's'} selected.
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
              <Button onClick={() => selection.remove(candidate.studentId)} variant="secondary">
                Remove {candidate.fullName}
              </Button>
            </li>
          ))}
        </ul>
        {handoffError ? (
          <div className="inline-alert" role="alert">
            {handoffError}
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
          {duplicateConflict ? (
            <Button onClick={() => navigate(routePaths.adminShortlists)}>Open Shortlists</Button>
          ) : (
            <Button
              disabled={!candidates.length}
              isLoading={isPending}
              onClick={() => void createDraftShortlist()}
            >
              Create draft shortlist
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
