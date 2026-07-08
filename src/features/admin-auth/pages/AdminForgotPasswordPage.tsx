import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { AdminForgotPasswordForm } from '../components/AdminForgotPasswordForm'
import { useStartAdminPasswordReset } from '../hooks/useStartAdminPasswordReset'

export function AdminForgotPasswordPage() {
  const navigate = useNavigate()
  const startReset = useStartAdminPasswordReset()
  const [message, setMessage] = useState<string>()

  return (
    <section className="card auth-card admin-auth-card">
      <h1>Forgot Password?</h1>
      <p>Provide your administrator email address to request a One-Time Password.</p>
      {message ? (
        <div className="inline-alert" role="status">
          {message}
        </div>
      ) : null}
      <AdminForgotPasswordForm
        isSubmitting={startReset.isPending}
        onSubmit={async (email) => {
          try {
            const response = await startReset.mutateAsync(email)
            setMessage(response.message)
            if (response.resetId) {
              authStorage.setPasswordResetContext({
                resetId: response.resetId,
                accountType: 'ADMIN',
                email,
                expiresAt: response.expiresAt,
              })
              navigate(routePaths.adminVerifyResetOtp)
            }
          } catch (error) {
            setMessage(mapApiError(error).message)
          }
        }}
      />
    </section>
  )
}
