import type { AuthRole, CurrentUser } from './authTypes'

export function hasRole(user: CurrentUser | null, role: AuthRole) {
  return Boolean(user?.roles.includes(role))
}
