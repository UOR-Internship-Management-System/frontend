import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '../../app/providers/AuthProvider'

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
