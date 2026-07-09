import { httpClient } from '../../../shared/api/httpClient'
import type {
  LoginRequest,
  OtpRequest,
  OtpVerifyResponse,
  PasswordRequest,
  PasswordResetResponse,
  PasswordResetStartRequest,
  StudentLoginResponse,
  StudentVerificationResponse,
  StudentVerificationStartRequest,
} from '../types/studentAuthTypes'

export const studentAuthApi = {
  startVerification: (request: StudentVerificationStartRequest, signal?: AbortSignal) =>
    httpClient<StudentVerificationResponse>('/student-verifications', {
      method: 'POST',
      body: request,
      signal,
    }),

  verifyOtp: (verificationId: string, request: OtpRequest, signal?: AbortSignal) =>
    httpClient<OtpVerifyResponse>(`/student-verifications/${verificationId}/otp/verify`, {
      method: 'POST',
      body: request,
      signal,
    }),

  resendOtp: (verificationId: string, signal?: AbortSignal) =>
    httpClient<OtpVerifyResponse>(`/student-verifications/${verificationId}/otp/resend`, {
      method: 'POST',
      body: {},
      signal,
    }),

  createPassword: (verificationId: string, request: PasswordRequest, signal?: AbortSignal) =>
    httpClient<void>(`/student-verifications/${verificationId}/password`, {
      method: 'POST',
      body: request,
      signal,
    }),

  login: (request: LoginRequest, signal?: AbortSignal) =>
    httpClient<StudentLoginResponse>('/auth/student/login', {
      method: 'POST',
      body: request,
      signal,
    }),

  startPasswordReset: (request: PasswordResetStartRequest, signal?: AbortSignal) =>
    httpClient<PasswordResetResponse>('/password-resets', {
      method: 'POST',
      body: request,
      signal,
    }),

  verifyResetOtp: (resetId: string, request: OtpRequest, signal?: AbortSignal) =>
    httpClient<OtpVerifyResponse>(`/password-resets/${resetId}/otp/verify`, {
      method: 'POST',
      body: request,
      signal,
    }),

  resendResetOtp: (resetId: string, signal?: AbortSignal) =>
    httpClient<OtpVerifyResponse>(`/password-resets/${resetId}/otp/resend`, {
      method: 'POST',
      body: {},
      signal,
    }),

  completePasswordReset: (resetId: string, request: PasswordRequest, signal?: AbortSignal) =>
    httpClient<void>(`/password-resets/${resetId}/password`, {
      method: 'POST',
      body: request,
      signal,
    }),
}
