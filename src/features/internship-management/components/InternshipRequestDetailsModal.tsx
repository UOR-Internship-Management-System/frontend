import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
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

function fallback(value: string | null) {
  return value || 'Not provided'
}

export function InternshipRequestDetailsModal({
  onCancelRequest,
  onClose,
  onEdit,
  request,
}: {
  onCancelRequest: () => void
  onClose: () => void
  onEdit: () => void
  request: InternshipRequest
}) {
  const editable = request.status === 'DRAFT' || request.status === 'ACTIVE'

  return (
    <Modal
      description="Review request metadata, lifecycle state, and deterministic taxonomy requirements."
      onClose={onClose}
      size="wide"
      title="Internship request details"
    >
      <div className="internship-request-details">
        <div className="company-details-heading">
          <div>
            <h3>{request.title}</h3>
            <p>{request.company.name}</p>
          </div>
          <StatusBadge tone={statusTone[request.status]}>{label(request.status)}</StatusBadge>
        </div>

        <dl className="request-details-grid">
          <div>
            <dt>Location</dt>
            <dd>{fallback(request.location)}</dd>
          </div>
          <div>
            <dt>Work mode</dt>
            <dd>{request.workMode ? label(request.workMode) : 'Not specified'}</dd>
          </div>
          <div>
            <dt>Shortlist guidance</dt>
            <dd>
              {request.shortlistGuidanceValue === null ? 'Not set' : request.shortlistGuidanceValue}
            </dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{dateFormatter.format(new Date(request.updatedAt))}</dd>
          </div>
          <div className="request-details-wide">
            <dt>Description</dt>
            <dd>{fallback(request.description)}</dd>
          </div>
          <div className="request-details-wide">
            <dt>Administrative notes</dt>
            <dd>{fallback(request.notes)}</dd>
          </div>
        </dl>

        <section aria-labelledby="request-required-skills-title" className="request-skill-summary">
          <div>
            <h4 id="request-required-skills-title">Required skills</h4>
            <p>Developer-managed taxonomy requirements used by deterministic filtering.</p>
          </div>
          {request.requiredSkills.length ? (
            <ul>
              {request.requiredSkills.map((skill) => (
                <li key={skill.requiredSkillId}>
                  <strong>{skill.skillName}</strong>
                  <span>
                    {skill.requiredCompetencyLevel
                      ? label(skill.requiredCompetencyLevel)
                      : 'Any declared level'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="request-skills-empty">No required skills selected.</p>
          )}
        </section>

        <p className="request-guidance-note">
          Shortlist guidance is advisory and never blocks shortlist finalization.
        </p>
        <div className="modal-actions">
          {editable ? (
            <Button onClick={onCancelRequest} variant="secondary">
              Cancel request
            </Button>
          ) : null}
          {editable ? <Button onClick={onEdit}>Edit request</Button> : null}
        </div>
      </div>
    </Modal>
  )
}
