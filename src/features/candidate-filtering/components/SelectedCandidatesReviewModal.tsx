import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { CandidateSelectionState } from '../hooks/useCandidateSelection'

const gpaFormatter = new Intl.NumberFormat('en-LK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function SelectedCandidatesReviewModal({
  onClose,
  selection,
}: {
  onClose: () => void
  selection: CandidateSelectionState
}) {
  const candidates = [...selection.candidates.values()]
  return (
    <Modal
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
        <div className="modal-actions">
          <Button disabled={!candidates.length} onClick={selection.clear} variant="secondary">
            Clear all
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  )
}
