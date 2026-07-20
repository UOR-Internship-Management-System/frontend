import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { InternshipRequest } from '../types/internshipManagementTypes'

const dateFormatter = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const statusTone = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  CLOSED: 'neutral',
  CANCELLED: 'danger',
} as const

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export function InternshipRequestTable({
  onSelect,
  requests,
}: {
  onSelect: (requestId: string) => void
  requests: InternshipRequest[]
}) {
  return (
    <div className="table-responsive internship-request-table-wrapper">
      <table className="internship-request-table">
        <caption>Internship request directory</caption>
        <thead>
          <tr>
            <th scope="col">Request</th>
            <th scope="col">Company</th>
            <th scope="col">Work setting</th>
            <th scope="col">Status</th>
            <th scope="col">Guidance</th>
            <th scope="col">Last updated</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.requestId}>
              <td data-label="Request">
                <strong>{request.title}</strong>
                <span className="company-secondary">
                  {request.requiredSkills.length} required skill
                  {request.requiredSkills.length === 1 ? '' : 's'}
                </span>
              </td>
              <td data-label="Company">{request.company.name}</td>
              <td data-label="Work setting">
                {request.workMode ? label(request.workMode) : 'Not specified'}
                {request.location ? (
                  <span className="company-secondary">{request.location}</span>
                ) : null}
              </td>
              <td data-label="Status">
                <StatusBadge tone={statusTone[request.status]}>{label(request.status)}</StatusBadge>
              </td>
              <td data-label="Guidance">
                {request.shortlistGuidanceValue === null
                  ? 'Not set'
                  : request.shortlistGuidanceValue}
              </td>
              <td data-label="Last updated">{dateFormatter.format(new Date(request.updatedAt))}</td>
              <td data-label="Action">
                <button
                  className="button button-secondary"
                  onClick={() => onSelect(request.requestId)}
                  type="button"
                >
                  View request
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
