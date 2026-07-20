import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { Company } from '../types/internshipManagementTypes'

function valueOrFallback(value: string | null) {
  return value || 'Not provided'
}

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
    <Modal
      description="Read and maintain approved company metadata."
      onClose={onClose}
      title="Company details"
    >
      <div className="company-details">
        <div className="company-details-heading">
          <div>
            <h3>{company.name}</h3>
            <p>Company metadata record</p>
          </div>
          <StatusBadge tone={company.active ? 'success' : 'neutral'}>
            {company.active ? 'Active' : 'Inactive'}
          </StatusBadge>
        </div>
        {!company.active ? (
          <div className="inline-alert" role="status">
            This company is unavailable for new internship requests. Edit it to reactivate access.
          </div>
        ) : null}
        <dl>
          <div>
            <dt>Website</dt>
            <dd>
              {company.websiteUrl ? (
                <a href={company.websiteUrl} rel="noreferrer" target="_blank">
                  Open company website
                </a>
              ) : (
                'Not provided'
              )}
            </dd>
          </div>
          <div>
            <dt>Contact person</dt>
            <dd>{valueOrFallback(company.contactPerson)}</dd>
          </div>
          <div>
            <dt>Contact email</dt>
            <dd>
              {company.contactEmail ? (
                <a href={`mailto:${company.contactEmail}`}>{company.contactEmail}</a>
              ) : (
                'Not provided'
              )}
            </dd>
          </div>
          <div>
            <dt>Contact phone</dt>
            <dd>{valueOrFallback(company.contactPhone)}</dd>
          </div>
          <div className="company-details-notes">
            <dt>Administrative notes</dt>
            <dd>{valueOrFallback(company.notes)}</dd>
          </div>
        </dl>
        <div className="modal-actions">
          {company.active ? (
            <Button onClick={onDeactivate} variant="secondary">
              Deactivate company
            </Button>
          ) : null}
          <Button onClick={onEdit}>
            {company.active ? 'Edit company' : 'Edit and reactivate'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
