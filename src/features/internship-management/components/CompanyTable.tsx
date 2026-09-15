import { List, ListItem } from '../../../shared/components/ui/List'
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
    <List aria-label="Company metadata directory" className="im-list">
      {companies.map((company) => {
        const isSelected = company.companyId === selectedCompanyId
        return (
          <ListItem
            aria-current={isSelected ? 'true' : undefined}
            className={`im-row ${isSelected ? 'im-row--selected' : ''}`.trim()}
            headline={<span className="im-row-title">{company.name}</span>}
            interactive
            key={company.companyId}
            onClick={() => onSelect(company.companyId)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(company.companyId)
              }
            }}
            supportingText={
              <>
                {company.websiteUrl ?? 'Website not provided'} · HR representative:{' '}
                {company.contactPerson ?? 'Not provided'}
              </>
            }
            trailing={
              <div className="im-row-actions" onClick={(event) => event.stopPropagation()}>
                <Button
                  icon={<span className="material-symbols-outlined">visibility</span>}
                  onClick={() => onView(company.companyId)}
                  size="sm"
                  variant="outlined"
                >
                  View Details
                </Button>
                <Button
                  aria-label="Delete Company"
                  icon={<span className="material-symbols-outlined">delete</span>}
                  onClick={() => onDelete(company.companyId)}
                  size="sm"
                  variant="danger"
                >
                  Delete
                </Button>
              </div>
            }
          />
        )
      })}
    </List>
  )
}
