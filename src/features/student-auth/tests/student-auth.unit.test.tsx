import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { routePaths } from '../../../app/config/routePaths'
import { RequireResetContextRoute } from '../../../app/router/routeGuards'
import { authStorage } from '../../../shared/auth/authStorage'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { StudentLoginPage } from '../pages/StudentLoginPage'
import { StudentSignUpPage } from '../pages/StudentSignUpPage'

describe('student Sprint 2 authentication', () => {
  it('shows validation feedback for required sign-up fields', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <MemoryRouter>
        <StudentSignUpPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(screen.getAllByText('This field is required.')).toHaveLength(3)
  })

  it('logs in a Student and redirects to the Student dashboard shell', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <MemoryRouter initialEntries={[routePaths.studentLogin]}>
        <Routes>
          <Route path={routePaths.studentLogin} element={<StudentLoginPage />} />
          <Route path={routePaths.studentDashboard} element={<div>Student dashboard target</div>} />
          <Route path={routePaths.unauthorized} element={<div>Unauthorized target</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/university email/i), 'student@dcs.ruh.ac.lk')
    await user.type(screen.getByLabelText(/^password$/i), 'Password@123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText('Student dashboard target')).toBeInTheDocument()
  })

  it('redirects direct Student reset password access without reset context', () => {
    authStorage.clearPasswordResetContext()

    renderWithProviders(
      <MemoryRouter initialEntries={[routePaths.studentResetCreatePassword]}>
        <Routes>
          <Route
            path={routePaths.studentResetCreatePassword}
            element={
              <RequireResetContextRoute
                accountType="STUDENT"
                redirectTo={routePaths.studentForgotPassword}
                requireVerified
              >
                <div>Reset password target</div>
              </RequireResetContextRoute>
            }
          />
          <Route path={routePaths.studentForgotPassword} element={<div>Forgot target</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Forgot target')).toBeInTheDocument()
  })
})
