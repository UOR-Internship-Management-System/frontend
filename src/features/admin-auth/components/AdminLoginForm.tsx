import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
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
      <FormField error={errors.email} htmlFor="admin-email" label="Admin Email Address">
        <TextInput
          autoComplete="email"
          id="admin-email"
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          placeholder="e.g., admin.name@ruh.ac.lk"
          type="email"
          value={values.email}
        />
      </FormField>
      <FormField error={errors.password} htmlFor="admin-password" label="Security Password">
        <TextInput
          autoComplete="current-password"
          id="admin-password"
          onChange={(event) =>
            setValues((current) => ({ ...current, password: event.target.value }))
          }
          placeholder="Enter your security password"
          type="password"
          value={values.password}
        />
      </FormField>
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
