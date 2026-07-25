import type { ApiInternshipRequestStatus } from '../../../shared/api/generated/cvManagementApi.types'

export function formatInternshipRequestStatus(status: ApiInternshipRequestStatus) {
  return {
    DRAFT: 'Draft',
    ACTIVE: 'Active',
    CLOSED: 'Closed',
    CANCELLED: 'Cancelled',
  }[status]
}

export function internshipRequestStatusTone(status: ApiInternshipRequestStatus) {
  if (status === 'ACTIVE') return 'success' as const
  if (status === 'CANCELLED') return 'danger' as const
  return 'neutral' as const
}

export function canEditInternshipRequest(status: ApiInternshipRequestStatus) {
  return status === 'DRAFT' || status === 'ACTIVE'
}
