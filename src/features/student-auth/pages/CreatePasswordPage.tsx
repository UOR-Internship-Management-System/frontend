import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { AuthCardShell } from '../../../shared/components/layout/AuthShell'
import { StudentCreatePasswordForm } from '../components/StudentCreatePasswordForm'
import { useCreateStudentPassword } from '../hooks/useCreateStudentPassword'
import type { PasswordFormValues } from '../schemas/studentAuthSchemas'

export function CreatePasswordPage() {
  const navigate = useNavigate()
  const createPassword = useCreateStudentPassword()
  const [message, setMessage] = useState<string>()
  const context = authStorage.getVerificationContext()

  async function handleSubmit(values: PasswordFormValues) {
    if (!context) {
      return
    }

    try {
      await createPassword.mutateAsync({ verificationId: context.verificationId, request: values })
      authStorage.clearVerificationContext()
      navigate(routePaths.studentLogin)
    } catch (error) {
      setMessage(mapApiError(error).message)
    }
  }

  return (
    <AuthCardShell icon="lock_reset" title="Create your new password.">
      {message ? (
        <div className="inline-alert" role="alert">
          {message}
        </div>
      ) : null}
      <StudentCreatePasswordForm isSubmitting={createPassword.isPending} onSubmit={handleSubmit} />
    </AuthCardShell>
  )
}
