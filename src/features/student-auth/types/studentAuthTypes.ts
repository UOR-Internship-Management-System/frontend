import type { AuthTokenResponse } from '../../../shared/auth/authTypes'

export type StudentVerificationStartRequest = {
  fullName: string
  indexNumber: string
  universityEmail: string
}

export type StudentVerificationResponse = {
  verificationId: string
  status: 'OTP_SENT' | 'VERIFICATION_FAILED'
  expiresAt?: string
  message?: string
}

export type OtpRequest = {
  otpCode: string
}

export type OtpVerifyResponse = {
  verified: true
}

export type OtpResendResponse = {
  message: string
  expiresInSeconds: number
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
  resetId: string
  message: string
  expiresInSeconds: number
}

export type StudentLoginResponse = AuthTokenResponse
