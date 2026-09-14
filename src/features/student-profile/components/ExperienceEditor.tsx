import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { Checkbox } from '../../../shared/components/forms/Checkbox'
import { TextArea } from '../../../shared/components/forms/TextArea'
import { TextField } from '../../../shared/components/forms/TextField'
import { mapExperienceRequest } from '../mappers/profileEntryMappers'
import { experienceFormSchema } from '../schemas/profileEntrySchemas'
import type { Experience, ExperienceRequest } from '../types/profileEntryTypes'
import { ProfileEditorActions } from './ProfileEditorActions'

export function ExperienceEditor({
  isPending,
  item,
  onCancel,
  onDirtyChange,
  onSubmit,
}: {
  isPending: boolean
  item?: Experience
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
  onSubmit: (values: ExperienceRequest) => Promise<void>
}) {
  const [values, setValues] = useState({
    organization: item?.organization ?? '',
    positionTitle: item?.positionTitle ?? '',
    location: item?.location ?? '',
    startDate: item?.startDate ?? '',
    endDate: item?.endDate ?? '',
    currentRole: item?.currentRole ?? false,
    description: item?.description ?? '',
    cvInclude: item?.cvInclude ?? true,
  })
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    const parsed = experienceFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the entered details.')
      return
    }
    try {
      await onSubmit(mapExperienceRequest(parsed.data))
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
      <div className="profile-editor-grid">
        <TextField
          id="experience-organization"
          label="Company"
          maxLength={200}
          onChange={(event) => setValues({ ...values, organization: event.target.value })}
          required
          value={values.organization}
        />
        <TextField
          id="experience-position"
          label="Job title"
          maxLength={150}
          onChange={(event) => setValues({ ...values, positionTitle: event.target.value })}
          required
          value={values.positionTitle}
        />
        <TextField
          id="experience-location"
          label="Job location"
          onChange={(event) => setValues({ ...values, location: event.target.value })}
          value={values.location}
        />
        <TextField
          id="experience-start"
          label="Start date"
          onChange={(event) => setValues({ ...values, startDate: event.target.value })}
          placeholder=" "
          required
          type="date"
          value={values.startDate}
        />
        <TextField
          disabled={values.currentRole}
          id="experience-end"
          label="End date"
          onChange={(event) => setValues({ ...values, endDate: event.target.value })}
          placeholder=" "
          required={!values.currentRole}
          type="date"
          value={values.endDate}
        />
      </div>
      <Checkbox
        checked={values.currentRole}
        label="This is my current role"
        onChange={(event) =>
          setValues({
            ...values,
            currentRole: event.target.checked,
            endDate: event.target.checked ? '' : values.endDate,
          })
        }
      />
      <TextArea
        id="experience-description"
        label="Core responsibilities or duties"
        onChange={(event) => setValues({ ...values, description: event.target.value })}
        rows={4}
        value={values.description}
      />
      <Checkbox
        checked={values.cvInclude}
        label="Include this experience in the CV"
        onChange={(event) => setValues({ ...values, cvInclude: event.target.checked })}
      />
      <ProfileEditorActions
        isPending={isPending}
        onCancel={onCancel}
        submitLabel={item ? 'Save experience' : 'Add experience'}
      />
    </form>
  )
}
