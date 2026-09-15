import { useState } from 'react'
import { PasswordField } from '../../../shared/components/forms/PasswordField'
import { Button } from '../../../shared/components/ui/Button'
import {
  flattenZodErrors,
  passwordSchema,
  type PasswordFormValues,
} from '../schemas/studentAuthSchemas'

type StudentCreatePasswordFormProps = {
  buttonLabel?: string
  isSubmitting: boolean
  onSubmit: (values: PasswordFormValues) => void
}

export function StudentCreatePasswordForm({
  buttonLabel = 'Create Password',
  isSubmitting,
  onSubmit,
}: StudentCreatePasswordFormProps) {
  const [values, setValues] = useState<PasswordFormValues>({
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
        const result = passwordSchema.safeParse(values)
        if (!result.success) {
          setErrors(flattenZodErrors(result.error))
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
        id="student-new-password"
        label="New Password"
        onChange={(event) =>
          setValues((current) => ({ ...current, newPassword: event.target.value }))
        }
        value={values.newPassword}
      />
      <PasswordField
        autoComplete="new-password"
        error={errors.confirmPassword}
        id="student-confirm-password"
        label="Confirm New Password"
        onChange={(event) =>
          setValues((current) => ({ ...current, confirmPassword: event.target.value }))
        }
        value={values.confirmPassword}
      />
      <Button isLoading={isSubmitting} type="submit">
        {buttonLabel}
      </Button>
    </form>
  )
}
