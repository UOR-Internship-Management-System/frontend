import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { routePaths } from '../../../app/config/routePaths'
import { RequireResetContextRoute } from '../../../app/router/routeGuards'
import { authStorage } from '../../../shared/auth/authStorage'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { AdminLoginPage } from '../pages/AdminLoginPage'

describe('admin Sprint 2 authentication', () => {
  it('shows validation feedback for required Admin login fields', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(screen.getAllByText('This field is required.')).toHaveLength(2)
  })

  it('logs in a predefined Admin and redirects to the Admin dashboard shell', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <MemoryRouter initialEntries={[routePaths.adminLogin]}>
        <Routes>
          <Route path={routePaths.adminLogin} element={<AdminLoginPage />} />
          <Route path={routePaths.adminDashboard} element={<div>Admin dashboard target</div>} />
          <Route path={routePaths.unauthorized} element={<div>Unauthorized target</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/admin email address/i), 'admin@dcs.ruh.ac.lk')
    await user.type(screen.getByLabelText(/security password/i), 'Password@123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText('Admin dashboard target')).toBeInTheDocument()
  })

  it('redirects direct Admin create-password access without verified reset context', () => {
    authStorage.clearPasswordResetContext()

    renderWithProviders(
      <MemoryRouter initialEntries={[routePaths.adminCreatePassword]}>
        <Routes>
          <Route
            path={routePaths.adminCreatePassword}
            element={
              <RequireResetContextRoute
                accountType="ADMIN"
                redirectTo={routePaths.adminForgotPassword}
                requireVerified
              >
                <div>Create password target</div>
              </RequireResetContextRoute>
            }
          />
          <Route path={routePaths.adminForgotPassword} element={<div>Admin forgot target</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Admin forgot target')).toBeInTheDocument()
  })
})
