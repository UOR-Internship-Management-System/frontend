import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import type { InternshipRequest } from '../types/internshipManagementTypes'

export function InternshipRequestDetailsModal({
  onClose,
  onEdit,
  request,
}: {
  onClose: () => void
  onEdit: () => void
  request: InternshipRequest
}) {
  return (
    <Modal onClose={onClose} size="wide" title="Internship Request Details">
      <dl className="wireframe-details-grid">
        <div className="wireframe-details-wide">
          <dt>Internship Role Title</dt>
          <dd>{request.title}</dd>
        </div>
        <div className="wireframe-details-wide">
          <dt>Company</dt>
          <dd>{request.company.name}</dd>
        </div>
        <div>
          <dt>Shortlist Guidance Value</dt>
          <dd>
            {request.shortlistGuidanceValue === null
              ? 'Not set'
              : `${request.shortlistGuidanceValue} candidates (advisory only)`}
          </dd>
        </div>
        <div className="wireframe-details-wide">
          <dt>Role Description</dt>
          <dd>{request.description ?? 'Not provided'}</dd>
        </div>
        <div className="wireframe-details-wide">
          <dt>Required Declared Skills</dt>
          <dd className="wireframe-skill-tokens">
            {request.requiredSkills.length ? (
              request.requiredSkills.map((skill) => (
                <span key={skill.requiredSkillId}>{skill.skillName}</span>
              ))
            ) : (
              <span>No required skills</span>
            )}
          </dd>
        </div>
      </dl>
      <div className="modal-actions">
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
        <Button icon={<span className="material-symbols-outlined">edit</span>} onClick={onEdit}>
          Edit
        </Button>
      </div>
    </Modal>
  )
}
