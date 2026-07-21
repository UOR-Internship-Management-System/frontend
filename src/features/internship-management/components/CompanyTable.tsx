import { Button } from '../../../shared/components/ui/Button'
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
          className={`wireframe-management-row ${company.companyId === selectedCompanyId ? 'selected' : ''}`}
          key={company.companyId}
          onClick={() => onSelect(company.companyId)}
          role="listitem"
        >
          <div className="wireframe-row-meta">
            <h3>{company.name}</h3>
            <p>
              {company.websiteUrl ?? 'Website not provided'} · HR Rep:{' '}
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
              Delete
            </Button>
          </div>
        </article>
      ))}
    </div>
  )
}
