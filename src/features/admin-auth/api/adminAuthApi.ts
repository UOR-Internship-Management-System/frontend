import { httpClient } from '../../../shared/api/httpClient'
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminOtpRequest,
  AdminPasswordRequest,
  AdminPasswordResetResponse,
  AdminPasswordResetStartRequest,
} from '../types/adminAuthTypes'

export const adminAuthApi = {
  login: (request: AdminLoginRequest, signal?: AbortSignal) =>
    httpClient<AdminLoginResponse>('/auth/admin/login', {
      method: 'POST',
      body: request,
      signal,
    }),

  startPasswordReset: (request: AdminPasswordResetStartRequest, signal?: AbortSignal) =>
    httpClient<AdminPasswordResetResponse>('/password-resets', {
      method: 'POST',
      body: request,
      signal,
    }),

  verifyResetOtp: (resetId: string, request: AdminOtpRequest, signal?: AbortSignal) =>
    httpClient<void>(`/password-resets/${resetId}/otp/verify`, {
      method: 'POST',
      body: request,
      signal,
    }),

  resendResetOtp: (resetId: string, signal?: AbortSignal) =>
    httpClient<void>(`/password-resets/${resetId}/otp/resend`, {
      method: 'POST',
      body: {},
      signal,
    }),

  completePasswordReset: (resetId: string, request: AdminPasswordRequest, signal?: AbortSignal) =>
    httpClient<void>(`/password-resets/${resetId}/password`, {
      method: 'POST',
      body: request,
      signal,
    }),
}
