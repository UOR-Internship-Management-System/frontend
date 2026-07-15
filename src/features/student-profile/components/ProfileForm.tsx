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
  onReload: () => Promise<StudentProfile | undefined>
  profile: StudentProfile
}

type ProfileFieldErrors = Partial<Record<StudentProfileFormField, string>>

const editableFields = new Set<StudentProfileFormField>([
  'fullName',
  'personalEmail',
  'headline',
  'summary',
  'phone',
  'location',
])

function valuesMatch(left: StudentProfileFormValues, right: StudentProfileFormValues) {
  return [...editableFields].every((field) => left[field] === right[field])
}

export function ProfileForm({ onReload, profile }: ProfileFormProps) {
  const initialValues = useMemo(() => mapStudentProfileToForm(profile), [profile])
  const [values, setValues] = useState(initialValues)
  const [baseline, setBaseline] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [conflict, setConflict] = useState(false)
  const fullNameRef = useRef<HTMLInputElement | null>(null)
  const personalEmailRef = useRef<HTMLInputElement | null>(null)
  const headlineRef = useRef<HTMLInputElement | null>(null)
  const summaryRef = useRef<HTMLTextAreaElement | null>(null)
  const phoneRef = useRef<HTMLInputElement | null>(null)
  const locationRef = useRef<HTMLInputElement | null>(null)
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
    if (!isDirty) return undefined
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
    else if (errors.personalEmail) personalEmailRef.current?.focus()
    else if (errors.headline) headlineRef.current?.focus()
    else if (errors.phone) phoneRef.current?.focus()
    else if (errors.location) locationRef.current?.focus()
    else if (errors.summary) summaryRef.current?.focus()
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
      const savedProfile = await updateProfile.mutateAsync({
        baseline,
        values: parsed.data,
        version: profile.version,
      })
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
      const unknownErrors: string[] = []
      mapped.fieldErrors.forEach((fieldError) => {
        if (editableFields.has(fieldError.field as StudentProfileFormField)) {
          errors[fieldError.field as StudentProfileFormField] = fieldError.message
        } else {
          unknownErrors.push(fieldError.message)
        }
      })
      setFieldErrors(errors)
      setFormError([mapped.message, ...unknownErrors].join(' '))
      setConflict(mapped.status === 409 || mapped.status === 412 || mapped.status === 428)
      window.requestAnimationFrame(() => focusFirstError(errors))
    }
  }

  const handleReload = async () => {
    const latestProfile = await onReload()
    if (latestProfile) {
      setBaseline(mapStudentProfileToForm(latestProfile))
      notify({
        tone: 'info',
        title: 'Latest profile loaded',
        message: 'Your unsaved entries were preserved. Review them before saving again.',
      })
    }
    setFormError(null)
    setConflict(false)
  }

  return (
    <section className="section-card profile-form-card" aria-labelledby="profile-details-title">
      <div className="profile-section-heading">
        <div>
          <h2 id="profile-details-title">Profile details</h2>
          <p>Update the professional and contact information used in your profile.</p>
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

        <div className="profile-form-grid">
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
              maxLength={150}
              onChange={(event) => updateField('fullName', event.target.value)}
              ref={fullNameRef}
              value={values.fullName}
            />
          </FormField>
          <FormField
            error={fieldErrors.personalEmail}
            errorId="profile-personal-email-error"
            htmlFor="profile-personal-email"
            label="Personal Email"
          >
            <TextInput
              aria-describedby={
                fieldErrors.personalEmail ? 'profile-personal-email-error' : undefined
              }
              aria-invalid={Boolean(fieldErrors.personalEmail)}
              autoComplete="email"
              id="profile-personal-email"
              inputMode="email"
              maxLength={254}
              onChange={(event) => updateField('personalEmail', event.target.value)}
              ref={personalEmailRef}
              type="email"
              value={values.personalEmail}
            />
          </FormField>
          <FormField
            error={fieldErrors.headline}
            errorId="profile-headline-error"
            htmlFor="profile-headline"
            label="Professional Headline"
          >
            <TextInput
              aria-describedby={fieldErrors.headline ? 'profile-headline-error' : undefined}
              aria-invalid={Boolean(fieldErrors.headline)}
              id="profile-headline"
              maxLength={200}
              onChange={(event) => updateField('headline', event.target.value)}
              ref={headlineRef}
              value={values.headline}
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
              maxLength={30}
              onChange={(event) => updateField('phone', event.target.value)}
              ref={phoneRef}
              value={values.phone}
            />
          </FormField>
          <FormField
            error={fieldErrors.location}
            errorId="profile-location-error"
            htmlFor="profile-location"
            label="Location"
          >
            <TextInput
              aria-describedby={fieldErrors.location ? 'profile-location-error' : undefined}
              aria-invalid={Boolean(fieldErrors.location)}
              autoComplete="address-level2"
              id="profile-location"
              maxLength={150}
              onChange={(event) => updateField('location', event.target.value)}
              ref={locationRef}
              value={values.location}
            />
          </FormField>
        </div>

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

        <div className="form-actions profile-form-actions">
          <Button disabled={!isDirty} isLoading={updateProfile.isPending} type="submit">
            Save Profile
          </Button>
        </div>
      </form>
    </section>
  )
}
