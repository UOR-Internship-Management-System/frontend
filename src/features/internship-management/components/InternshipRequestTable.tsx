import { Button } from '../../../shared/components/ui/Button'
import type { InternshipRequest } from '../types/internshipManagementTypes'

export function InternshipRequestTable({
  onDelete,
  onSelect,
  requests,
}: {
  onDelete: (requestId: string) => void
  onSelect: (requestId: string) => void
  requests: InternshipRequest[]
}) {
  return (
    <div aria-label="Internship request directory" className="wireframe-row-list" role="list">
      {requests.map((request) => (
        <article className="wireframe-management-row" key={request.requestId} role="listitem">
          <div className="wireframe-row-meta">
            <h3>{request.title}</h3>
            <p>
              Shortlist guidance:{' '}
              {request.shortlistGuidanceValue === null
                ? 'Not set'
                : `${request.shortlistGuidanceValue} candidates`}{' '}
              · Advisory only
            </p>
            <p>
              Required skills:{' '}
              {request.requiredSkills.map((skill) => skill.skillName).join(', ') || 'None'}
            </p>
          </div>
          <div className="wireframe-row-actions">
            <Button
              icon={<span className="material-symbols-outlined">visibility</span>}
              onClick={() => onSelect(request.requestId)}
              variant="secondary"
            >
              View Details
            </Button>
            <Button
              className="wireframe-danger-button"
              icon={<span className="material-symbols-outlined">delete_sweep</span>}
              onClick={() => onDelete(request.requestId)}
              variant="secondary"
            >
              Delete Internship Request
            </Button>
          </div>
        </article>
      ))}
    </div>
  )
}
