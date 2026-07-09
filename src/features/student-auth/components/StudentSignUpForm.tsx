import { useState } from 'react'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
import { Button } from '../../../shared/components/ui/Button'
import {
  flattenZodErrors,
  studentSignUpSchema,
  type StudentSignUpFormValues,
} from '../schemas/studentAuthSchemas'

type StudentSignUpFormProps = {
  isSubmitting: boolean
  onSubmit: (values: StudentSignUpFormValues) => void
}

const initialValues: StudentSignUpFormValues = {
  fullName: '',
  indexNumber: '',
  universityEmail: '',
}

export function StudentSignUpForm({ isSubmitting, onSubmit }: StudentSignUpFormProps) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const result = studentSignUpSchema.safeParse(values)
        if (!result.success) {
          setErrors(flattenZodErrors(result.error))
          return
        }

        setErrors({})
        onSubmit(result.data)
      }}
    >
      <FormField error={errors.fullName} htmlFor="student-full-name" label="Full Name">
        <TextInput
          autoComplete="name"
          id="student-full-name"
          name="fullName"
          onChange={(event) =>
            setValues((current) => ({ ...current, fullName: event.target.value }))
          }
          placeholder="e.g., K. Kavindu Lakshan"
          value={values.fullName}
        />
      </FormField>
      <FormField error={errors.indexNumber} htmlFor="student-index-number" label="Index Number">
        <TextInput
          autoComplete="off"
          id="student-index-number"
          name="indexNumber"
          onChange={(event) =>
            setValues((current) => ({ ...current, indexNumber: event.target.value }))
          }
          placeholder="e.g., SC/2022/12865"
          value={values.indexNumber}
        />
      </FormField>
      <FormField
        error={errors.universityEmail}
        htmlFor="student-university-email"
        label="University Email"
      >
        <TextInput
          autoComplete="email"
          id="student-university-email"
          name="universityEmail"
          onChange={(event) =>
            setValues((current) => ({ ...current, universityEmail: event.target.value }))
          }
          placeholder="e.g., username@usci.ruh.ac.lk"
          type="email"
          value={values.universityEmail}
        />
      </FormField>
      <Button isLoading={isSubmitting} type="submit">
        Send Request
      </Button>
    </form>
  )
}
