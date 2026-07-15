import type { StudentDashboardMetrics } from '../../features/student-dashboard/types/studentDashboardTypes'

export const studentDashboardFixture = {
  projectCount: 3,
  shortlistedInternshipCount: 1,
  declaredSkillCount: 8,
  officialCumulativeGpa: 3.42,
  lastUpdatedAt: '2026-07-15T04:30:00Z',
} satisfies StudentDashboardMetrics
