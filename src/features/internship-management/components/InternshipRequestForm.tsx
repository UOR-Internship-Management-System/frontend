import { useMemo, useRef, useState } from 'react'
import type { ApiInternshipRequestStatus } from '../../../shared/api/generated/cvManagementApi.types'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FormField } from '../../../shared/components/forms/FormField'
import { SelectField } from '../../../shared/components/forms/SelectField'
import { TextInput } from '../../../shared/components/forms/TextInput'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { useCompanies } from '../hooks/useCompanies'
import { internshipRequestFormValuesSchema } from '../schemas/internshipSchemas'
import type {
  Company,
  InternshipRequestCreateInput,
  InternshipRequestFormValues,
} from '../types/internshipManagementTypes'
import { RequiredSkillPicker } from './RequiredSkillPicker'

type RequestFormField = keyof InternshipRequestFormValues
type RequestFormErrors = Partial<Record<RequestFormField, string>>

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

export function mapInternshipRequestToForm(
  request: Parameters<typeof requestToForm>[0],
): InternshipRequestFormValues {
  return requestToForm(request)
}

function requestToForm(request: {
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
}) {
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
    requiredSkills: request.requiredSkills.map((skill) => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
      requiredCompetencyLevel: skill.requiredCompetencyLevel,
    })),
  }
}

export function allowedRequestStatuses(
  mode: 'create' | 'edit',
  current: ApiInternshipRequestStatus,
): ApiInternshipRequestStatus[] {
  if (mode === 'create') return ['DRAFT', 'ACTIVE']
  if (current === 'DRAFT') return ['DRAFT', 'ACTIVE']
  if (current === 'ACTIVE') return ['ACTIVE', 'CLOSED']
  return [current]
}

function toSubmission(values: InternshipRequestFormValues): InternshipRequestCreateInput {
  return {
    companyId: values.companyId,
    title: values.title.trim(),
    description: values.description.trim() || null,
    location: values.location.trim() || null,
    workMode: values.workMode || null,
    status: values.status,
    shortlistGuidanceValue: values.shortlistGuidanceValue.trim()
      ? Number(values.shortlistGuidanceValue)
      : null,
    notes: values.notes.trim() || null,
    requiredSkills: values.requiredSkills.map(({ requiredCompetencyLevel, skillId }) => ({
      skillId,
      requiredCompetencyLevel,
    })),
  }
}

