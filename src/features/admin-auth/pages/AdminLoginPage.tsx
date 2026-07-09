import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { AuthSplitShell } from '../../../shared/components/layout/AuthShell'
import { useAuth } from '../../../shared/hooks/useAuth'
import { AdminLoginForm } from '../components/AdminLoginForm'
import { useAdminLogin } from '../hooks/useAdminLogin'
import type { AdminLoginFormValues } from '../schemas/adminAuthSchemas'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const login = useAdminLogin()
  const [message, setMessage] = useState<string>()

  async function handleSubmit(values: AdminLoginFormValues) {
    try {
      const response = await login.mutateAsync(values)
      const currentUser = await auth.signInWithToken(response)
      if (!currentUser.roles.includes('ADMIN')) {
        authStorage.clearToken()
        navigate(routePaths.unauthorized)
        return
      }

      navigate(routePaths.adminDashboard)
    } catch (error) {
      authStorage.clearToken()
      setMessage(mapApiError(error).message)
    }
  }

  return (
    <AuthSplitShell
      title={
        <>
          Welcome back,
          <br />
          <span className="auth-admin-headline-word">administrator.</span>
        </>
      }
    >
      <section className="auth-form-card admin-auth-card">
        <h1>Admin Login</h1>
        {message ? (
          <div className="inline-alert" role="alert">
            {message}
          </div>
        ) : null}
        <AdminLoginForm isSubmitting={login.isPending} onSubmit={handleSubmit} />
        <p className="auth-secondary-link">
          System access issue? <a href="/support.html">Contact IT Operations.</a>
        </p>
      </section>
    </AuthSplitShell>
  )
}
