import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import type { Company } from '../types/internshipManagementTypes'

export function CompanyDetailsModal({
  company,
  onClose,
  onDeactivate,
  onEdit,
}: {
  company: Company
  onClose: () => void
  onDeactivate: () => void
  onEdit: () => void
}) {
  return (
    <Modal onClose={onClose} title="Corporate CRM Details Panel">
      <dl className="wireframe-details-grid">
        <div className="wireframe-details-wide">
          <dt>Company Legal Name</dt>
          <dd>{company.name}</dd>
        </div>
        <div>
          <dt>Corporate Website URL</dt>
          <dd>{company.websiteUrl ?? 'Not provided'}</dd>
        </div>
        <div>
          <dt>HR Representative Name</dt>
          <dd>{company.contactPerson ?? 'Not provided'}</dd>
        </div>
        <div>
          <dt>Office / HR Email Address</dt>
          <dd>{company.contactEmail ?? 'Not provided'}</dd>
        </div>
        <div>
          <dt>Direct Line Phone</dt>
          <dd>{company.contactPhone ?? 'Not provided'}</dd>
        </div>
      </dl>
      <div className="modal-actions">
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
        <Button onClick={onDeactivate} variant="secondary">
          Delete
        </Button>
        <Button icon={<span className="material-symbols-outlined">edit</span>} onClick={onEdit}>
          Edit
        </Button>
      </div>
    </Modal>
  )
}
