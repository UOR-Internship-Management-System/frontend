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
  resetId: string
  message: string
  expiresInSeconds: number
}

export type AdminOtpRequest = {
  otpCode: string
}

export type AdminOtpVerifyResponse = {
  verified: true
}

export type AdminOtpResendResponse = {
  message: string
  expiresInSeconds: number
}

export type AdminPasswordRequest = {
  newPassword: string
  confirmPassword: string
}
