import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { PasswordField } from '../../../shared/components/forms/PasswordField'
import { TextField } from '../../../shared/components/forms/TextField'
import { Button } from '../../../shared/components/ui/Button'
import { flattenZodErrors, loginSchema, type LoginFormValues } from '../schemas/studentAuthSchemas'

type StudentLoginFormProps = {
  isSubmitting: boolean
  onSubmit: (values: LoginFormValues) => void
}

export function StudentLoginForm({ isSubmitting, onSubmit }: StudentLoginFormProps) {
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const result = loginSchema.safeParse(values)
        if (!result.success) {
          setErrors(flattenZodErrors(result.error))
          return
        }

        setErrors({})
        onSubmit(result.data)
      }}
    >
      <TextField
        autoComplete="email"
        error={errors.email}
        id="student-login-email"
        label="University Email"
        onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
        placeholder="username@usci.ruh.ac.lk"
        type="email"
        value={values.email}
      />
      <PasswordField
        autoComplete="current-password"
        error={errors.password}
        id="student-login-password"
        label="Password"
        onChange={(event) =>
          setValues((current) => ({ ...current, password: event.target.value }))
        }
        placeholder="Enter your password"
        value={values.password}
      />
      <div className="form-actions auth-form-footer">
        <Button isLoading={isSubmitting} type="submit">
          Log In
        </Button>
        <Link className="nav-link" to={routePaths.studentForgotPassword}>
          Forgot Password?
        </Link>
      </div>
    </form>
  )
}
