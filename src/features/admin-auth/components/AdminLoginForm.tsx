import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { PasswordField } from '../../../shared/components/forms/PasswordField'
import { TextField } from '../../../shared/components/forms/TextField'
import { Button } from '../../../shared/components/ui/Button'
import {
  adminLoginSchema,
  flattenAdminZodErrors,
  type AdminLoginFormValues,
} from '../schemas/adminAuthSchemas'

type AdminLoginFormProps = {
  isSubmitting: boolean
  onSubmit: (values: AdminLoginFormValues) => void
}

export function AdminLoginForm({ isSubmitting, onSubmit }: AdminLoginFormProps) {
  const [values, setValues] = useState<AdminLoginFormValues>({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const result = adminLoginSchema.safeParse(values)
        if (!result.success) {
          setErrors(flattenAdminZodErrors(result.error))
          return
        }

        setErrors({})
        onSubmit(result.data)
      }}
    >
      <TextField
        autoComplete="email"
        error={errors.email}
        id="admin-email"
        label="Admin Email Address"
        onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
        placeholder="e.g., admin.name@ruh.ac.lk"
        type="email"
        value={values.email}
      />
      <PasswordField
        autoComplete="current-password"
        error={errors.password}
        id="admin-password"
        label="Security Password"
        onChange={(event) =>
          setValues((current) => ({ ...current, password: event.target.value }))
        }
        placeholder="Enter your security password"
        value={values.password}
      />
      <div className="form-actions auth-form-footer">
        <Button isLoading={isSubmitting} type="submit">
          Log In
        </Button>
        <Link className="nav-link" to={routePaths.adminForgotPassword}>
          Forgot Password?
        </Link>
      </div>
    </form>
  )
}
