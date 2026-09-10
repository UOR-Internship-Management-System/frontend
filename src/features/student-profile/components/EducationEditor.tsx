import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
import { mapEducationRequest } from '../mappers/profileEntryMappers'
import { educationFormSchema } from '../schemas/profileEntrySchemas'
import type { Education, EducationRequest } from '../types/profileEntryTypes'
import { ProfileEditorActions } from './ProfileEditorActions'

const toMonthInput = (value: string | null) => (value ? value.slice(0, 7) : '')

export function EducationEditor({
  isPending,
  item,
  onCancel,
  onSubmit,
}: {
  isPending: boolean
  item?: Education
  onCancel: () => void
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
    <form className="profile-editor-form" noValidate onSubmit={submit}>
      {error ? (
        <div className="inline-alert" role="alert">
          {error}
        </div>
      ) : null}
      <FormField htmlFor="education-degree" label="Degree / Field of Study / Exchange Semester">
        <TextInput
          id="education-degree"
          maxLength={200}
          onChange={(event) => setValues({ ...values, degree: event.target.value })}
          placeholder="Enter Degree / Field Of Study / Exchange Semester"
          required
          value={values.degree}
        />
      </FormField>
      <div className="profile-editor-grid">
        <FormField htmlFor="education-institution" label="School / University">
          <TextInput
            id="education-institution"
            maxLength={200}
            onChange={(event) => setValues({ ...values, institution: event.target.value })}
            placeholder="Enter school / university"
            required
            value={values.institution}
          />
        </FormField>
        <FormField htmlFor="education-institution-url" label="Institution Link (optional)">
          <TextInput
            id="education-institution-url"
            onChange={(event) => setValues({ ...values, institutionUrl: event.target.value })}
            placeholder="https://"
            type="url"
            value={values.institutionUrl}
          />
        </FormField>
      </div>
      <div className="profile-editor-grid">
        <FormField htmlFor="education-start" label="Start Date">
          <TextInput
            id="education-start"
            onChange={(event) => setValues({ ...values, startDate: event.target.value })}
            type="month"
            value={values.startDate}
          />
        </FormField>
        <FormField htmlFor="education-end" label="End Date">
          <TextInput
            disabled={values.current}
            id="education-end"
            onChange={(event) => setValues({ ...values, endDate: event.target.value })}
            type="month"
            value={values.current ? '' : values.endDate}
          />
        </FormField>
        <FormField htmlFor="education-location" label="Location">
          <TextInput
            id="education-location"
            maxLength={150}
            onChange={(event) => setValues({ ...values, location: event.target.value })}
            placeholder="City, Country"
            value={values.location}
          />
        </FormField>
      </div>
      <label className="profile-checkbox">
        <input
          checked={values.current}
          onChange={(event) =>
            setValues({ ...values, current: event.target.checked, endDate: '' })
          }
          type="checkbox"
        />{' '}
        I am currently studying here
      </label>
      <FormField htmlFor="education-result" label="Result / GPA (optional)">
        <TextInput
          id="education-result"
          maxLength={500}
          onChange={(event) => setValues({ ...values, resultNote: event.target.value })}
          placeholder="e.g. Current GPA - 3.74 / 4.00"
          value={values.resultNote}
        />
      </FormField>
      <label className="profile-checkbox">
        <input
          checked={values.cvInclude}
          onChange={(event) => setValues({ ...values, cvInclude: event.target.checked })}
          type="checkbox"
        />{' '}
        Include this Education entry in the CV
      </label>
      <ProfileEditorActions
        isPending={isPending}
        onCancel={onCancel}
        submitLabel={item ? 'Save Education' : 'Add Education'}
      />
    </form>
  )
}
