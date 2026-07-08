import type { PropsWithChildren } from 'react'
import { createContext, useMemo, useState } from 'react'
import { runtimeConfig } from '../config/runtimeConfig'

export type UserRole = 'STUDENT' | 'ADMIN'
export type AuthStatus = 'anonymous' | 'authenticated'

export type AuthState = {
  status: AuthStatus
  role: UserRole | null
  userId: string | null
}

export type AuthContextValue = AuthState & {
  setFoundationRole: (role: UserRole) => void
  clearFoundationAuth: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function parseDevRole(value: string): UserRole | null {
  return value === 'STUDENT' || value === 'ADMIN' ? value : null
}

export function AuthProvider({ children }: PropsWithChildren) {
  const devRole = runtimeConfig.isProduction ? null : parseDevRole(runtimeConfig.devAuthRole)
  const [state, setState] = useState<AuthState>(() => ({
    status: devRole ? 'authenticated' : 'anonymous',
    role: devRole,
    userId: devRole ? `foundation-${devRole.toLowerCase()}` : null,
  }))

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      setFoundationRole: (role) =>
        setState({ status: 'authenticated', role, userId: `foundation-${role.toLowerCase()}` }),
      clearFoundationAuth: () => setState({ status: 'anonymous', role: null, userId: null }),
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
