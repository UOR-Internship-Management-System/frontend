import { useState } from 'react'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
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
      <p className="form-helper">
        Use at least 8 characters with uppercase, lowercase, number, and special character.
      </p>
      <FormField error={errors.newPassword} htmlFor="admin-new-password" label="New Password">
        <TextInput
          autoComplete="new-password"
          id="admin-new-password"
          onChange={(event) =>
            setValues((current) => ({ ...current, newPassword: event.target.value }))
          }
          type="password"
          value={values.newPassword}
        />
      </FormField>
      <FormField
        error={errors.confirmPassword}
        htmlFor="admin-confirm-password"
        label="Confirm New Password"
      >
        <TextInput
          autoComplete="new-password"
          id="admin-confirm-password"
          onChange={(event) =>
            setValues((current) => ({ ...current, confirmPassword: event.target.value }))
          }
          type="password"
          value={values.confirmPassword}
        />
      </FormField>
      <Button isLoading={isSubmitting} type="submit">
        Create Password
      </Button>
    </form>
  )
}
