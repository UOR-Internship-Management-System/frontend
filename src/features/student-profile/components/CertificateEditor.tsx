import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FileUploadField } from '../../../shared/components/forms/FileUploadField'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
import { mapCertificateRequest } from '../mappers/profileEntryMappers'
import {
  fileAcceptValue,
  formatFileSize,
  validateProfileFile,
} from '../mappers/profileFileValidation'
import { certificateFormSchema } from '../schemas/profileEntrySchemas'
import type { Certificate, CertificateRequest } from '../types/profileEntryTypes'
import type { FileUploadConstraint } from '../types/profileFileTypes'
import { ProfileEditorActions } from './ProfileEditorActions'

export function CertificateEditor({
  evidencePolicy,
  isPending,
  item,
  onCancel,
  onSubmit,
}: {
  evidencePolicy?: FileUploadConstraint
  isPending: boolean
  item?: Certificate
  onCancel: () => void
  onSubmit: (values: CertificateRequest, evidence?: File) => Promise<void>
}) {
  const [values, setValues] = useState({
    title: item?.title ?? '',
    issuer: item?.issuer ?? '',
    issueDate: item?.issueDate ?? '',
    credentialUrl: item?.credentialUrl ?? '',
    cvInclude: item?.cvInclude ?? true,
  })
  const [evidence, setEvidence] = useState<File | undefined>()
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    const parsed = certificateFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the entered details.')
      return
    }
    if (evidence && evidencePolicy) {
      const fileError = validateProfileFile(evidence, evidencePolicy)
      if (fileError) {
        setError(fileError)
        return
      }
    }
    try {
      await onSubmit(mapCertificateRequest(parsed.data), evidence)
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
        <FormField htmlFor="certificate-title" label="Certificate Title">
          <TextInput
            id="certificate-title"
            maxLength={200}
            onChange={(event) => setValues({ ...values, title: event.target.value })}
            required
            value={values.title}
          />
        </FormField>
        <FormField htmlFor="certificate-issuer" label="Issuer">
          <TextInput
            id="certificate-issuer"
            maxLength={200}
            onChange={(event) => setValues({ ...values, issuer: event.target.value })}
            required
            value={values.issuer}
          />
        </FormField>
        <FormField htmlFor="certificate-date" label="Issue Date">
          <TextInput
            id="certificate-date"
            onChange={(event) => setValues({ ...values, issueDate: event.target.value })}
            required
            type="date"
            value={values.issueDate}
          />
        </FormField>
        <FormField htmlFor="certificate-url" label="Credential URL">
          <TextInput
            id="certificate-url"
            onChange={(event) => setValues({ ...values, credentialUrl: event.target.value })}
            type="url"
            value={values.credentialUrl}
          />
        </FormField>
      </div>
      <FormField
        htmlFor="certificate-evidence"
        label={item?.evidence ? 'Replace Evidence' : 'Certificate Evidence'}
      >
        <FileUploadField
          accept={evidencePolicy ? fileAcceptValue(evidencePolicy) : undefined}
          disabled={!evidencePolicy || isPending}
          id="certificate-evidence"
          onChange={(event) => setEvidence(event.target.files?.[0])}
        />
      </FormField>
      <p className="field-hint">
        {evidencePolicy
          ? `${evidencePolicy.allowedExtensions.join(', ')} · Maximum ${formatFileSize(evidencePolicy.maxSizeBytes)}`
          : 'Evidence upload is unavailable until the server policy loads.'}
      </p>
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
        submitLabel={item ? 'Save Certificate' : 'Add Certificate'}
      />
    </form>
  )
}
