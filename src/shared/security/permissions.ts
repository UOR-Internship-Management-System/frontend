export const userRoles = {
  student: 'STUDENT',
  admin: 'ADMIN',
} as const

export type UserRole = (typeof userRoles)[keyof typeof userRoles]
