import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
import { LocalTestCredentialsHint } from '../../../shared/auth/LocalTestCredentialsHint'
import { AuthSplitShell } from '../../../shared/components/layout/AuthShell'
import { useAuth } from '../../../shared/hooks/useAuth'
import { StudentLoginForm } from '../components/StudentLoginForm'
import { useStudentLogin } from '../hooks/useStudentLogin'
import type { LoginFormValues } from '../schemas/studentAuthSchemas'

export function StudentLoginPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const login = useStudentLogin()
  const [message, setMessage] = useState<string>()

  async function handleSubmit(values: LoginFormValues) {
    try {
      const response = await login.mutateAsync(values)
      const currentUser = await auth.signInWithToken(response)
      if (!currentUser.roles.includes('STUDENT')) {
        authStorage.clearToken()
        navigate(routePaths.unauthorized)
        return
      }

      navigate(routePaths.studentDashboard)
    } catch (error) {
      authStorage.clearToken()
      setMessage(mapApiError(error).message)
    }
  }

  return (
    <AuthSplitShell
      title={
        <>
          Advance your career,
          <br />
          <span>student.</span>
        </>
      }
    >
      <section className="auth-form-card">
        <h1>Login</h1>
        {message ? (
          <div className="inline-alert" role="alert">
            {message}
          </div>
        ) : null}
        <LocalTestCredentialsHint role="STUDENT" />
        <StudentLoginForm isSubmitting={login.isPending} onSubmit={handleSubmit} />
        <p className="auth-secondary-link">
          New student? <Link to={routePaths.studentSignUp}>Student Registration</Link>
        </p>
      </section>
    </AuthSplitShell>
  )
}
