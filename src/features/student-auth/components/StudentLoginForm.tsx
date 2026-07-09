import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
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
      <FormField error={errors.email} htmlFor="student-login-email" label="University Email">
        <TextInput
          autoComplete="email"
          id="student-login-email"
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          placeholder="username@usci.ruh.ac.lk"
          type="email"
          value={values.email}
        />
      </FormField>
      <FormField error={errors.password} htmlFor="student-login-password" label="Password">
        <TextInput
          autoComplete="current-password"
          id="student-login-password"
          onChange={(event) =>
            setValues((current) => ({ ...current, password: event.target.value }))
          }
          placeholder="Enter your password"
          type="password"
          value={values.password}
        />
      </FormField>
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
