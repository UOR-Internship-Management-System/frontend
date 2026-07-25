import type { ApiAdminDashboardMetricsResponse } from '../../shared/api/generated/cvManagementApi.types'

export const adminDashboardMetricsFixture = {
  totalStudents: 142,
  registeredStudents: 134,
  internshipRequestsCreated: 12,
  lastUpdatedAt: '2026-07-19T03:30:00Z',
} satisfies ApiAdminDashboardMetricsResponse
