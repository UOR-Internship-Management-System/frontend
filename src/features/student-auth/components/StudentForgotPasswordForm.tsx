import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { TextField } from '../../../shared/components/forms/TextField'
import { Button } from '../../../shared/components/ui/Button'
import { flattenZodErrors, passwordResetStartSchema } from '../schemas/studentAuthSchemas'

type StudentForgotPasswordFormProps = {
  isSubmitting: boolean
  onSubmit: (email: string) => void
}

export function StudentForgotPasswordForm({
  isSubmitting,
  onSubmit,
}: StudentForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const result = passwordResetStartSchema.safeParse({ email })
        if (!result.success) {
          setError(flattenZodErrors(result.error).email)
          return
        }

        setError(undefined)
        onSubmit(result.data.email)
      }}
    >
      <TextField
        autoComplete="email"
        error={error}
        id="student-reset-email"
        label="University Email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="username@usci.ruh.ac.lk"
        type="email"
        value={email}
      />
      <div className="form-actions auth-form-footer">
        <Button isLoading={isSubmitting} type="submit">
          Send OTP
        </Button>
        <Link className="nav-link" to={routePaths.studentLogin}>
          Back to Login
        </Link>
      </div>
    </form>
  )
}
