import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { Checkbox } from '../../../shared/components/forms/Checkbox'
import { TextField } from '../../../shared/components/forms/TextField'
import { mapEducationRequest } from '../mappers/profileEntryMappers'
import { educationFormSchema } from '../schemas/profileEntrySchemas'
import type { Education, EducationRequest } from '../types/profileEntryTypes'
import { ProfileEditorActions } from './ProfileEditorActions'

const toMonthInput = (value: string | null) => (value ? value.slice(0, 7) : '')

export function EducationEditor({
  isPending,
  item,
  onCancel,
  onDirtyChange,
  onSubmit,
}: {
  isPending: boolean
  item?: Education
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
  onSubmit: (values: EducationRequest) => Promise<void>
}) {
  const [values, setValues] = useState({
    degree: item?.degree ?? '',
    institution: item?.institution ?? '',
    institutionUrl: item?.institutionUrl ?? '',
    location: item?.location ?? '',
    startDate: toMonthInput(item?.startDate ?? null),
    endDate: toMonthInput(item?.endDate ?? null),
    current: item?.current ?? false,
    resultNote: item?.resultNote ?? '',
    cvInclude: item?.cvInclude ?? true,
  })
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    const parsed = educationFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the entered details.')
      return
    }
    try {
      await onSubmit(mapEducationRequest(parsed.data))
    } catch (reason) {
      setError(mapApiError(reason, 'protected').message)
    }
  }
  return (
    <form
      className="profile-editor-form"
      noValidate
      onChange={() => onDirtyChange?.(true)}
      onSubmit={submit}
    >
      {error ? (
        <div className="inline-alert" role="alert">
          {error}
        </div>
      ) : null}
      <TextField
        id="education-degree"
        label="Degree, field of study, or exchange semester"
        maxLength={200}
        onChange={(event) => setValues({ ...values, degree: event.target.value })}
        placeholder="Enter degree, field of study, or exchange semester"
        required
        value={values.degree}
      />
      <div className="profile-editor-grid">
        <TextField
          id="education-institution"
          label="School or university"
          maxLength={200}
          onChange={(event) => setValues({ ...values, institution: event.target.value })}
          placeholder="Enter school / university"
          required
          value={values.institution}
        />
        <TextField
          id="education-institution-url"
          label="Institution link (optional)"
          onChange={(event) => setValues({ ...values, institutionUrl: event.target.value })}
          placeholder="https://"
          type="url"
          value={values.institutionUrl}
        />
      </div>
      <div className="profile-editor-grid">
        <TextField
          id="education-start"
          label="Start date"
          onChange={(event) => setValues({ ...values, startDate: event.target.value })}
          placeholder=" "
          type="month"
          value={values.startDate}
        />
        <TextField
          disabled={values.current}
          id="education-end"
          label="End date"
          onChange={(event) => setValues({ ...values, endDate: event.target.value })}
          placeholder=" "
          type="month"
          value={values.current ? '' : values.endDate}
        />
        <TextField
          id="education-location"
          label="Location"
          maxLength={150}
          onChange={(event) => setValues({ ...values, location: event.target.value })}
          placeholder="City, Country"
          value={values.location}
        />
      </div>
      <Checkbox
        checked={values.current}
        label="I am currently studying here"
        onChange={(event) => setValues({ ...values, current: event.target.checked, endDate: '' })}
      />
      <TextField
        id="education-result"
        label="Result or GPA (optional)"
        maxLength={500}
        onChange={(event) => setValues({ ...values, resultNote: event.target.value })}
        placeholder="e.g. Current GPA - 3.74 / 4.00"
        value={values.resultNote}
      />
      <Checkbox
        checked={values.cvInclude}
        label="Include this education entry in the CV"
        onChange={(event) => setValues({ ...values, cvInclude: event.target.checked })}
      />
      <ProfileEditorActions
        isPending={isPending}
        onCancel={onCancel}
        submitLabel={item ? 'Save education' : 'Add education'}
      />
    </form>
  )
}
