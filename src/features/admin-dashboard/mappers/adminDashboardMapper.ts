import type {
  AdminDashboardMetrics,
  AdminDashboardView,
  AdminMetricView,
} from '../types/adminDashboardTypes'

const numberFormatter = new Intl.NumberFormat()

export function mapAdminDashboard(metrics: AdminDashboardMetrics): AdminDashboardView {
  const cards: AdminMetricView[] = [
    {
      key: 'totalStudents',
      label: 'Total Students',
      value: numberFormatter.format(metrics.totalStudents),
      description: 'Total number of Student records currently available.',
    },
    {
      key: 'registeredStudents',
      label: 'Registered Students',
      value: numberFormatter.format(metrics.registeredStudents),
      description: 'Students currently registered in the system.',
    },
    {
      key: 'internshipRequestsCreated',
      label: 'Internship Requests Created',
      value: numberFormatter.format(metrics.internshipRequestsCreated),
      description: 'Internship requests created to date.',
    },
  ]

  return {
    metrics: cards,
    lastUpdatedLabel: new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(metrics.lastUpdatedAt)),
  }
}
