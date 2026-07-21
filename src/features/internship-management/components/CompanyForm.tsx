import { useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
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
  active: true,
}

export function mapCompanyToForm(company: Company): CompanyFormValues {
  return {
    name: company.name,
    websiteUrl: company.websiteUrl ?? '',
    contactPerson: company.contactPerson ?? '',
    contactEmail: company.contactEmail ?? '',
    contactPhone: company.contactPhone ?? '',
    notes: company.notes ?? '',
    active: company.active,
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
      description="Maintain approved company contact metadata for internship requests."
      onClose={onCancel}
      title={mode === 'create' ? 'Add company' : 'Edit company'}
    >
      <form className="company-form" noValidate onSubmit={submit}>
        {formError ? (
          <div className="inline-alert" role="alert">
            <p>{formError}</p>
            <p>Your entered values are preserved.</p>
          </div>
        ) : null}

        <FormField
          error={errors.name}
          errorId="company-name-error"
          htmlFor="company-name"
          label="Company Legal Name"
        >
          <TextInput
            aria-describedby={describedBy('name')}
            aria-invalid={Boolean(errors.name)}
            autoComplete="organization"
            disabled={isPending}
            id="company-name"
            maxLength={200}
            onChange={(event) => update('name', event.target.value)}
            placeholder="e.g., WSO2 Lanka (Pvt) Ltd"
            ref={nameRef}
            value={values.name}
          />
        </FormField>

        <FormField
          error={errors.websiteUrl}
          errorId="company-websiteUrl-error"
          htmlFor="company-website"
          label="Corporate Website URL"
        >
          <TextInput
            aria-describedby={describedBy('websiteUrl')}
            aria-invalid={Boolean(errors.websiteUrl)}
            disabled={isPending}
            id="company-website"
            inputMode="url"
            maxLength={500}
            onChange={(event) => update('websiteUrl', event.target.value)}
            placeholder="e.g., https://wso2.com"
            type="url"
            value={values.websiteUrl}
          />
        </FormField>

        <div className="company-form-grid">
          <FormField
            error={errors.contactPerson}
            errorId="company-contactPerson-error"
            htmlFor="company-contact-person"
            label="HR Representative Name"
          >
            <TextInput
              aria-describedby={describedBy('contactPerson')}
              aria-invalid={Boolean(errors.contactPerson)}
              autoComplete="name"
              disabled={isPending}
              id="company-contact-person"
              maxLength={150}
              onChange={(event) => update('contactPerson', event.target.value)}
              placeholder="e.g., Jane Public"
              value={values.contactPerson}
            />
          </FormField>
          <FormField
            error={errors.contactEmail}
            errorId="company-contactEmail-error"
            htmlFor="company-contact-email"
            label="Office / HR Email Address"
          >
            <TextInput
              aria-describedby={describedBy('contactEmail')}
              aria-invalid={Boolean(errors.contactEmail)}
              autoComplete="email"
              disabled={isPending}
              id="company-contact-email"
              maxLength={254}
              onChange={(event) => update('contactEmail', event.target.value)}
              placeholder="e.g., careers@corporate.com"
              type="email"
              value={values.contactEmail}
            />
          </FormField>
          <FormField
            error={errors.contactPhone}
            errorId="company-contactPhone-error"
            htmlFor="company-contact-phone"
            label="Direct Line Phone"
          >
            <TextInput
              aria-describedby={describedBy('contactPhone')}
              aria-invalid={Boolean(errors.contactPhone)}
              autoComplete="tel"
              disabled={isPending}
              id="company-contact-phone"
              maxLength={30}
              onChange={(event) => update('contactPhone', event.target.value)}
              placeholder="e.g., +94 11 234 5678"
              type="tel"
              value={values.contactPhone}
            />
          </FormField>
        </div>



        <div className="modal-actions">
          <Button disabled={isPending} onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button disabled={mode === 'edit' && !isDirty} isLoading={isPending} type="submit">
            {mode === 'create' ? 'Add company' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}