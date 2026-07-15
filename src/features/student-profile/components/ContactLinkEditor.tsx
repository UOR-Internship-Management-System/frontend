import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
import { mapContactLinkRequest } from '../mappers/profileEntryMappers'
import { contactLinkFormSchema } from '../schemas/profileEntrySchemas'
import type { ContactLink, ContactLinkRequest } from '../types/profileEntryTypes'
import { ProfileEditorActions } from './ProfileEditorActions'

export function ContactLinkEditor({
  isPending,
  item,
  onCancel,
  onSubmit,
}: {
  isPending: boolean
  item?: ContactLink
  onCancel: () => void
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
    <form className="profile-editor-form" noValidate onSubmit={submit}>
      {error ? (
        <div className="inline-alert" role="alert">
          {error}
        </div>
      ) : null}
      <FormField htmlFor="contact-link-label" label="Label">
        <TextInput
          id="contact-link-label"
          maxLength={60}
          onChange={(event) => setValues({ ...values, label: event.target.value })}
          required
          value={values.label}
        />
      </FormField>
      <FormField htmlFor="contact-link-url" label="URL">
        <TextInput
          autoComplete="url"
          id="contact-link-url"
          onChange={(event) => setValues({ ...values, url: event.target.value })}
          required
          type="url"
          value={values.url}
        />
      </FormField>
      <FormField htmlFor="contact-link-order" label="Display Order">
        <TextInput
          id="contact-link-order"
          min={0}
          onChange={(event) => setValues({ ...values, displayOrder: event.target.value })}
          required
          type="number"
          value={values.displayOrder}
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
        submitLabel={item ? 'Save Link' : 'Add Link'}
      />
    </form>
  )
}
