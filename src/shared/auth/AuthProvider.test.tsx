import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { createQueryClient } from '../../app/config/queryClient'
import { server } from '../../mocks/server'
import { authStorage } from './authStorage'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

const adminUser = {
  userId: 'admin-user-1',
  accountId: 'admin-account-1',
  email: 'admin@dcs.ruh.ac.lk',
  displayName: 'Department Admin',
  roles: ['ADMIN'] as const,
  primaryRole: 'ADMIN' as const,
}

function Probe() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="user">{auth.currentUser?.displayName ?? 'none'}</span>
      <span data-testid="session-error">{auth.sessionError?.message ?? 'none'}</span>
      <button
        onClick={() => void auth.signInWithToken({ accessToken: 'admin-token', user: adminUser })}
        type="button"
      >
        Sign in
      </button>
      <button onClick={() => void auth.refreshCurrentUser()} type="button">
        Refresh
      </button>
    </div>
  )
}

function renderProvider() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('AuthProvider session restoration', () => {
  afterEach(() => authStorage.clearToken())

  it('preserves the token and exposes a recoverable state for a 503 response', async () => {
    authStorage.setToken('admin-token')
    server.use(
      http.get('/api/v1/auth/me', () =>
        HttpResponse.json(
          { title: 'Unavailable', status: 503, correlationId: 'corr-503' },
          { status: 503 },
        ),
      ),
    )

    renderProvider()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'))
    expect(authStorage.getToken()).toBe('admin-token')
    expect(screen.getByTestId('session-error')).toHaveTextContent('preserved')
  })

  it('clears the session only for a confirmed 401 response', async () => {
    authStorage.setToken('invalid-token')
    server.use(
      http.get('/api/v1/auth/me', () =>
        HttpResponse.json({ title: 'Authentication required', status: 401 }, { status: 401 }),
      ),
    )

    renderProvider()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'))
    expect(authStorage.getToken()).toBeNull()
  })

  it('retains an already loaded Admin identity during a temporary refresh failure', async () => {
    const user = userEvent.setup()
    renderProvider()
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Department Admin'))

    server.use(
      http.get('/api/v1/auth/me', () =>
        HttpResponse.json({ title: 'Unavailable', status: 500 }, { status: 500 }),
      ),
    )
    await user.click(screen.getByRole('button', { name: 'Refresh' }))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'))
    expect(screen.getByTestId('user')).toHaveTextContent('Department Admin')
    expect(authStorage.getToken()).toBe('admin-token')
  })
})
