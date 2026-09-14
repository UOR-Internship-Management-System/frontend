import { useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { TextArea } from '../../../shared/components/forms/TextArea'
import { TextField } from '../../../shared/components/forms/TextField'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { companyFormSchema } from '../schemas/internshipSchemas'
import type {
  Company,
  CompanyFormSubmission,
  CompanyFormValues,
} from '../types/internshipManagementTypes'

type CompanyField = keyof CompanyFormValues
type CompanyErrors = Partial<Record<CompanyField, string>>

export const emptyCompanyForm: CompanyFormValues = {
  name: '',
  websiteUrl: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  notes: '',
}

export function mapCompanyToForm(company: Company): CompanyFormValues {
  return {
    name: company.name,
    websiteUrl: company.websiteUrl ?? '',
    contactPerson: company.contactPerson ?? '',
    contactEmail: company.contactEmail ?? '',
    contactPhone: company.contactPhone ?? '',
    notes: company.notes ?? '',
  }
}

export function CompanyForm({
  initialValues = emptyCompanyForm,
  mode,
  onCancel,
  onSubmit,
}: {
  initialValues?: CompanyFormValues
  mode: 'create' | 'edit'
  onCancel: () => void
  onSubmit: (values: CompanyFormSubmission) => Promise<void>
}) {
  const [values, setValues] = useState<CompanyFormValues>(initialValues)
  const [errors, setErrors] = useState<CompanyErrors>({})
  const [formError, setFormError] = useState<string>()
  const [isPending, setIsPending] = useState(false)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues)

  const update = <Field extends CompanyField>(field: Field, value: CompanyFormValues[Field]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(undefined)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setFormError(undefined)
    const parsed = companyFormSchema.safeParse(values)
    if (!parsed.success) {
      const nextErrors: CompanyErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && !nextErrors[field as CompanyField]) {
          nextErrors[field as CompanyField] = issue.message
        }
      }
      setErrors(nextErrors)
      if (nextErrors.name) window.requestAnimationFrame(() => nameRef.current?.focus())
      return
    }

    setIsPending(true)
    try {
      await onSubmit(parsed.data)
    } catch (reason) {
      const mapped = mapApiError(reason, 'protected')
      const nextErrors: CompanyErrors = {}
      for (const fieldError of mapped.fieldErrors) {
        if (fieldError.field in values) {
          nextErrors[fieldError.field as CompanyField] = fieldError.message
        }
      }
      setErrors(nextErrors)
      setFormError(mapped.message)
    } finally {
      setIsPending(false)
    }
  }

  const describedBy = (field: CompanyField) =>
    errors[field] ? `company-${field}-error` : undefined

  return (
    <Modal
      closeDisabled={isPending}
      onClose={onCancel}
      title={mode === 'create' ? 'Create Company' : 'Edit Company'}
    >
      <form className="im-form" noValidate onSubmit={submit}>
        {formError ? (
          <div className="inline-alert" role="alert">
            <p>{formError}</p>
            <p>Your entered values are preserved.</p>
          </div>
        ) : null}

        <TextField
          error={errors.name}
          id="company-name"
          label="Company Name"
          autoComplete="organization"
          disabled={isPending}
          maxLength={200}
          onChange={(event) => update('name', event.target.value)}
          placeholder="e.g., WSO2 Lanka (Pvt) Ltd"
          ref={nameRef}
          value={values.name}
          aria-describedby={describedBy('name')}
        />

        <TextField
          error={errors.websiteUrl}
          id="company-website"
          label="Website"
          disabled={isPending}
          inputMode="url"
          maxLength={500}
          onChange={(event) => update('websiteUrl', event.target.value)}
          placeholder="e.g., https://wso2.com"
          type="url"
          value={values.websiteUrl}
          aria-describedby={describedBy('websiteUrl')}
        />

        <div className="im-form-grid">
          <TextField
            error={errors.contactPerson}
            id="company-contact-person"
            label="HR Representative"
            autoComplete="name"
            disabled={isPending}
            maxLength={150}
            onChange={(event) => update('contactPerson', event.target.value)}
            placeholder="e.g., Jane Public"
            value={values.contactPerson}
            aria-describedby={describedBy('contactPerson')}
          />
          <TextField
            error={errors.contactEmail}
            id="company-contact-email"
            label="HR Email Address"
            autoComplete="email"
            disabled={isPending}
            maxLength={254}
            onChange={(event) => update('contactEmail', event.target.value)}
            placeholder="e.g., careers@corporate.com"
            type="email"
            value={values.contactEmail}
            aria-describedby={describedBy('contactEmail')}
          />
          <TextField
            error={errors.contactPhone}
            id="company-contact-phone"
            label="Phone Number"
            autoComplete="tel"
            disabled={isPending}
            maxLength={30}
            onChange={(event) => update('contactPhone', event.target.value)}
            placeholder="e.g., +94 11 234 5678"
            type="tel"
            value={values.contactPhone}
            aria-describedby={describedBy('contactPhone')}
          />
        </div>

        <TextArea
          error={errors.notes}
          id="company-notes"
          label="Internal Notes (Optional)"
          disabled={isPending}
          maxLength={4000}
          onChange={(event) => update('notes', event.target.value)}
          placeholder="Add internal context for department administrators"
          value={values.notes}
          aria-describedby={describedBy('notes')}
        />

        <div className="modal-actions">
          <Button disabled={isPending} onClick={onCancel} variant="outlined">
            Close
          </Button>
          <Button disabled={mode === 'edit' && !isDirty} isLoading={isPending} type="submit">
            {mode === 'create' ? 'Create Company' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
