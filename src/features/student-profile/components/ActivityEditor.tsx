import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { Checkbox } from '../../../shared/components/forms/Checkbox'
import { TextArea } from '../../../shared/components/forms/TextArea'
import { TextField } from '../../../shared/components/forms/TextField'
import { mapActivityRequest } from '../mappers/profileEntryMappers'
import { activityFormSchema } from '../schemas/profileEntrySchemas'
import type { Activity, ActivityRequest } from '../types/profileEntryTypes'
import { ProfileEditorActions } from './ProfileEditorActions'

export function ActivityEditor({
  isPending,
  item,
  onCancel,
  onDirtyChange,
  onSubmit,
}: {
  isPending: boolean
  item?: Activity
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
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
          id="activity-name"
          label="Organization, club, or society name"
          maxLength={200}
          onChange={(event) => setValues({ ...values, activityName: event.target.value })}
          required
          value={values.activityName}
        />
        <TextField
          id="activity-role"
          label="Role or position held"
          maxLength={150}
          onChange={(event) => setValues({ ...values, roleTitle: event.target.value })}
          required
          value={values.roleTitle}
        />
        <TextField
          id="activity-start"
          label="Start date"
          onChange={(event) => setValues({ ...values, startDate: event.target.value })}
          placeholder=" "
          type="date"
          value={values.startDate}
        />
        <TextField
          id="activity-end"
          label="End date"
          onChange={(event) => setValues({ ...values, endDate: event.target.value })}
          placeholder=" "
          type="date"
          value={values.endDate}
        />
      </div>
      <TextArea
        id="activity-description"
        label="Core responsibilities"
        onChange={(event) => setValues({ ...values, description: event.target.value })}
        rows={4}
        value={values.description}
      />
      <Checkbox
        checked={values.cvInclude}
        label="Include this activity in the CV"
        onChange={(event) => setValues({ ...values, cvInclude: event.target.checked })}
      />
      <ProfileEditorActions
        isPending={isPending}
        onCancel={onCancel}
        submitLabel={item ? 'Save activity' : 'Add activity'}
      />
    </form>
  )
}
