import { useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { M3SelectField } from '../../../shared/components/forms/M3SelectField'
import { TextField } from '../../../shared/components/forms/TextField'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { eligibleStudentFormSchema } from '../schemas/eligibleStudentSchemas'
import type {
  EligibleStudent,
  EligibleStudentFormValues,
  EligibleStudentRequest,
} from '../types/eligibleStudentTypes'

type Field = keyof EligibleStudentFormValues
type FieldErrors = Partial<Record<Field, string>>

const emptyForm: EligibleStudentFormValues = {
  indexNumber: '',
  universityEmail: '',
  fullName: '',
  academicLevel: '',
}

function toFormValues(student: EligibleStudent): EligibleStudentFormValues {
  return {
    indexNumber: student.indexNumber,
    universityEmail: student.universityEmail,
    fullName: student.fullName,
    academicLevel: String(student.academicLevel) as '3' | '4',
  }
}

export function EligibleStudentForm({
  item,
  onCancel,
  onSubmit,
}: {
  item?: EligibleStudent
  onCancel: () => void
  onSubmit: (values: EligibleStudentRequest) => Promise<void>
}) {
  const [values, setValues] = useState<EligibleStudentFormValues>(
    item ? toFormValues(item) : emptyForm,
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [isPending, setIsPending] = useState(false)
  const indexRef = useRef<HTMLInputElement | null>(null)

  const update = <F extends Field>(field: F, value: EligibleStudentFormValues[F]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(undefined)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setFormError(undefined)
    const parsed = eligibleStudentFormSchema.safeParse(values)
    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && !nextErrors[field as Field]) {
          nextErrors[field as Field] = issue.message
        }
      }
      setErrors(nextErrors)
      if (nextErrors.indexNumber) window.requestAnimationFrame(() => indexRef.current?.focus())
      return
    }

    setIsPending(true)
    try {
      await onSubmit({
        indexNumber: parsed.data.indexNumber.toUpperCase(),
        universityEmail: parsed.data.universityEmail.toLowerCase(),
        fullName: parsed.data.fullName,
        academicLevel: Number(parsed.data.academicLevel) as 3 | 4,
      })
    } catch (reason) {
      const mapped = mapApiError(reason, 'protected')
      const nextErrors: FieldErrors = {}
      for (const fieldError of mapped.fieldErrors) {
        if (fieldError.field in values) {
          nextErrors[fieldError.field as Field] = fieldError.message
        }
      }
      setErrors(nextErrors)
      setFormError(mapped.message)
    } finally {
      setIsPending(false)
    }
  }

  const describedBy = (field: Field) =>
    errors[field] ? `eligible-student-${field}-error` : undefined

  return (
    <Modal
      closeDisabled={isPending}
      onClose={onCancel}
      title={item ? 'Edit Eligible Student' : 'Add Eligible Student'}
    >
      <form className="es-form" noValidate onSubmit={submit}>
        {formError ? (
          <div className="inline-alert" role="alert">
            {formError}
          </div>
        ) : null}

        <TextField
          error={errors.indexNumber}
          id="eligible-student-index"
          label="Index Number"
          disabled={isPending}
          maxLength={32}
          onChange={(event) => update('indexNumber', event.target.value)}
          placeholder="e.g., CS/2022/00123"
          ref={indexRef}
          value={values.indexNumber}
          aria-describedby={describedBy('indexNumber')}
        />

        <TextField
          error={errors.universityEmail}
          id="eligible-student-email"
          label="University Email"
          disabled={isPending}
          maxLength={254}
          onChange={(event) => update('universityEmail', event.target.value)}
          placeholder="e.g., student@dcs.ruh.ac.lk"
          type="email"
          value={values.universityEmail}
          aria-describedby={describedBy('universityEmail')}
        />

        <TextField
          error={errors.fullName}
          id="eligible-student-name"
          label="Full Name"
          disabled={isPending}
          maxLength={160}
          onChange={(event) => update('fullName', event.target.value)}
          placeholder="e.g., Nimal Perera"
          value={values.fullName}
          aria-describedby={describedBy('fullName')}
        />

        <M3SelectField
          id="eligible-student-level"
          label="Academic Level"
          disabled={isPending}
          onChange={(value) =>
            update('academicLevel', value as EligibleStudentFormValues['academicLevel'])
          }
          value={values.academicLevel}
          options={[
            { value: '', label: 'Select level' },
            { value: '3', label: 'Level 3' },
            { value: '4', label: 'Level 4' },
          ]}
        />

        <div className="modal-actions">
          <Button disabled={isPending} onClick={onCancel} variant="outlined">
            Cancel
          </Button>
          <Button isLoading={isPending} type="submit">
            {item ? 'Save Changes' : 'Add Student'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
