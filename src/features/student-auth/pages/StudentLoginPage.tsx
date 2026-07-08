import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { authStorage } from '../../../shared/auth/authStorage'
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
    <section className="card auth-card">
      <h1>Student Login</h1>
      <p>Use your university email and password to access your Student workspace.</p>
      {message ? (
        <div className="inline-alert" role="alert">
          {message}
        </div>
      ) : null}
      <StudentLoginForm isSubmitting={login.isPending} onSubmit={handleSubmit} />
      <p className="auth-secondary-link">
        New student? <Link to={routePaths.studentSignUp}>Start sign up</Link>
      </p>
    </section>
  )
}
