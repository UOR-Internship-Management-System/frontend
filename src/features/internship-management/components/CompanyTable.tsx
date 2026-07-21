import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { Company } from '../types/internshipManagementTypes'

const dateFormatter = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function contactSummary(company: Company) {
  return (
    company.contactPerson || company.contactEmail || company.contactPhone || 'No contact provided'
  )
}

export function CompanyTable({
  companies,
  onSelect,
  onView,
  selectedCompanyId,
}: {
  companies: Company[]
  onSelect: (companyId: string) => void
  onView: (companyId: string) => void
  selectedCompanyId?: string
}) {
  return (
    <div aria-label="Company metadata directory" className="management-row-list" role="list">
      {companies.map((company, index) => {
        const selected = company.companyId === selectedCompanyId

        return (
          <article
            aria-current={selected ? 'true' : undefined}
            className={`management-row company-directory-row ${
              selected ? 'management-row-selected' : ''
            } ${company.active ? '' : 'management-row-inactive'}`.trim()}
            key={company.companyId}
            role="listitem"
            style={{ '--row-index': index } as React.CSSProperties}
          >
            <div className="management-row-main">
              <div className="management-row-title-line">
                <h3>{company.name}</h3>
                <StatusBadge tone={company.active ? 'success' : 'neutral'}>
                  {company.active ? 'Active' : 'Inactive'}
                </StatusBadge>
                {selected ? <span className="selected-context-badge">Selected context</span> : null}
              </div>

              <div className="management-row-metadata">
                <span>{contactSummary(company)}</span>
                {company.contactPerson && company.contactEmail ? (
                  <span>{company.contactEmail}</span>
                ) : null}
                {company.websiteUrl ? <span>{company.websiteUrl}</span> : null}
                <span>Updated {dateFormatter.format(new Date(company.updatedAt))}</span>
              </div>
            </div>

            <div className="management-row-actions">
              <Button
                aria-pressed={selected}
                onClick={() => onSelect(company.companyId)}
                variant={selected ? 'primary' : 'secondary'}
              >
                {selected ? 'Selected company' : 'Select company'}
              </Button>
              <Button onClick={() => onView(company.companyId)} variant="secondary">
                View details
              </Button>
            </div>
          </article>
        )
      })}
    </div>
  )
}