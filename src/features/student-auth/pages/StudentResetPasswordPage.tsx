import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { AuthCardShell } from '../../../shared/components/layout/AuthShell'
import { StudentResetPasswordForm } from '../components/StudentResetPasswordForm'
import { useCompleteStudentPasswordReset } from '../hooks/useCompleteStudentPasswordReset'
import type { PasswordFormValues } from '../schemas/studentAuthSchemas'

export function StudentResetPasswordPage() {
  const navigate = useNavigate()
  const completeReset = useCompleteStudentPasswordReset()
  const [message, setMessage] = useState<string>()
  const context = authStorage.getPasswordResetContext()

  async function handleSubmit(values: PasswordFormValues) {
    if (!context) {
      return
    }

    try {
      await completeReset.mutateAsync({ resetId: context.resetId, request: values })
      authStorage.clearPasswordResetContext()
      navigate(routePaths.studentLogin)
    } catch (error) {
      setMessage(mapApiError(error).message)
    }
  }

  return (
    <AuthCardShell
      description="Create your new Student password. You will log in separately after reset."
      icon="lock_reset"
      title="Create your new password."
    >
      {message ? (
        <div className="inline-alert" role="alert">
          {message}
        </div>
      ) : null}
      <StudentResetPasswordForm
        buttonLabel="Reset Password"
        isSubmitting={completeReset.isPending}
        onSubmit={handleSubmit}
      />
    </AuthCardShell>
  )
}
