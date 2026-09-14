import { useEffect, useMemo, useRef, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { TextArea } from '../../../shared/components/forms/TextArea'
import { TextField } from '../../../shared/components/forms/TextField'
import { Button } from '../../../shared/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card'
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
    <Card aria-labelledby="profile-details-title" variant="outlined">
      <CardHeader className="s5-section-heading">
        <div>
          <CardTitle id="profile-details-title">Profile details</CardTitle>
          <p>Update the professional and contact information used in your profile.</p>
        </div>
        {isDirty ? <span className="profile-unsaved-indicator">Unsaved changes</span> : null}
      </CardHeader>

      <CardContent>
        <form className="profile-form" noValidate onSubmit={handleSubmit}>
          {formError ? (
            <div className="inline-alert profile-form-alert" role="alert">
              <p>{formError}</p>
              {conflict ? (
                <Button onClick={() => void handleReload()} variant="tonal">
                  Reload latest profile
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="profile-form-grid">
            <TextField
              error={fieldErrors.fullName}
              id="profile-full-name"
              label="Full name"
              onChange={(event) => updateField('fullName', event.target.value)}
              autoComplete="name"
              maxLength={150}
              ref={fullNameRef}
              value={values.fullName}
            />
            <TextField
              error={fieldErrors.personalEmail}
              id="profile-personal-email"
              label="Personal email address"
              onChange={(event) => updateField('personalEmail', event.target.value)}
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              ref={personalEmailRef}
              type="email"
              value={values.personalEmail}
            />
            <TextField
              error={fieldErrors.headline}
              id="profile-headline"
              label="Professional headline"
              onChange={(event) => updateField('headline', event.target.value)}
              maxLength={200}
              ref={headlineRef}
              value={values.headline}
            />
            <TextField
              error={fieldErrors.phone}
              id="profile-phone"
              label="Phone number"
              onChange={(event) => updateField('phone', event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              maxLength={30}
              ref={phoneRef}
              value={values.phone}
            />
            <TextField
              error={fieldErrors.location}
              id="profile-location"
              label="City and state"
              onChange={(event) => updateField('location', event.target.value)}
              autoComplete="address-level2"
              maxLength={150}
              ref={locationRef}
              value={values.location}
            />
          </div>

          <TextArea
            error={fieldErrors.summary}
            id="profile-summary"
            label="Profile summary or objective"
            onChange={(event) => updateField('summary', event.target.value)}
            ref={summaryRef}
            rows={6}
            value={values.summary}
          />

          <div className="form-actions profile-form-actions">
            <Button disabled={!isDirty} isLoading={updateProfile.isPending} type="submit">
              Save profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
