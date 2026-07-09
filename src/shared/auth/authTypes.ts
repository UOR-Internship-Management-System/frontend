export type AuthRole = 'STUDENT' | 'ADMIN'

export type CurrentUser = {
  userId: string
  accountId: string
  email: string
  displayName: string
  roles: AuthRole[]
  primaryRole: AuthRole
}

export type AuthTokenResponse = {
  accessToken: string
  tokenType?: string
  expiresInSeconds?: number
  user?: unknown
}

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated'

export type AuthState = {
  status: AuthStatus
  currentUser: CurrentUser | null
}

export type VerificationFlowContext = {
  verificationId: string
  email: string
  expiresAt?: string
  verified?: boolean
}

export type PasswordResetFlowContext = {
  resetId: string
  accountType: AuthRole
  email: string
  otpVerified?: boolean
  expiresAt?: string
}

export type AuthContextValue = AuthState & {
  isAuthenticated: boolean
  roles: AuthRole[]
  primaryRole: AuthRole | null
  userId: string | null
  role: AuthRole | null
  signInWithToken: (tokenResponse: AuthTokenResponse) => Promise<CurrentUser>
  refreshCurrentUser: () => Promise<CurrentUser | null>
  logout: () => Promise<void>
}
