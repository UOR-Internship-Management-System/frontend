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

const statusLabels: Record<ApiInternshipRequestStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
}

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
  const availableStatuses = useMemo(
    () => allowedRequestStatuses(mode, initialValues.status),
    [initialValues.status, mode],
  )
  const normalizedInitialValues = useMemo(
    () => ({
      ...initialValues,
      companyId:
        lockCompany && currentCompany ? currentCompany.companyId : initialValues.companyId,
      requiredSkills: initialValues.requiredSkills.map((skill) => ({ ...skill })),
    }),
    [currentCompany, initialValues, lockCompany],
  )
  const isDirty = JSON.stringify(values) !== JSON.stringify(normalizedInitialValues)

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

  const describedBy = (field: RequestFormField, helperId?: string) => {
    const ids = [errors[field] ? `request-${field}-error` : undefined, helperId].filter(Boolean)
    return ids.length ? ids.join(' ') : undefined
  }

  return (
    <Modal
      closeDisabled={isPending}
      description="Define request metadata and deterministic taxonomy requirements."
      onClose={onCancel}
      size="wide"
      title={
        mode === 'create'
          ? 'Create Candidate Selection Criteria'
          : 'Modify Placement Criteria Settings'
      }
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
              <span>Company status</span>
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

        <section aria-labelledby="request-overview-title" className="request-form-section">
          <div className="request-form-section-heading">
            <h3 id="request-overview-title">Request overview</h3>
            <p>Capture the role, lifecycle state, work arrangement, and advisory shortlist value.</p>
          </div>

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
              error={errors.status}
              errorId="request-status-error"
              htmlFor="request-status"
              label="Lifecycle status"
            >
              <SelectField
                aria-describedby={describedBy('status', 'request-status-help')}
                aria-invalid={Boolean(errors.status)}
                disabled={isPending || availableStatuses.length === 1}
                id="request-status"
                onChange={(event) =>
                  update('status', event.target.value as ApiInternshipRequestStatus)
                }
                value={values.status}
              >
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </SelectField>
              <p className="request-field-help" id="request-status-help">
                Draft requests can be activated. Active requests can later be closed or cancelled.
              </p>
            </FormField>

            <FormField
              error={errors.location}
              errorId="request-location-error"
              htmlFor="request-location"
              label="Location"
            >
              <TextInput
                aria-describedby={describedBy('location')}
                aria-invalid={Boolean(errors.location)}
                disabled={isPending}
                id="request-location"
                maxLength={150}
                onChange={(event) => update('location', event.target.value)}
                placeholder="e.g. Colombo"
                value={values.location}
              />
            </FormField>

            <FormField
              error={errors.workMode}
              errorId="request-workMode-error"
              htmlFor="request-work-mode"
              label="Work mode"
            >
              <SelectField
                aria-describedby={describedBy('workMode')}
                aria-invalid={Boolean(errors.workMode)}
                disabled={isPending}
                id="request-work-mode"
                onChange={(event) =>
                  update(
                    'workMode',
                    event.target.value as InternshipRequestFormValues['workMode'],
                  )
                }
                value={values.workMode}
              >
                <option value="">Not specified</option>
                <option value="ONSITE">On-site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </SelectField>
            </FormField>

            <FormField
              error={errors.shortlistGuidanceValue}
              errorId="request-shortlistGuidanceValue-error"
              htmlFor="request-guidance"
              label="Shortlist guidance value"
            >
              <TextInput
                aria-describedby={describedBy(
                  'shortlistGuidanceValue',
                  'request-guidance-help',
                )}
                aria-invalid={Boolean(errors.shortlistGuidanceValue)}
                disabled={isPending}
                id="request-guidance"
                inputMode="numeric"
                max={100}
                min={1}
                onChange={(event) => update('shortlistGuidanceValue', event.target.value)}
                placeholder="e.g. 10"
                type="number"
                value={values.shortlistGuidanceValue}
              />
              <p className="request-field-help" id="request-guidance-help">
                Advisory only. This value never blocks manual shortlist finalization.
              </p>
            </FormField>
          </div>

          <FormField
            error={errors.description}
            errorId="request-description-error"
            htmlFor="request-description"
            label="Role description"
          >
            <textarea
              aria-describedby={describedBy('description')}
              aria-invalid={Boolean(errors.description)}
              className="input request-textarea"
              disabled={isPending}
              id="request-description"
              maxLength={10000}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Summarize the placement responsibilities, learning outcomes, and expected contribution."
              rows={5}
              value={values.description}
            />
          </FormField>

          <FormField
            error={errors.notes}
            errorId="request-notes-error"
            htmlFor="request-notes"
            label="Administrative notes"
          >
            <textarea
              aria-describedby={describedBy('notes')}
              aria-invalid={Boolean(errors.notes)}
              className="input request-textarea"
              disabled={isPending}
              id="request-notes"
              maxLength={4000}
              onChange={(event) => update('notes', event.target.value)}
              placeholder="Add internal notes for Department Admin use."
              rows={4}
              value={values.notes}
            />
          </FormField>
        </section>

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
            Close
          </Button>
          <Button disabled={mode === 'edit' && !isDirty} isLoading={isPending} type="submit">
            {mode === 'create' ? 'Add request' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}