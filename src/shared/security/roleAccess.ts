export type Role = 'STUDENT' | 'ADMIN'

export const roles = {
  student: 'STUDENT',
  admin: 'ADMIN',
} as const

export function canAccessRole(actualRole: Role | null, expectedRole: Role) {
  return actualRole === expectedRole
}
