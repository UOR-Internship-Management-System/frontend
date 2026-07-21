import { Button } from '../../../shared/components/ui/Button'
import { Chip } from '../../../shared/components/ui/Chip'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { InternshipRequest } from '../types/internshipManagementTypes'

const dateFormatter = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const statusTone = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  CLOSED: 'neutral',
  CANCELLED: 'danger',
} as const

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export function InternshipRequestTable({
  onSelect,
  requests,
}: {
  onSelect: (requestId: string) => void
  requests: InternshipRequest[]
}) {
  return (
    <div aria-label="Internship request directory" className="management-row-list" role="list">
      {requests.map((request, index) => (
        <article
          className="management-row internship-request-row"
          key={request.requestId}
          role="listitem"
          style={{ '--row-index': index } as React.CSSProperties}
        >
          <div className="management-row-main">
            <div className="management-row-title-line">
              <h3>{request.title}</h3>
              <StatusBadge tone={statusTone[request.status]}>{label(request.status)}</StatusBadge>
            </div>

            <div className="management-row-metadata">
              <span>
                {request.workMode ? label(request.workMode) : 'Work mode not specified'}
                {request.location ? ` · ${request.location}` : ''}
              </span>
              <span>
                Shortlist guidance:{' '}
                {request.shortlistGuidanceValue === null
                  ? 'Not set'
                  : `${request.shortlistGuidanceValue} candidates`}
              </span>
              <span>Updated {dateFormatter.format(new Date(request.updatedAt))}</span>
            </div>

            <div aria-label="Required skills" className="management-row-skill-chips">
              {request.requiredSkills.slice(0, 6).map((skill) => (
                <Chip key={skill.requiredSkillId}>{skill.skillName}</Chip>
              ))}
              {request.requiredSkills.length > 6 ? (
                <Chip>+{request.requiredSkills.length - 6} more</Chip>
              ) : null}
              {request.requiredSkills.length === 0 ? (
                <span className="management-row-empty-meta">No required skills selected</span>
              ) : null}
            </div>
          </div>

          <div className="management-row-actions">
            <Button onClick={() => onSelect(request.requestId)}>View request</Button>
          </div>
        </article>
      ))}
    </div>
  )
}