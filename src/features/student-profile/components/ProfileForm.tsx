import { useEffect, useMemo, useRef, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
import { Button } from '../../../shared/components/ui/Button'
import { useUpdateStudentProfile } from '../hooks/useUpdateStudentProfile'
import { mapStudentProfileToForm } from '../mappers/studentProfileMapper'
import { studentProfileFormSchema } from '../schemas/studentProfileSchemas'
import type {
  StudentProfile,
  StudentProfileFormField,
  StudentProfileFormValues,
} from '../types/studentProfileTypes'

type ProfileFormProps = {
  profile: StudentProfile
  onReload: () => Promise<StudentProfile | undefined>
}

type ProfileFieldErrors = Partial<Record<StudentProfileFormField, string>>

const editableFields = new Set<StudentProfileFormField>(['fullName', 'summary', 'phone'])

function valuesMatch(left: StudentProfileFormValues, right: StudentProfileFormValues) {
  return (
    left.fullName === right.fullName && left.summary === right.summary && left.phone === right.phone
  )
}

export function ProfileForm({ onReload, profile }: ProfileFormProps) {
  const initialValues = useMemo(() => mapStudentProfileToForm(profile), [profile])
  const [values, setValues] = useState(initialValues)
  const [baseline, setBaseline] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [conflict, setConflict] = useState(false)
  const fullNameRef = useRef<HTMLInputElement | null>(null)
  const summaryRef = useRef<HTMLTextAreaElement | null>(null)
  const phoneRef = useRef<HTMLInputElement | null>(null)
  const updateProfile = useUpdateStudentProfile()
  const { notify } = useNotifications()
  const isDirty = !valuesMatch(values, baseline)

  useEffect(() => {
    if (!isDirty) {
      setValues(initialValues)
      setBaseline(initialValues)
    }
  }, [initialValues, isDirty])

  useEffect(() => {
    if (!isDirty) {
      return undefined
    }

    const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [isDirty])

  const updateField = (field: StudentProfileFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
    setConflict(false)
  }

  const focusFirstError = (errors: ProfileFieldErrors) => {
    if (errors.fullName) fullNameRef.current?.focus()
    else if (errors.summary) summaryRef.current?.focus()
    else if (errors.phone) phoneRef.current?.focus()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)
    setConflict(false)

    const parsed = studentProfileFormSchema.safeParse(values)
    if (!parsed.success) {
      const errors: ProfileFieldErrors = {}
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (typeof field === 'string' && editableFields.has(field as StudentProfileFormField)) {
          errors[field as StudentProfileFormField] = issue.message
        }
      })
      setFieldErrors(errors)
      window.requestAnimationFrame(() => focusFirstError(errors))
      return
    }

    try {
      const savedProfile = await updateProfile.mutateAsync(parsed.data)
      const committedValues = mapStudentProfileToForm(savedProfile)
      setValues(committedValues)
      setBaseline(committedValues)
      notify({
        tone: 'success',
        title: 'Profile saved',
        message: 'Your committed profile details are up to date.',
      })
    } catch (error) {
      const mapped = mapApiError(error, 'protected')
      const errors: ProfileFieldErrors = {}
      mapped.fieldErrors.forEach((fieldError) => {
        if (editableFields.has(fieldError.field as StudentProfileFormField)) {
          errors[fieldError.field as StudentProfileFormField] = fieldError.message
        }
      })
      setFieldErrors(errors)
      setFormError(mapped.message)
      setConflict(mapped.status === 409 || mapped.status === 412)
      window.requestAnimationFrame(() => focusFirstError(errors))
    }
  }

  const handleReload = async () => {
    const latestProfile = await onReload()
    if (latestProfile) {
      const latestValues = mapStudentProfileToForm(latestProfile)
      setValues(latestValues)
      setBaseline(latestValues)
      setFieldErrors({})
    }
    setFormError(null)
    setConflict(false)
  }

  return (
    <section className="section-card profile-form-card" aria-labelledby="profile-details-title">
      <div className="profile-section-heading">
        <div>
          <h2 id="profile-details-title">Profile details</h2>
          <p>Update the information used in your Student profile.</p>
        </div>
        {isDirty ? <span className="profile-unsaved-indicator">Unsaved changes</span> : null}
      </div>

      <form className="profile-form" noValidate onSubmit={handleSubmit}>
        {formError ? (
          <div className="inline-alert profile-form-alert" role="alert">
            <p>{formError}</p>
            {conflict ? (
              <Button onClick={() => void handleReload()} variant="secondary">
                Reload latest profile
              </Button>
            ) : null}
          </div>
        ) : null}

        <FormField
          error={fieldErrors.fullName}
          errorId="profile-full-name-error"
          htmlFor="profile-full-name"
          label="Full Name"
        >
          <TextInput
            aria-describedby={fieldErrors.fullName ? 'profile-full-name-error' : undefined}
            aria-invalid={Boolean(fieldErrors.fullName)}
            autoComplete="name"
            id="profile-full-name"
            onChange={(event) => updateField('fullName', event.target.value)}
            ref={fullNameRef}
            value={values.fullName}
          />
        </FormField>

        <FormField
          error={fieldErrors.summary}
          errorId="profile-summary-error"
          htmlFor="profile-summary"
          label="Professional Summary"
        >
          <textarea
            aria-describedby={fieldErrors.summary ? 'profile-summary-error' : undefined}
            aria-invalid={Boolean(fieldErrors.summary)}
            className="input profile-summary-input"
            id="profile-summary"
            onChange={(event) => updateField('summary', event.target.value)}
            ref={summaryRef}
            rows={6}
            value={values.summary}
          />
        </FormField>

        <FormField
          error={fieldErrors.phone}
          errorId="profile-phone-error"
          htmlFor="profile-phone"
          label="Phone"
        >
          <TextInput
            aria-describedby={fieldErrors.phone ? 'profile-phone-error' : undefined}
            aria-invalid={Boolean(fieldErrors.phone)}
            autoComplete="tel"
            id="profile-phone"
            inputMode="tel"
            onChange={(event) => updateField('phone', event.target.value)}
            ref={phoneRef}
            value={values.phone}
          />
        </FormField>

        <div className="form-actions profile-form-actions">
          <Button disabled={!isDirty} isLoading={updateProfile.isPending} type="submit">
            Save Profile
          </Button>
        </div>
      </form>
    </section>
  )
}
