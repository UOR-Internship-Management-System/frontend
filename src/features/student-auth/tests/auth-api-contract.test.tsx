import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { routes } from '../../../app/router/routes'
import { httpClient } from '../../../shared/api/httpClient'
import { queryKeys } from '../../../shared/api/queryKeys'
import { AuthProvider } from '../../../shared/auth/AuthProvider'
import { authStorage } from '../../../shared/auth/authStorage'
import { useAuth } from '../../../shared/auth/useAuth'
import { adminAuthApi } from '../../admin-auth/api/adminAuthApi'
import { studentAuthApi } from '../api/studentAuthApi'

vi.mock('../../../shared/api/httpClient', () => ({
  httpClient: vi.fn(),
}))

const mockedHttpClient = vi.mocked(httpClient)

function collectRoutePaths(nodes: typeof routes): string[] {
  return nodes.flatMap((route) => [
    typeof route.path === 'string' ? route.path : '',
    ...collectRoutePaths(route.children ?? []),
  ])
}

function LogoutButton() {
  const { logout } = useAuth()
  return <button onClick={() => void logout()}>Log out</button>
}

describe('Sprint 2 auth API contract', () => {
  beforeEach(() => {
    mockedHttpClient.mockReset()
    authStorage.clearToken()
  })

  it('sends Student login with email and password', async () => {
    await studentAuthApi.login({ email: 'student@dcs.ruh.ac.lk', password: 'Password@123' })

    expect(mockedHttpClient).toHaveBeenCalledWith('/auth/student/login', {
      method: 'POST',
      body: { email: 'student@dcs.ruh.ac.lk', password: 'Password@123' },
      signal: undefined,
    })
  })

  it('sends OTP verification with otpCode', async () => {
    await studentAuthApi.verifyOtp('verification-id', { otpCode: '123456' })
    await adminAuthApi.verifyResetOtp('reset-id', { otpCode: '654321' })

    expect(mockedHttpClient).toHaveBeenNthCalledWith(
      1,
      '/student-verifications/verification-id/otp/verify',
      {
        method: 'POST',
        body: { otpCode: '123456' },
        signal: undefined,
      },
    )
    expect(mockedHttpClient).toHaveBeenNthCalledWith(2, '/password-resets/reset-id/otp/verify', {
      method: 'POST',
      body: { otpCode: '654321' },
      signal: undefined,
    })
  })

  it('sends OTP resend requests without a request body', async () => {
    await studentAuthApi.resendOtp('verification-id')
    await studentAuthApi.resendResetOtp('reset-id')

    expect(mockedHttpClient).toHaveBeenNthCalledWith(
      1,
      '/student-verifications/verification-id/otp/resend',
      {
        method: 'POST',
        signal: undefined,
      },
    )
    expect(mockedHttpClient).toHaveBeenNthCalledWith(2, '/password-resets/reset-id/otp/resend', {
      method: 'POST',
      signal: undefined,
    })
  })

  it('sends logout without a request body', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()
    const profileKey = [...queryKeys.protected, 'student-profile'] as const
    mockedHttpClient.mockResolvedValue(undefined)
    queryClient.setQueryData(profileKey, { fullName: 'Test Student' })

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LogoutButton />
        </AuthProvider>
      </QueryClientProvider>,
    )

    authStorage.setToken('student-token')
    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(mockedHttpClient).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
    await waitFor(() => expect(queryClient.getQueryData(profileKey)).toBeUndefined())
  })

  it('registers Profile while keeping later Student and Admin routes inactive', () => {
    expect(collectRoutePaths(routes)).toContain('/student/profile')
    expect(collectRoutePaths(routes)).not.toEqual(
      expect.arrayContaining([
        '/student/skills',
        '/student/projects',
        '/student/cv-builder',
        '/student/academic-records',
        '/admin/academic-ledger',
        '/admin/students',
        '/admin/internships',
        '/admin/candidate-filtering',
        '/admin/shortlists',
      ]),
    )
  })
})
