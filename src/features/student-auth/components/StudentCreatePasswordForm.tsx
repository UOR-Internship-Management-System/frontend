import { useState } from 'react'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
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
      <p className="form-helper">
        Use at least 8 characters with uppercase, lowercase, number, and special character.
      </p>
      <FormField error={errors.newPassword} htmlFor="student-new-password" label="New Password">
        <TextInput
          autoComplete="new-password"
          id="student-new-password"
          onChange={(event) =>
            setValues((current) => ({ ...current, newPassword: event.target.value }))
          }
          type="password"
          value={values.newPassword}
        />
      </FormField>
      <FormField
        error={errors.confirmPassword}
        htmlFor="student-confirm-password"
        label="Confirm New Password"
      >
        <TextInput
          autoComplete="new-password"
          id="student-confirm-password"
          onChange={(event) =>
            setValues((current) => ({ ...current, confirmPassword: event.target.value }))
          }
          type="password"
          value={values.confirmPassword}
        />
      </FormField>
      <Button isLoading={isSubmitting} type="submit">
        {buttonLabel}
      </Button>
    </form>
  )
}
