import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
import { mapExperienceRequest } from '../mappers/profileEntryMappers'
import { experienceFormSchema } from '../schemas/profileEntrySchemas'
import type { Experience, ExperienceRequest } from '../types/profileEntryTypes'
import { ProfileEditorActions } from './ProfileEditorActions'

export function ExperienceEditor({
  isPending,
  item,
  onCancel,
  onSubmit,
}: {
  isPending: boolean
  item?: Experience
  onCancel: () => void
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
    <form className="profile-editor-form" noValidate onSubmit={submit}>
      {error ? (
        <div className="inline-alert" role="alert">
          {error}
        </div>
      ) : null}
      <div className="profile-editor-grid">
        <FormField htmlFor="experience-organization" label="Organization">
          <TextInput
            id="experience-organization"
            maxLength={200}
            onChange={(event) => setValues({ ...values, organization: event.target.value })}
            required
            value={values.organization}
          />
        </FormField>
        <FormField htmlFor="experience-position" label="Position Title">
          <TextInput
            id="experience-position"
            maxLength={150}
            onChange={(event) => setValues({ ...values, positionTitle: event.target.value })}
            required
            value={values.positionTitle}
          />
        </FormField>
        <FormField htmlFor="experience-location" label="Location">
          <TextInput
            id="experience-location"
            onChange={(event) => setValues({ ...values, location: event.target.value })}
            value={values.location}
          />
        </FormField>
        <FormField htmlFor="experience-start" label="Start Date">
          <TextInput
            id="experience-start"
            onChange={(event) => setValues({ ...values, startDate: event.target.value })}
            required
            type="date"
            value={values.startDate}
          />
        </FormField>
        <FormField htmlFor="experience-end" label="End Date">
          <TextInput
            disabled={values.currentRole}
            id="experience-end"
            onChange={(event) => setValues({ ...values, endDate: event.target.value })}
            required={!values.currentRole}
            type="date"
            value={values.endDate}
          />
        </FormField>
      </div>
      <label className="profile-checkbox">
        <input
          checked={values.currentRole}
          onChange={(event) =>
            setValues({
              ...values,
              currentRole: event.target.checked,
              endDate: event.target.checked ? '' : values.endDate,
            })
          }
          type="checkbox"
        />{' '}
        I currently work here
      </label>
      <FormField htmlFor="experience-description" label="Description">
        <textarea
          className="input"
          id="experience-description"
          onChange={(event) => setValues({ ...values, description: event.target.value })}
          rows={4}
          value={values.description}
        />
      </FormField>
      <label className="profile-checkbox">
        <input
          checked={values.cvInclude}
          onChange={(event) => setValues({ ...values, cvInclude: event.target.checked })}
          type="checkbox"
        />{' '}
        Include in CV
      </label>
      <ProfileEditorActions
        isPending={isPending}
        onCancel={onCancel}
        submitLabel={item ? 'Save Experience' : 'Add Experience'}
      />
    </form>
  )
}
