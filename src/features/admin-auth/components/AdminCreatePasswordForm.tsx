import { useState } from 'react'
import { PasswordField } from '../../../shared/components/forms/PasswordField'
import { Button } from '../../../shared/components/ui/Button'
import {
  adminCreatePasswordSchema,
  flattenAdminZodErrors,
  type AdminCreatePasswordFormValues,
} from '../schemas/adminAuthSchemas'

type AdminCreatePasswordFormProps = {
  isSubmitting: boolean
  onSubmit: (values: AdminCreatePasswordFormValues) => void
}

export function AdminCreatePasswordForm({ isSubmitting, onSubmit }: AdminCreatePasswordFormProps) {
  const [values, setValues] = useState<AdminCreatePasswordFormValues>({
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const result = adminCreatePasswordSchema.safeParse(values)
        if (!result.success) {
          setErrors(flattenAdminZodErrors(result.error))
          return
        }

        setErrors({})
        onSubmit(result.data)
      }}
    >
      <p className="form-helper m3-body-small">
        Use at least 8 characters with uppercase, lowercase, number, and special character.
      </p>
      <PasswordField
        autoComplete="new-password"
        error={errors.newPassword}
        id="admin-new-password"
        label="New Password"
        onChange={(event) =>
          setValues((current) => ({ ...current, newPassword: event.target.value }))
        }
        value={values.newPassword}
      />
      <PasswordField
        autoComplete="new-password"
        error={errors.confirmPassword}
        id="admin-confirm-password"
        label="Confirm New Password"
        onChange={(event) =>
          setValues((current) => ({ ...current, confirmPassword: event.target.value }))
        }
        value={values.confirmPassword}
      />
      <Button isLoading={isSubmitting} type="submit">
        Create Password
      </Button>
    </form>
  )
}
