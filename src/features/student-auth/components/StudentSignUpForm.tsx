import { useState } from 'react'
import { TextField } from '../../../shared/components/forms/TextField'
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

        const submitter = (event.nativeEvent as SubmitEvent).submitter
        if (submitter instanceof HTMLElement) submitter.focus({ preventScroll: true })
        setErrors({})
        onSubmit(result.data)
      }}
    >
      <TextField
        autoComplete="name"
        error={errors.fullName}
        id="student-full-name"
        label="Full Name"
        name="fullName"
        onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
        placeholder="e.g., K. Kavindu Lakshan"
        value={values.fullName}
      />
      <TextField
        autoComplete="off"
        error={errors.indexNumber}
        id="student-index-number"
        label="Index Number"
        name="indexNumber"
        onChange={(event) =>
          setValues((current) => ({ ...current, indexNumber: event.target.value }))
        }
        placeholder="e.g., SC/2022/12865"
        value={values.indexNumber}
      />
      <TextField
        autoComplete="email"
        error={errors.universityEmail}
        id="student-university-email"
        label="University Email"
        name="universityEmail"
        onChange={(event) =>
          setValues((current) => ({ ...current, universityEmail: event.target.value }))
        }
        placeholder="e.g., username@usci.ruh.ac.lk"
        type="email"
        value={values.universityEmail}
      />
      <Button isLoading={isSubmitting} type="submit">
        Send Request
      </Button>
    </form>
  )
}
