import { useRef, useState } from 'react'
import type { ApiInternshipRequestStatus } from '../../../shared/api/generated/cvManagementApi.types'
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
  location: '',
  workMode: '',
  status: 'DRAFT',
  shortlistGuidanceValue: '',
  notes: '',
  requiredSkills: [],
}

export function allowedRequestStatuses(
  mode: 'create' | 'edit',
  current: ApiInternshipRequestStatus,
): ApiInternshipRequestStatus[] {
  if (mode === 'create' || current === 'DRAFT') return ['DRAFT', 'ACTIVE']
  if (current === 'ACTIVE') return ['ACTIVE', 'CLOSED']
  return [current]
}

export function mapInternshipRequestToForm(request: {
  company: Company
  title: string
  description: string | null
  location: string | null
  workMode: InternshipRequestFormValues['workMode'] | null
  status: ApiInternshipRequestStatus
  shortlistGuidanceValue: number | null
  notes: string | null
  requiredSkills: Array<{
    skillId: string
    skillName: string
    requiredCompetencyLevel: InternshipRequestFormValues['requiredSkills'][number]['requiredCompetencyLevel']
  }>
}): InternshipRequestFormValues {
  return {
    companyId: request.company.companyId,
    title: request.title,
    description: request.description ?? '',
    location: request.location ?? '',
    workMode: request.workMode ?? '',
    status: request.status,
    shortlistGuidanceValue:
      request.shortlistGuidanceValue === null ? '' : String(request.shortlistGuidanceValue),
    notes: request.notes ?? '',
    requiredSkills: request.requiredSkills.map(
      ({ skillId, skillName, requiredCompetencyLevel }) => ({
        skillId,
        skillName,
        requiredCompetencyLevel,
      }),
    ),
  }
}

function toSubmission(values: InternshipRequestFormValues): InternshipRequestCreateInput {
  return {
    companyId: values.companyId,
    title: values.title.trim(),
    description: values.description.trim() || null,
    location: values.location.trim() || null,
    workMode: values.workMode || null,
    status: values.status,
    shortlistGuidanceValue: Number(values.shortlistGuidanceValue),
    notes: values.notes.trim() || null,
    requiredSkills: values.requiredSkills.map(({ skillId, requiredCompetencyLevel }) => ({
      skillId,
      requiredCompetencyLevel,
    })),
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
  lockCompany?: boolean
  mode: 'create' | 'edit'
  onCancel: () => void
  onSubmit: (values: InternshipRequestCreateInput) => Promise<void>
}) {
  const [values, setValues] = useState<InternshipRequestFormValues>(() => ({
    ...initialValues,
    companyId: currentCompany?.companyId ?? initialValues.companyId,
    requiredSkills: initialValues.requiredSkills.map((skill) => ({ ...skill })),
  }))
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string>()
  const [pending, setPending] = useState(false)
  const titleRef = useRef<HTMLInputElement | null>(null)
  const update = <K extends Field>(field: K, value: InternshipRequestFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(undefined)
  }
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = internshipRequestFormValuesSchema.safeParse(values)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && !next[field as Field]) next[field as Field] = issue.message
      }
      setErrors(next)
      if (next.title) requestAnimationFrame(() => titleRef.current?.focus())
      return
    }
    setPending(true)
    setFormError(undefined)
    try {
      await onSubmit(toSubmission(parsed.data))
    } catch (reason) {
      const mapped = mapApiError(reason, 'protected')
      setFormError(mapped.message)
    } finally {
      setPending(false)
    }
  }
  return (
    <Modal
      closeDisabled={pending}
      onClose={onCancel}
      size="wide"
      title={
        mode === 'create'
          ? 'Create Candidate Selection Criteria'
          : 'Modify Placement Criteria Settings'
      }
    >
      <form className="internship-request-form wireframe-request-form" noValidate onSubmit={submit}>
        {formError ? (
          <div className="inline-alert" role="alert">
            {formError}
          </div>
        ) : null}
        <div className="wireframe-form-grid">
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
          <FormField
            error={errors.shortlistGuidanceValue}
            errorId="request-shortlistGuidanceValue-error"
            htmlFor="request-guidance"
            label="Maximum Shortlist Limit"
          >
            <TextInput
              aria-invalid={Boolean(errors.shortlistGuidanceValue)}
              disabled={pending}
              id="request-guidance"
              max={100}
              min={1}
              onChange={(event) => update('shortlistGuidanceValue', event.target.value)}
              placeholder="e.g., 10"
              type="number"
              value={values.shortlistGuidanceValue}
            />
          </FormField>
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
        <div className="modal-actions">
          <Button disabled={pending} onClick={onCancel} variant="secondary">
            Close
          </Button>
          <Button isLoading={pending} type="submit">
            {mode === 'create' ? 'Add' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
