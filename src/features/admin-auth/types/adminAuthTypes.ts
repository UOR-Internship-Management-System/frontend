import type { AuthTokenResponse } from '../../../shared/auth/authTypes'

export type AdminLoginRequest = {
  email: string
  password: string
}

export type AdminLoginResponse = AuthTokenResponse

export type AdminPasswordResetStartRequest = {
  accountType: 'ADMIN'
  email: string
}

export type AdminPasswordResetResponse = {
  resetId?: string | null
  message: string
  expiresAt?: string
  expiresInSeconds?: number
}

export type AdminOtpRequest = {
  otp: string
}

export type AdminPasswordRequest = {
  newPassword: string
  confirmPassword: string
}
