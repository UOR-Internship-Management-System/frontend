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
      description: 'Total count of students currently in the database.',
    },
    {
      key: 'registeredStudents',
      label: 'Registered Students',
      value: numberFormatter.format(metrics.registeredStudents),
      description: 'Current count of students registered in the system.',
    },
    {
      key: 'internshipRequestsCreated',
      label: 'Internship Requests Created',
      value: numberFormatter.format(metrics.internshipRequestsCreated),
      description: 'Total number of internship requests that have been generated.',
    },
  ]

  return { metrics: cards }
}
