import { useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { internshipRequestFormValuesSchema } from '../schemas/internshipSchemas'
import type {
  Company,
  InternshipRequestCreateInput,
  InternshipRequestFormValues,
} from '../types/internshipManagementTypes'
import { RequiredSkillPicker } from './RequiredSkillPicker'

type Field = keyof InternshipRequestFormValues
type Errors = Partial<Record<Field, string>>

export const emptyInternshipRequestForm: InternshipRequestFormValues = {
  companyId: '',
  title: '',
  description: '',
  shortlistGuidanceValue: '',
  requiredSkills: [],
}

export function mapInternshipRequestToForm(request: {
  company: Company
  title: string
  description: string | null
  shortlistGuidanceValue: number | null
  requiredSkills: Array<{ skillId: string; skillName: string }>
}): InternshipRequestFormValues {
  return {
    companyId: request.company.companyId,
    title: request.title,
    description: request.description ?? '',
    shortlistGuidanceValue:
      request.shortlistGuidanceValue === null ? '' : String(request.shortlistGuidanceValue),
    requiredSkills: request.requiredSkills.map(({ skillId, skillName }) => ({
      skillId,
      skillName,
    })),
  }
}

function toSubmission(values: InternshipRequestFormValues): InternshipRequestCreateInput {
  return {
    companyId: values.companyId,
    title: values.title.trim(),
    description: values.description.trim() || null,
    shortlistGuidanceValue: values.shortlistGuidanceValue.trim()
      ? Number(values.shortlistGuidanceValue)
      : null,
    requiredSkills: values.requiredSkills.map(({ skillId }) => ({ skillId })),
  }
}

export function InternshipRequestForm({
  currentCompany,
  initialValues = emptyInternshipRequestForm,
  mode,
  onCancel,
  onSubmit,
}: {
  currentCompany?: Company
  initialValues?: InternshipRequestFormValues
  mode: 'create' | 'edit'
  onCancel: () => void
  onSubmit: (values: InternshipRequestCreateInput) => Promise<void>
}) {
  const resolvedInitialValues: InternshipRequestFormValues = {
    ...initialValues,
    companyId: currentCompany?.companyId ?? initialValues.companyId,
    requiredSkills: initialValues.requiredSkills.map((skill) => ({ ...skill })),
  }
  const [values, setValues] = useState<InternshipRequestFormValues>(resolvedInitialValues)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string>()
  const [pending, setPending] = useState(false)
  const titleRef = useRef<HTMLInputElement | null>(null)
  const isDirty = JSON.stringify(values) !== JSON.stringify(resolvedInitialValues)

  const update = <K extends Field>(field: K, value: InternshipRequestFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(undefined)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setFormError(undefined)
    const parsed = internshipRequestFormValuesSchema.safeParse(values)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && !next[field as Field]) {
          next[field as Field] = issue.message
        }
      }
      setErrors(next)
      if (next.title) requestAnimationFrame(() => titleRef.current?.focus())
      return
    }

    setPending(true)
    try {
      await onSubmit(toSubmission(parsed.data))
    } catch (reason) {
      const mapped = mapApiError(reason, 'protected')
      const next: Errors = {}
      for (const fieldError of mapped.fieldErrors) {
        if (fieldError.field in values) next[fieldError.field as Field] = fieldError.message
      }
      setErrors(next)
      setFormError(mapped.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      className="internship-request-modal"
      closeDisabled={pending}
      onClose={onCancel}
      title={mode === 'create' ? 'Create Internship Request' : 'Edit Internship Request'}
    >
      <form className="internship-request-form wireframe-request-form" noValidate onSubmit={submit}>
        {formError ? (
          <div className="inline-alert" role="alert">
            <p>{formError}</p>
            <p>Your entered values are preserved.</p>
          </div>
        ) : null}

        <section className="request-form-section" aria-labelledby="request-role-heading">
          <div className="request-form-section-heading">
            <h3 id="request-role-heading">Role details</h3>
            <p>Define the role details for the selected company.</p>
          </div>
          <FormField
            error={errors.title}
            errorId="request-title-error"
            htmlFor="request-title"
            label="Internship Role Title"
          >
            <TextInput
              aria-invalid={Boolean(errors.title)}
              disabled={pending}
              id="request-title"
              maxLength={200}
              onChange={(event) => update('title', event.target.value)}
              placeholder="e.g., Software Engineer Intern"
              ref={titleRef}
              value={values.title}
            />
          </FormField>
          <div className="wireframe-form-grid">
            <FormField
              error={errors.shortlistGuidanceValue}
              errorId="request-shortlistGuidanceValue-error"
              htmlFor="request-guidance"
              label="Shortlist Guidance Value (Optional)"
            >
              <TextInput
                aria-describedby="request-guidance-help"
                aria-invalid={Boolean(errors.shortlistGuidanceValue)}
                disabled={pending}
                id="request-guidance"
                max={10000}
                min={0}
                onChange={(event) => update('shortlistGuidanceValue', event.target.value)}
                placeholder="e.g., 10"
                type="number"
                value={values.shortlistGuidanceValue}
              />
              <p className="request-field-help" id="request-guidance-help">
                Advisory only. Leave blank when no guidance value is available; it never blocks
                shortlist finalization.
              </p>
            </FormField>
          </div>
          <FormField
            error={errors.description}
            errorId="request-description-error"
            htmlFor="request-description"
            label="Role Description"
          >
            <textarea
              aria-invalid={Boolean(errors.description)}
              className="input request-textarea"
              disabled={pending}
              id="request-description"
              maxLength={10000}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Describe responsibilities, expectations, and relevant context"
              value={values.description}
            />
          </FormField>
        </section>

        <section className="request-form-section" aria-labelledby="request-skills-heading">
          <div className="request-form-section-heading">
            <h3 id="request-skills-heading">Add Required Skills</h3>
            <p>
              Select taxonomy skills required for the role. Student competency levels remain
              student-managed and are not editable by administrators.
            </p>
          </div>
          <RequiredSkillPicker
            disabled={pending}
            onChange={(skills) => update('requiredSkills', skills)}
            value={values.requiredSkills}
          />
          {errors.requiredSkills ? (
            <p className="field-error" role="alert">
              {errors.requiredSkills}
            </p>
          ) : null}
        </section>

        <div className="modal-actions">
          <Button disabled={pending} onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button disabled={mode === 'edit' && !isDirty} isLoading={pending} type="submit">
            {mode === 'create' ? 'Create Request' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
