import { createContext, type ReactNode } from 'react'
import { type UserRole } from '../../shared/security/permissions'

export interface AuthContextValue {
  readonly role: UserRole | null
}

export const AuthContext = createContext<AuthContextValue>({ role: null })

interface AuthProviderProps {
  readonly children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <AuthContext.Provider value={{ role: null }}>{children}</AuthContext.Provider>
}
