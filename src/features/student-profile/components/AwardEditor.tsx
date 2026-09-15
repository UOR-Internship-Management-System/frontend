import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { Checkbox } from '../../../shared/components/forms/Checkbox'
import { TextArea } from '../../../shared/components/forms/TextArea'
import { TextField } from '../../../shared/components/forms/TextField'
import { mapAwardRequest } from '../mappers/profileEntryMappers'
import { awardFormSchema } from '../schemas/profileEntrySchemas'
import type { Award, AwardRequest } from '../types/profileEntryTypes'
import { ProfileEditorActions } from './ProfileEditorActions'

export function AwardEditor({
  isPending,
  item,
  onCancel,
  onDirtyChange,
  onSubmit,
}: {
  isPending: boolean
  item?: Award
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
  onSubmit: (values: AwardRequest) => Promise<void>
}) {
  const [values, setValues] = useState({
    title: item?.title ?? '',
    issuer: item?.issuer ?? '',
    awardDate: item?.awardDate ?? '',
    description: item?.description ?? '',
    cvInclude: item?.cvInclude ?? true,
  })
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    const parsed = awardFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the entered details.')
      return
    }
    try {
      await onSubmit(mapAwardRequest(parsed.data))
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
          id="award-title"
          label="Award or achievement title"
          maxLength={200}
          onChange={(event) => setValues({ ...values, title: event.target.value })}
          required
          value={values.title}
        />
        <TextField
          id="award-issuer"
          label="Awarding institution or organization"
          maxLength={200}
          onChange={(event) => setValues({ ...values, issuer: event.target.value })}
          required
          value={values.issuer}
        />
        <TextField
          id="award-date"
          label="Date received"
          onChange={(event) => setValues({ ...values, awardDate: event.target.value })}
          placeholder=" "
          required
          type="date"
          value={values.awardDate}
        />
      </div>
      <TextArea
        id="award-description"
        label="Description (optional)"
        onChange={(event) => setValues({ ...values, description: event.target.value })}
        rows={4}
        value={values.description}
      />
      <Checkbox
        checked={values.cvInclude}
        label="Include this award in the CV"
        onChange={(event) => setValues({ ...values, cvInclude: event.target.checked })}
      />
      <ProfileEditorActions
        isPending={isPending}
        onCancel={onCancel}
        submitLabel={item ? 'Save award' : 'Add award'}
      />
    </form>
  )
}
