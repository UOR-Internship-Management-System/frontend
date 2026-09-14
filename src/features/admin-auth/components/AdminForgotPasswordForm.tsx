import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { TextField } from '../../../shared/components/forms/TextField'
import { Button } from '../../../shared/components/ui/Button'
import { adminForgotPasswordSchema, flattenAdminZodErrors } from '../schemas/adminAuthSchemas'

type AdminForgotPasswordFormProps = {
  isSubmitting: boolean
  onSubmit: (email: string) => void
}

export function AdminForgotPasswordForm({ isSubmitting, onSubmit }: AdminForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const result = adminForgotPasswordSchema.safeParse({ email })
        if (!result.success) {
          setError(flattenAdminZodErrors(result.error).email)
          return
        }

        setError(undefined)
        onSubmit(result.data.email)
      }}
    >
      <TextField
        autoComplete="email"
        error={error}
        id="admin-reset-email"
        label="Admin Email Address"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="e.g., admin.name@ruh.ac.lk"
        type="email"
        value={email}
      />
      <div className="form-actions auth-form-footer">
        <Button isLoading={isSubmitting} type="submit">
          Send OTP
        </Button>
        <Link className="nav-link" to={routePaths.adminLogin}>
          Back to Admin Login
        </Link>
      </div>
    </form>
  )
}
