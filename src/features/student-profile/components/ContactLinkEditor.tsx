import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { Checkbox } from '../../../shared/components/forms/Checkbox'
import { TextField } from '../../../shared/components/forms/TextField'
import { mapContactLinkRequest } from '../mappers/profileEntryMappers'
import { contactLinkFormSchema } from '../schemas/profileEntrySchemas'
import type { ContactLink, ContactLinkRequest } from '../types/profileEntryTypes'
import { ProfileEditorActions } from './ProfileEditorActions'

export function ContactLinkEditor({
  isPending,
  item,
  onCancel,
  onDirtyChange,
  onSubmit,
}: {
  isPending: boolean
  item?: ContactLink
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
  onSubmit: (values: ContactLinkRequest) => Promise<void>
}) {
  const [values, setValues] = useState({
    label: item?.label ?? '',
    url: item?.url ?? '',
    displayOrder: String(item?.displayOrder ?? 0),
    cvInclude: item?.cvInclude ?? true,
  })
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    const parsed = contactLinkFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the entered details.')
      return
    }
    try {
      await onSubmit(mapContactLinkRequest(parsed.data))
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
        id="contact-link-label"
        label="Link label"
        maxLength={60}
        onChange={(event) => setValues({ ...values, label: event.target.value })}
        required
        value={values.label}
      />
      <TextField
        autoComplete="url"
        id="contact-link-url"
        label="URL"
        onChange={(event) => setValues({ ...values, url: event.target.value })}
        required
        type="url"
        value={values.url}
      />
      <TextField
        id="contact-link-order"
        label="Display order"
        min={0}
        onChange={(event) => setValues({ ...values, displayOrder: event.target.value })}
        required
        type="number"
        value={values.displayOrder}
      />
      <Checkbox
        checked={values.cvInclude}
        label="Include this professional link in the CV"
        onChange={(event) => setValues({ ...values, cvInclude: event.target.checked })}
      />
      <ProfileEditorActions
        isPending={isPending}
        onCancel={onCancel}
        submitLabel={item ? 'Save link' : 'Add link'}
      />
    </form>
  )
}
