import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { AuthCardShell } from '../../../shared/components/layout/AuthShell'
import { AdminCreatePasswordForm } from '../components/AdminCreatePasswordForm'
import { useCompleteAdminPasswordReset } from '../hooks/useCompleteAdminPasswordReset'
import type { AdminCreatePasswordFormValues } from '../schemas/adminAuthSchemas'

export function AdminCreatePasswordPage() {
  const navigate = useNavigate()
  const completeReset = useCompleteAdminPasswordReset()
  const [message, setMessage] = useState<string>()
  const context = authStorage.getPasswordResetContext()

  async function handleSubmit(values: AdminCreatePasswordFormValues) {
    if (!context) {
      return
    }

    try {
      await completeReset.mutateAsync({ resetId: context.resetId, request: values })
      authStorage.clearPasswordResetContext()
      navigate(routePaths.adminLogin)
    } catch (error) {
      setMessage(mapApiError(error).message)
    }
  }

  return (
    <AuthCardShell
      className="admin-auth-card"
      description="Create your new Admin password. You will log in separately after reset."
      icon="lock_reset"
      title="Create your new password"
    >
      {message ? (
        <div className="inline-alert" role="alert">
          {message}
        </div>
      ) : null}
      <AdminCreatePasswordForm isSubmitting={completeReset.isPending} onSubmit={handleSubmit} />
    </AuthCardShell>
  )
}
