import { routePaths } from '../../app/config/routePaths'

export { routePaths }

export const studentProtectedRoutes = [
  routePaths.studentDashboard,
  routePaths.studentProfile,
  routePaths.studentSkills,
  routePaths.studentProjects,
  routePaths.studentCvBuilder,
  routePaths.studentAcademicRecords,
] as const

export const adminProtectedRoutes = [
  routePaths.adminDashboard,
  routePaths.adminAcademicLedger,
  routePaths.adminStudents,
  routePaths.adminInternships,
  routePaths.adminCandidateFiltering,
  routePaths.adminShortlists,
] as const
