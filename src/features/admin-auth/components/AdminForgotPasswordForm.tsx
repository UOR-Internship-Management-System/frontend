import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
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
      <FormField error={error} htmlFor="admin-reset-email" label="Admin Email Address">
        <TextInput
          autoComplete="email"
          id="admin-reset-email"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
      </FormField>
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
