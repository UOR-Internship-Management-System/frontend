import type { AuthTokenResponse } from '../../../shared/auth/authTypes'

export type StudentVerificationStartRequest = {
  fullName: string
  indexNumber: string
  universityEmail: string
}

export type StudentVerificationResponse = {
  verificationId: string
  email: string
  expiresAt?: string
  message?: string
}

export type OtpRequest = {
  otp: string
}

export type OtpVerifyResponse = {
  message?: string
  expiresAt?: string
}

export type PasswordRequest = {
  newPassword: string
  confirmPassword: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type PasswordResetStartRequest = {
  accountType: 'STUDENT'
  email: string
}

export type PasswordResetResponse = {
  resetId?: string | null
  message: string
  expiresAt?: string
  expiresInSeconds?: number
}

export type StudentLoginResponse = AuthTokenResponse
