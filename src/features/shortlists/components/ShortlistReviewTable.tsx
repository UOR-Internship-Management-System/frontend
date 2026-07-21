import { Link } from 'react-router-dom'
import { buildAdminStudentDetailPath } from '../../../app/config/routePaths'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { ShortlistCandidate } from '../types/shortlistTypes'

const gpaFormatter = new Intl.NumberFormat('en-LK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function ShortlistReviewTable({
  candidates,
  isDraft,
  removingStudentId,
  onRemove,
}: {
  candidates: ShortlistCandidate[]
  isDraft: boolean
  removingStudentId?: string
  onRemove: (candidate: ShortlistCandidate) => void
}) {
  return (
    <div className="table-responsive shortlist-review-table-wrapper">
      <table className="shortlist-review-table">
        <caption>Manually selected shortlist candidates</caption>
        <thead>
          <tr>
            <th scope="col">Student</th>
            <th scope="col">Official GPA</th>
            <th scope="col">Latest saved CV</th>
            <th scope="col">Active shortlists</th>
            <th scope="col">Selected</th>
            {isDraft ? <th scope="col">Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate.studentId}>
              <td data-label="Student">
                <Link to={buildAdminStudentDetailPath(candidate.studentId)}>
                  <strong>{candidate.fullName}</strong>
                </Link>
                <span className="shortlist-secondary">{candidate.indexNumber}</span>
                {candidate.selectionNote ? (
                  <span className="shortlist-secondary">{candidate.selectionNote}</span>
                ) : null}
              </td>
              <td data-label="Official GPA">
                {candidate.officialGpa === null
                  ? 'Not available'
                  : gpaFormatter.format(candidate.officialGpa)}
              </td>
              <td data-label="Latest saved CV">
                <StatusBadge tone={candidate.hasLatestSavedCv ? 'success' : 'neutral'}>
                  {candidate.hasLatestSavedCv ? 'Available' : 'Not saved'}
                </StatusBadge>
              </td>
              <td data-label="Active shortlists">
                <StatusBadge tone="neutral">
                  {candidate.hasExistingActiveShortlist
                    ? `${candidate.existingActiveShortlistCount} existing`
                    : 'None'}
                </StatusBadge>
              </td>
              <td data-label="Selected">{dateFormatter.format(new Date(candidate.selectedAt))}</td>
              {isDraft ? (
                <td data-label="Action">
                  <Button
                    disabled={Boolean(removingStudentId)}
                    isLoading={removingStudentId === candidate.studentId}
                    onClick={() => onRemove(candidate)}
                    variant="secondary"
                  >
                    Remove {candidate.fullName}
                  </Button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
