import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { Company } from '../types/internshipManagementTypes'

const dateFormatter = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function CompanyTable({
  companies,
  onSelect,
}: {
  companies: Company[]
  onSelect: (companyId: string) => void
}) {
  return (
    <div className="table-responsive company-table-wrapper">
      <table className="company-table">
        <caption>Company metadata directory</caption>
        <thead>
          <tr>
            <th scope="col">Company</th>
            <th scope="col">Primary contact</th>
            <th scope="col">Status</th>
            <th scope="col">Last updated</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr
              className={company.active ? undefined : 'company-row-inactive'}
              key={company.companyId}
            >
              <td data-label="Company">
                <strong>{company.name}</strong>
                {company.websiteUrl ? (
                  <span className="company-secondary">{company.websiteUrl}</span>
                ) : null}
              </td>
              <td data-label="Primary contact">
                {company.contactPerson || company.contactEmail || 'Not provided'}
                {company.contactPerson && company.contactEmail ? (
                  <span className="company-secondary">{company.contactEmail}</span>
                ) : null}
              </td>
              <td data-label="Status">
                <StatusBadge tone={company.active ? 'success' : 'neutral'}>
                  {company.active ? 'Active' : 'Inactive'}
                </StatusBadge>
              </td>
              <td data-label="Last updated">{dateFormatter.format(new Date(company.updatedAt))}</td>
              <td data-label="Action">
                <button
                  className="button button-secondary"
                  onClick={() => onSelect(company.companyId)}
                  type="button"
                >
                  View details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
