import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { routePaths } from '../../../app/config/routePaths'
import { RequireResetContextRoute } from '../../../app/router/routeGuards'
import { authStorage } from '../../../shared/auth/authStorage'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { OtpInput } from '../components/OtpInput'
import { VerificationStatusDialog } from '../components/VerificationStatusDialog'
import { StudentLoginPage } from '../pages/StudentLoginPage'
import { StudentSignUpPage } from '../pages/StudentSignUpPage'

function ControlledOtpInput({ onValue }: { onValue?: (value: string) => void }) {
  const [value, setValue] = useState('')

  return (
    <>
      <label htmlFor="otp-test">Six-digit OTP</label>
      <OtpInput
        id="otp-test"
        onChange={(nextValue) => {
          setValue(nextValue)
          onValue?.(nextValue)
        }}
        value={value}
      />
    </>
  )
}

describe('student Sprint 2 authentication', () => {
  it('shows validation feedback for required sign-up fields', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <MemoryRouter>
        <StudentSignUpPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /send request/i }))

    expect(screen.getAllByText('This field is required.')).toHaveLength(3)
  })

  it('renders finalized Student registration heading and panel copy', () => {
    renderWithProviders(
      <MemoryRouter>
        <StudentSignUpPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /launch your placement profile/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /student registration/i })).toBeInTheDocument()
  })

  it('composes six-box OTP input through paste and backspace', async () => {
    const user = userEvent.setup()
    let latestValue = ''

    render(<ControlledOtpInput onValue={(value) => (latestValue = value)} />)

    await user.click(screen.getByLabelText('Six-digit OTP'))
    await user.paste('123456')

    expect(screen.getAllByRole('textbox')).toHaveLength(6)
    expect(latestValue).toBe('123456')

    await user.keyboard('{Backspace}')

    expect(latestValue).toBe('12345')
  })

  it('renders verification modal status states accessibly', () => {
    const { rerender } = renderWithProviders(
      <VerificationStatusDialog isOpen onClose={() => undefined} status="loading" />,
    )

    expect(screen.getByRole('dialog', { name: /your details are verifying/i })).toBeInTheDocument()

    rerender(<VerificationStatusDialog isOpen onClose={() => undefined} status="success" />)
    expect(screen.getByRole('dialog', { name: /your details are verified/i })).toBeInTheDocument()

    rerender(<VerificationStatusDialog isOpen onClose={() => undefined} status="failure" />)
    expect(screen.getByRole('button', { name: /check details/i })).toBeInTheDocument()
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
