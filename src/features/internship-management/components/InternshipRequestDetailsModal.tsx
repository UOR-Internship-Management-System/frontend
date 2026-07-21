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
  const editable = request.status === 'DRAFT' || request.status === 'ACTIVE'
  return (
    <Modal onClose={onClose} size="wide" title="Candidate Selection Criteria">
      <dl className="wireframe-details-grid">
        <div>
          <dt>Internship Role Title</dt>
          <dd>{request.title}</dd>
        </div>
        <div>
          <dt>Maximum Shortlist Limit</dt>
          <dd>{request.shortlistGuidanceValue ?? 'Not set'}</dd>
        </div>
        <div className="wireframe-details-wide">
          <dt>Required Technical Skills (Compiled Matching Array)</dt>
          <dd className="wireframe-skill-tokens">
            {request.requiredSkills.map((skill) => (
              <span key={skill.requiredSkillId}>{skill.skillName}</span>
            ))}
          </dd>
        </div>
      </dl>
      <div className="modal-actions">
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
        {editable ? (
          <Button icon={<span className="material-symbols-outlined">edit</span>} onClick={onEdit}>
            Edit
          </Button>
        ) : null}
      </div>
    </Modal>
  )
}
