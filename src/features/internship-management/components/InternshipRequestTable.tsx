import { List, ListItem } from '../../../shared/components/ui/List'
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
    <List aria-label="Internship request directory" className="im-list">
      {requests.map((request) => (
        <ListItem
          className="im-row"
          headline={<span className="im-row-title">{request.title}</span>}
          key={request.requestId}
          supportingText={
            <>
              <span className="im-row-line">
                Shortlist guidance:{' '}
                {request.shortlistGuidanceValue === null
                  ? 'Not set'
                  : `${request.shortlistGuidanceValue} candidates`}{' '}
                · Advisory only
              </span>
              <span className="im-row-line">
                Required skills:{' '}
                {request.requiredSkills.map((skill) => skill.skillName).join(', ') || 'None'}
              </span>
            </>
          }
          trailing={
            <div className="im-row-actions">
              <Button
                icon={<span className="material-symbols-outlined">visibility</span>}
                onClick={() => onSelect(request.requestId)}
                size="sm"
                variant="outlined"
              >
                View Details
              </Button>
              <Button
                icon={<span className="material-symbols-outlined">delete_sweep</span>}
                onClick={() => onDelete(request.requestId)}
                size="sm"
                variant="danger"
              >
                Delete Internship Request
              </Button>
            </div>
          }
        />
      ))}
    </List>
  )
}
