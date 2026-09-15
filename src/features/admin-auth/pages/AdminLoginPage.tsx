import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { LocalTestCredentialsHint } from '../../../shared/auth/LocalTestCredentialsHint'
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
        <Link className="auth-back-link" to={routePaths.home}>
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_back
          </span>
          Back
        </Link>
        <h2 className="m3-headline-small">Admin Login</h2>
        {message ? (
          <div className="inline-alert auth-inline-alert" role="alert">
            <span className="material-symbols-outlined" aria-hidden="true">
              error
            </span>
            {message}
          </div>
        ) : null}
        <LocalTestCredentialsHint role="ADMIN" />
        <AdminLoginForm isSubmitting={login.isPending} onSubmit={handleSubmit} />
        <p className="auth-secondary-link">
          System access issue? <a href="/support.html">Contact IT Operations.</a>
        </p>
      </section>
    </AuthSplitShell>
  )
}
