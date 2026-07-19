import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
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

    expect(
      screen.getByRole('heading', { name: /launch your placement profile/i }),
    ).toBeInTheDocument()
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

  it('renders verification states through the shared accessible modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const appRoot = document.createElement('div')
    appRoot.id = 'root'
    document.body.appendChild(appRoot)

    const { rerender, unmount } = renderWithProviders(
      <VerificationStatusDialog isOpen onClose={onClose} status="loading" />,
    )

    const loadingDialog = screen.getByRole('dialog', { name: /your details are verifying/i })
    expect(loadingDialog.parentElement?.parentElement).toBe(document.body)
    expect(
      screen.queryByRole('button', { name: /close your details are verifying/i }),
    ).not.toBeInTheDocument()
    expect(appRoot).toHaveAttribute('aria-hidden', 'true')
    expect(appRoot).toHaveAttribute('inert')

    rerender(<VerificationStatusDialog isOpen onClose={onClose} status="success" />)
    expect(screen.getByRole('dialog', { name: /your details are verified/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /close your details are verified/i }),
    ).not.toBeInTheDocument()

    rerender(
      <VerificationStatusDialog
        isOpen
        message="The supplied student record did not match."
        onClose={onClose}
        status="failure"
      />,
    )
    expect(screen.getByText('The supplied student record did not match.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close Verification issue' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /check details/i }))
    expect(onClose).toHaveBeenCalledOnce()

    unmount()
    expect(appRoot).not.toHaveAttribute('aria-hidden')
    expect(appRoot).not.toHaveAttribute('inert')
    appRoot.remove()
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

  it('rejects incorrect local Student test credentials safely', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <MemoryRouter>
        <StudentLoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/university email/i), 'student@dcs.ruh.ac.lk')
    await user.type(screen.getByLabelText(/^password$/i), 'WrongPassword@123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The email or password is incorrect.',
    )
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
