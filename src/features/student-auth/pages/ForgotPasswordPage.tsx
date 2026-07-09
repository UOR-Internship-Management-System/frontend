import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { AuthCardShell } from '../../../shared/components/layout/AuthShell'
import { StudentForgotPasswordForm } from '../components/StudentForgotPasswordForm'
import { useStartStudentPasswordReset } from '../hooks/useStartStudentPasswordReset'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const startReset = useStartStudentPasswordReset()
  const [message, setMessage] = useState<string>()

  return (
    <AuthCardShell
      description="Provide your institutional email address to request a One Time Password to reset your current Password."
      icon="lock_reset"
      title="Forgot Password?"
    >
      {message ? (
        <div className="inline-alert" role="status">
          {message}
        </div>
      ) : null}
      <StudentForgotPasswordForm
        isSubmitting={startReset.isPending}
        onSubmit={async (email) => {
          try {
            const response = await startReset.mutateAsync(email)
            setMessage(response.message)
            if (response.resetId) {
              authStorage.setPasswordResetContext({
                resetId: response.resetId,
                accountType: 'STUDENT',
                email,
                expiresAt: response.expiresAt,
              })
              navigate(routePaths.studentResetVerifyOtp)
            }
          } catch (error) {
            setMessage(mapApiError(error).message)
          }
        }}
      />
    </AuthCardShell>
  )
}
