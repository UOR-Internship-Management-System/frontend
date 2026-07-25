import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { Company } from '../types/internshipManagementTypes'

export function CompanyTable({
  companies,
  onDelete,
  onSelect,
  onView,
  selectedCompanyId,
}: {
  companies: Company[]
  onDelete: (companyId: string) => void
  onSelect: (companyId: string) => void
  onView: (companyId: string) => void
  selectedCompanyId?: string
}) {
  return (
    <div aria-label="Company metadata directory" className="wireframe-row-list" role="list">
      {companies.map((company) => (
        <article
          aria-current={company.companyId === selectedCompanyId ? 'true' : undefined}
          className={`wireframe-management-row ${company.companyId === selectedCompanyId ? 'selected' : ''} ${company.active ? '' : 'wireframe-management-row-inactive'}`.trim()}
          key={company.companyId}
          onClick={() => onSelect(company.companyId)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelect(company.companyId)
            }
          }}
          role="listitem"
          tabIndex={0}
        >
          <div className="wireframe-row-meta">
            <div className="request-row-title">
              <h3>{company.name}</h3>
              <StatusBadge tone={company.active ? 'success' : 'neutral'}>
                {company.active ? 'Active' : 'Inactive'}
              </StatusBadge>
            </div>
            <p>
              {company.websiteUrl ?? 'Website not provided'} · HR representative:{' '}
              {company.contactPerson ?? 'Not provided'}
            </p>
          </div>
          <div className="wireframe-row-actions" onClick={(event) => event.stopPropagation()}>
            <Button
              icon={<span className="material-symbols-outlined">visibility</span>}
              onClick={() => onView(company.companyId)}
              variant="secondary"
            >
              View Details
            </Button>
            <Button
              className="wireframe-danger-button"
              icon={<span className="material-symbols-outlined">delete</span>}
              onClick={() => onDelete(company.companyId)}
              variant="secondary"
            >
              Delete Company
            </Button>
          </div>
        </article>
      ))}
    </div>
  )
}
