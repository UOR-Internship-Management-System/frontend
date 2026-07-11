import type { PropsWithChildren } from 'react'
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { httpClient } from '../api/httpClient'
import { authStorage } from './authStorage'
import type { AuthContextValue, AuthState, AuthTokenResponse } from './authTypes'
import { mapCurrentUser } from './currentUserMapper'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({
    status: authStorage.getToken() ? 'loading' : 'anonymous',
    currentUser: null,
  })

  const refreshCurrentUser = useCallback(async () => {
    if (!authStorage.getToken()) {
      setState({ status: 'anonymous', currentUser: null })
      return null
    }

    try {
      const response = await httpClient<unknown>('/auth/me')
      const currentUser = mapCurrentUser(response)
      setState({ status: 'authenticated', currentUser })
      return currentUser
    } catch {
      authStorage.clearToken()
      setState({ status: 'anonymous', currentUser: null })
      return null
    }
  }, [])

  useEffect(() => {
    if (authStorage.getToken()) {
      void refreshCurrentUser()
    }
  }, [refreshCurrentUser])

  const signInWithToken = useCallback(
    async (tokenResponse: AuthTokenResponse) => {
      authStorage.setToken(tokenResponse.accessToken)

      if (tokenResponse.user) {
        const currentUser = mapCurrentUser(tokenResponse.user)
        setState({ status: 'authenticated', currentUser })
        return currentUser
      }

      const currentUser = await refreshCurrentUser()
      if (!currentUser) {
        throw new Error('Unable to load authenticated user context.')
      }

      return currentUser
    },
    [refreshCurrentUser],
  )

  const logout = useCallback(async () => {
    try {
      if (authStorage.getToken()) {
        await httpClient<void>('/auth/logout', { method: 'POST' })
      }
    } finally {
      authStorage.clearToken()
      setState({ status: 'anonymous', currentUser: null })
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const roles = state.currentUser?.roles ?? []
    const primaryRole = state.currentUser?.primaryRole ?? null

    return {
      ...state,
      isAuthenticated: state.status === 'authenticated',
      roles,
      primaryRole,
      role: primaryRole,
      userId: state.currentUser?.userId ?? null,
      signInWithToken,
      refreshCurrentUser,
      logout,
    }
  }, [logout, refreshCurrentUser, signInWithToken, state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
