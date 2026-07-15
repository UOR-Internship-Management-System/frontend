import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
import { mapActivityRequest } from '../mappers/profileEntryMappers'
import { activityFormSchema } from '../schemas/profileEntrySchemas'
import type { Activity, ActivityRequest } from '../types/profileEntryTypes'
import { ProfileEditorActions } from './ProfileEditorActions'

export function ActivityEditor({
  isPending,
  item,
  onCancel,
  onSubmit,
}: {
  isPending: boolean
  item?: Activity
  onCancel: () => void
  onSubmit: (values: ActivityRequest) => Promise<void>
}) {
  const [values, setValues] = useState({
    activityName: item?.activityName ?? '',
    roleTitle: item?.roleTitle ?? '',
    startDate: item?.startDate ?? '',
    endDate: item?.endDate ?? '',
    description: item?.description ?? '',
    cvInclude: item?.cvInclude ?? true,
  })
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    const parsed = activityFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the entered details.')
      return
    }
    try {
      await onSubmit(mapActivityRequest(parsed.data))
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
        <FormField htmlFor="activity-name" label="Activity Name">
          <TextInput
            id="activity-name"
            maxLength={200}
            onChange={(event) => setValues({ ...values, activityName: event.target.value })}
            required
            value={values.activityName}
          />
        </FormField>
        <FormField htmlFor="activity-role" label="Role">
          <TextInput
            id="activity-role"
            maxLength={150}
            onChange={(event) => setValues({ ...values, roleTitle: event.target.value })}
            required
            value={values.roleTitle}
          />
        </FormField>
        <FormField htmlFor="activity-start" label="Start Date">
          <TextInput
            id="activity-start"
            onChange={(event) => setValues({ ...values, startDate: event.target.value })}
            type="date"
            value={values.startDate}
          />
        </FormField>
        <FormField htmlFor="activity-end" label="End Date">
          <TextInput
            id="activity-end"
            onChange={(event) => setValues({ ...values, endDate: event.target.value })}
            type="date"
            value={values.endDate}
          />
        </FormField>
      </div>
      <FormField htmlFor="activity-description" label="Description">
        <textarea
          className="input"
          id="activity-description"
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
        submitLabel={item ? 'Save Activity' : 'Add Activity'}
      />
    </form>
  )
}