export function InternshipRequestForm({
  currentCompany,
  initialValues = emptyInternshipRequestForm,
  lockCompany = false,
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
    companyId: lockCompany && currentCompany ? currentCompany.companyId : initialValues.companyId,
    requiredSkills: initialValues.requiredSkills.map((skill) => ({ ...skill })),
  }))
  const [errors, setErrors] = useState<RequestFormErrors>({})
  const [formError, setFormError] = useState<string>()
  const [isPending, setIsPending] = useState(false)
  const [companySearch, setCompanySearch] = useState('')
  const debouncedCompanySearch = useDebouncedValue(companySearch.trim(), 300)
  const titleRef = useRef<HTMLInputElement | null>(null)
  const companies = useCompanies({
    page: 0,
    size: 20,
    sort: 'name,asc',
    search: debouncedCompanySearch,
    active: true,
  })
  const companyOptions = useMemo(() => {
    const byId = new Map<string, Company>()
    if (currentCompany) byId.set(currentCompany.companyId, currentCompany)
    for (const company of companies.data?.items ?? []) byId.set(company.companyId, company)
    return [...byId.values()]
  }, [companies.data?.items, currentCompany])
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues)

  const update = <Field extends RequestFormField>(
    field: Field,
    value: InternshipRequestFormValues[Field],
  ) => {
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
      const nextErrors: RequestFormErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && !nextErrors[field as RequestFormField]) {
          nextErrors[field as RequestFormField] = issue.message
        }
      }
      setErrors(nextErrors)
      if (nextErrors.title) window.requestAnimationFrame(() => titleRef.current?.focus())
      return
    }

    setIsPending(true)
    try {
      await onSubmit(toSubmission(parsed.data))
    } catch (reason) {
      const mapped = mapApiError(reason, 'protected')
      const nextErrors: RequestFormErrors = {}
      for (const fieldError of mapped.fieldErrors) {
        if (fieldError.field in values) {
          nextErrors[fieldError.field as RequestFormField] = fieldError.message
        }
      }
      setErrors(nextErrors)
      setFormError(mapped.message)
    } finally {
      setIsPending(false)
    }
  }

  const describedBy = (field: RequestFormField) =>
    errors[field] ? `request-${field}-error` : undefined

  return (
    <Modal
      closeDisabled={isPending}
      description="Define request metadata and deterministic taxonomy requirements."
      onClose={onCancel}
      size="wide"
      title={mode === 'create' ? 'Create internship request' : 'Edit internship request'}
    >
      <form className="internship-request-form" noValidate onSubmit={submit}>
        {formError ? (
          <div className="inline-alert" role="alert">
            <p>{formError}</p>
            <p>Your entered values are preserved.</p>
          </div>
        ) : null}

        {lockCompany && currentCompany ? (
          <div className="locked-company-context" role="status">
            <div>
              <span>Selected corporate client</span>
              <strong>{currentCompany.name}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{currentCompany.active ? 'Active' : 'Inactive'}</strong>
            </div>
            <input name="companyId" type="hidden" value={values.companyId} />
          </div>
        ) : (
          <FormField
            error={errors.companyId}
            errorId="request-companyId-error"
            htmlFor="request-company"
            label="Active company"
          >
            <div className="request-company-picker">
              <TextInput
                aria-label="Search active companies"
                disabled={isPending}
                id="request-company-search"
                onChange={(event) => setCompanySearch(event.target.value)}
                placeholder="Search active companies"
                type="search"
                value={companySearch}
              />
              <SelectField
                aria-describedby={describedBy('companyId')}
                aria-invalid={Boolean(errors.companyId)}
                disabled={isPending || companies.isPending}
                id="request-company"
                onChange={(event) => update('companyId', event.target.value)}
                value={values.companyId}
              >
                <option value="">Select an active company</option>
                {companyOptions.map((company) => (
                  <option
                    disabled={!company.active}
                    key={company.companyId}
                    value={company.companyId}
                  >
                    {company.name}
                    {company.active ? '' : ' — Inactive'}
                  </option>
                ))}
              </SelectField>
            </div>
          </FormField>
        )}

        <div className="internship-request-form-grid">
          <FormField
            error={errors.title}
            errorId="request-title-error"
            htmlFor="request-title"
            label="Internship Role Title"
          >
            <TextInput
              aria-describedby={describedBy('title')}
              aria-invalid={Boolean(errors.title)}
              disabled={isPending}
              id="request-title"
              maxLength={200}
              onChange={(event) => update('title', event.target.value)}
              placeholder="e.g. Software Engineering Intern"
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
              aria-describedby={describedBy('shortlistGuidanceValue')}
              aria-invalid={Boolean(errors.shortlistGuidanceValue)}
              disabled={isPending}
              id="request-guidance"
              inputMode="numeric"
              max={10000}
              min={0}
              onChange={(event) => update('shortlistGuidanceValue', event.target.value)}
              placeholder="e.g. 10"
              type="number"
              value={values.shortlistGuidanceValue}
            />
          </FormField>
        </div>

        <RequiredSkillPicker
          disabled={isPending}
          onChange={(skills) => update('requiredSkills', skills)}
          value={values.requiredSkills}
        />
        {errors.requiredSkills ? (
          <p className="error-text" id="request-requiredSkills-error">
            {errors.requiredSkills}
          </p>
        ) : null}

        <div className="modal-actions">
          <Button disabled={isPending} onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button disabled={mode === 'edit' && !isDirty} isLoading={isPending} type="submit">
            {mode === 'create' ? 'Create request' : 'Save request'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}