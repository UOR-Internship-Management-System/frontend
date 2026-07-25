import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { Company } from '../types/internshipManagementTypes'

export function CompanyDetailsModal({
  company,
  onClose,
  onDelete,
  onEdit,
}: {
  company: Company
  onClose: () => void
  onDelete: () => void
  onEdit: () => void
}) {
  return (
    <Modal onClose={onClose} title="Company Details">
      <dl className="wireframe-details-grid">
        <div className="wireframe-details-wide">
          <dt>Company Name</dt>
          <dd>{company.name}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <StatusBadge tone={company.active ? 'success' : 'neutral'}>
              {company.active ? 'Active' : 'Inactive'}
            </StatusBadge>
          </dd>
        </div>
        <div>
          <dt>Website</dt>
          <dd>
            {company.websiteUrl ? (
              <a href={company.websiteUrl} rel="noreferrer" target="_blank">
                {company.websiteUrl}
              </a>
            ) : (
              'Not provided'
            )}
          </dd>
        </div>
        <div>
          <dt>HR Representative</dt>
          <dd>{company.contactPerson ?? 'Not provided'}</dd>
        </div>
        <div>
          <dt>HR Email Address</dt>
          <dd>
            {company.contactEmail ? (
              <a href={`mailto:${company.contactEmail}`}>{company.contactEmail}</a>
            ) : (
              'Not provided'
            )}
          </dd>
        </div>
        <div>
          <dt>Phone Number</dt>
          <dd>{company.contactPhone ?? 'Not provided'}</dd>
        </div>
        <div className="wireframe-details-wide">
          <dt>Internal Notes</dt>
          <dd>{company.notes ?? 'Not provided'}</dd>
        </div>
      </dl>
      <div className="modal-actions">
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
        <Button className="wireframe-danger-button" onClick={onDelete} variant="secondary">
          Delete Company
        </Button>
        <Button icon={<span className="material-symbols-outlined">edit</span>} onClick={onEdit}>
          Edit
        </Button>
      </div>
    </Modal>
  )
}
