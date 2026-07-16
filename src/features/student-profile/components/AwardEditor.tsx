import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
import { mapAwardRequest } from '../mappers/profileEntryMappers'
import { awardFormSchema } from '../schemas/profileEntrySchemas'
import type { Award, AwardRequest } from '../types/profileEntryTypes'
import { ProfileEditorActions } from './ProfileEditorActions'

export function AwardEditor({
  isPending,
  item,
  onCancel,
  onSubmit,
}: {
  isPending: boolean
  item?: Award
  onCancel: () => void
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
    <form className="profile-editor-form" noValidate onSubmit={submit}>
      {error ? (
        <div className="inline-alert" role="alert">
          {error}
        </div>
      ) : null}
      <div className="profile-editor-grid">
        <FormField htmlFor="award-title" label="Award Title">
          <TextInput
            id="award-title"
            maxLength={200}
            onChange={(event) => setValues({ ...values, title: event.target.value })}
            required
            value={values.title}
          />
        </FormField>
        <FormField htmlFor="award-issuer" label="Issuer">
          <TextInput
            id="award-issuer"
            maxLength={200}
            onChange={(event) => setValues({ ...values, issuer: event.target.value })}
            required
            value={values.issuer}
          />
        </FormField>
        <FormField htmlFor="award-date" label="Award Date">
          <TextInput
            id="award-date"
            onChange={(event) => setValues({ ...values, awardDate: event.target.value })}
            required
            type="date"
            value={values.awardDate}
          />
        </FormField>
      </div>
      <FormField htmlFor="award-description" label="Description">
        <textarea
          className="input"
          id="award-description"
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
        submitLabel={item ? 'Save Award' : 'Add Award'}
      />
    </form>
  )
}
