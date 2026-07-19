import type { ApiAdminDashboardMetricsResponse } from '../../../shared/api/generated/cvManagementApi.types'

export type AdminDashboardMetrics = ApiAdminDashboardMetricsResponse

export type AdminMetricView = {
  key: 'totalStudents' | 'registeredStudents' | 'internshipRequestsCreated'
  label: string
  value: string
  description: string
}

export type AdminDashboardView = {
  metrics: AdminMetricView[]
  lastUpdatedLabel: string
}
