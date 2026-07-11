import { routePaths } from '../../app/config/routePaths'

export { routePaths }

export const studentProtectedRoutes = [
  routePaths.studentDashboard,
] as const

export const adminProtectedRoutes = [
  routePaths.adminDashboard,
] as const
