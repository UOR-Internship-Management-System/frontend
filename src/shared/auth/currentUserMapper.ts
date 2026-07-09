import type { AuthRole, CurrentUser } from './authTypes'

type CurrentUserSource = {
  userId?: unknown
  id?: unknown
  accountId?: unknown
  email?: unknown
  universityEmail?: unknown
  displayName?: unknown
  fullName?: unknown
  roles?: unknown
  role?: unknown
  primaryRole?: unknown
}

const validRoles: AuthRole[] = ['STUDENT', 'ADMIN']

export function mapCurrentUser(source: unknown): CurrentUser {
  if (!source || typeof source !== 'object') {
    throw new Error('Invalid current user response.')
  }

  const value = source as CurrentUserSource
  const roles = mapRoles(value.roles ?? value.role ?? value.primaryRole)
  const primaryRole = mapRole(value.primaryRole) ?? roles[0]

  if (!primaryRole || !roles.includes(primaryRole)) {
    throw new Error('Current user response does not include a supported role.')
  }

  return {
    userId: readString(value.userId ?? value.id, 'userId'),
    accountId: readString(value.accountId ?? value.userId ?? value.id, 'accountId'),
    email: readString(value.email ?? value.universityEmail, 'email'),
    displayName: readString(value.displayName ?? value.fullName ?? value.email, 'displayName'),
    roles,
    primaryRole,
  }
}

function readString(value: unknown, fieldName: string) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  throw new Error(`Current user response is missing ${fieldName}.`)
}

function mapRoles(value: unknown): AuthRole[] {
  if (Array.isArray(value)) {
    return value.map(mapRole).filter((role): role is AuthRole => Boolean(role))
  }

  const role = mapRole(value)
  return role ? [role] : []
}

function mapRole(value: unknown): AuthRole | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.toUpperCase()
  return validRoles.includes(normalized as AuthRole) ? (normalized as AuthRole) : null
}
