import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FileUploadField } from '../../../shared/components/forms/FileUploadField'
import { Checkbox } from '../../../shared/components/forms/Checkbox'
import { TextField } from '../../../shared/components/forms/TextField'
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
  onDirtyChange,
  onSubmit,
}: {
  evidencePolicy?: FileUploadConstraint
  isPending: boolean
  item?: Certificate
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
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
          id="certificate-title"
          label="Certification name"
          maxLength={200}
          onChange={(event) => setValues({ ...values, title: event.target.value })}
          required
          value={values.title}
        />
        <TextField
          id="certificate-issuer"
          label="Issuing authority"
          maxLength={200}
          onChange={(event) => setValues({ ...values, issuer: event.target.value })}
          required
          value={values.issuer}
        />
        <TextField
          id="certificate-date"
          label="Date issued"
          onChange={(event) => setValues({ ...values, issueDate: event.target.value })}
          placeholder=" "
          required
          type="date"
          value={values.issueDate}
        />
        <TextField
          id="certificate-url"
          label="Credential URL"
          onChange={(event) => setValues({ ...values, credentialUrl: event.target.value })}
          type="url"
          value={values.credentialUrl}
        />
      </div>
      <div className="profile-file-field">
        <label className="profile-file-field-label" htmlFor="certificate-evidence">
          {item?.evidence ? 'Replace certificate evidence' : 'Certificate evidence (optional)'}
        </label>
        <FileUploadField
          accept={evidencePolicy ? fileAcceptValue(evidencePolicy) : undefined}
          disabled={!evidencePolicy || isPending}
          id="certificate-evidence"
          onChange={(event) => setEvidence(event.target.files?.[0])}
        />
      </div>
      <p className="field-hint">
        {evidencePolicy
          ? `${evidencePolicy.allowedExtensions.join(', ')} · Maximum ${formatFileSize(evidencePolicy.maxSizeBytes)}`
          : 'Evidence upload is unavailable until the server policy loads.'}
      </p>
      <Checkbox
        checked={values.cvInclude}
        label="Include this certificate in the CV"
        onChange={(event) => setValues({ ...values, cvInclude: event.target.checked })}
      />
      <ProfileEditorActions
        isPending={isPending}
        onCancel={onCancel}
        submitLabel={item ? 'Save certificate' : 'Add certificate'}
      />
    </form>
  )
}
