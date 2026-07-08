import { routePaths } from '../../app/config/routePaths'
import type { AuthRole } from './authTypes'

export function getLoginPathForRole(role: AuthRole) {
  return role === 'ADMIN' ? routePaths.adminLogin : routePaths.studentLogin
}

export function getDashboardPathForRole(role: AuthRole) {
  return role === 'ADMIN' ? routePaths.adminDashboard : routePaths.studentDashboard
}
