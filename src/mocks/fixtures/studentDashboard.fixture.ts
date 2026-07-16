import type { StudentDashboardMetrics } from '../../features/student-dashboard/types/studentDashboardTypes'
import { getDeclaredSkillsFixture } from './skills.fixture'
import { getStudentProjectsFixture } from './studentProjects.fixture'

const studentDashboardBaseline = {
  shortlistedInternshipCount: 1,
  officialCumulativeGpa: 3.42,
  lastUpdatedAt: '2026-07-15T04:30:00Z',
} as const

export function getStudentDashboardFixture(): StudentDashboardMetrics {
  return {
    ...studentDashboardBaseline,
    projectCount: getStudentProjectsFixture().length,
    declaredSkillCount: getDeclaredSkillsFixture().length,
  }
}
