import { useEffect, useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { Button } from '../../../shared/components/ui/Button'
import { FormField } from '../../../shared/components/forms/FormField'
import { TextInput } from '../../../shared/components/forms/TextInput'
import { Modal } from '../../../shared/components/overlays/Modal'
import { SelectField } from '../../../shared/components/forms/SelectField'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { useIndividualSkills } from '../../student-skills/hooks/useSkillTaxonomy'
import type { IndividualSkill } from '../../student-skills/types/studentSkillTypes'
import { studentProjectFormSchema } from '../schemas/studentProjectSchemas'
import type { StudentProjectFormValues } from '../types/studentProjectTypes'
import { ProjectSkillChips } from './ProjectSkillChips'

type ProjectFormField = keyof StudentProjectFormValues
type ProjectFormErrors = Partial<Record<ProjectFormField, string>>
const taxonomyPageSize = 10
const emptyInitialSkills: IndividualSkill[] = []
const projectFormFields: ProjectFormField[] = [
  'title',
  'description',
  'repositoryUrl',
  'demoUrl',
  'startDate',
  'endDate',
  'skillIds',
  'includeInCv',
]

export const emptyStudentProjectForm: StudentProjectFormValues = {
  title: '',
  description: '',
  repositoryUrl: '',
  demoUrl: '',
  startDate: '',
  endDate: '',
  skillIds: [],
  includeInCv: true,
}

function valuesMatch(left: StudentProjectFormValues, right: StudentProjectFormValues) {
  return (
    left.title === right.title &&
    left.description === right.description &&
    left.repositoryUrl === right.repositoryUrl &&
    left.demoUrl === right.demoUrl &&
    left.startDate === right.startDate &&
    left.endDate === right.endDate &&
    left.includeInCv === right.includeInCv &&
    left.skillIds.length === right.skillIds.length &&
    left.skillIds.every((skillId, index) => skillId === right.skillIds[index])
  )
}

function fieldValuesMatch(
  field: ProjectFormField,
  left: StudentProjectFormValues,
  right: StudentProjectFormValues,
) {
  if (field === 'skillIds') {
    return (
      left.skillIds.length === right.skillIds.length &&
      left.skillIds.every((skillId, index) => skillId === right.skillIds[index])
    )
  }
  return left[field] === right[field]
}

function mergeRefreshedValues(
  current: StudentProjectFormValues,
  refreshed: StudentProjectFormValues,
  dirtyFields: Set<ProjectFormField>,
): StudentProjectFormValues {
  return {
    title: dirtyFields.has('title') ? current.title : refreshed.title,
    description: dirtyFields.has('description') ? current.description : refreshed.description,
    repositoryUrl: dirtyFields.has('repositoryUrl')
      ? current.repositoryUrl
      : refreshed.repositoryUrl,
    demoUrl: dirtyFields.has('demoUrl') ? current.demoUrl : refreshed.demoUrl,
    startDate: dirtyFields.has('startDate') ? current.startDate : refreshed.startDate,
    endDate: dirtyFields.has('endDate') ? current.endDate : refreshed.endDate,
    skillIds: [...(dirtyFields.has('skillIds') ? current.skillIds : refreshed.skillIds)],
    includeInCv: dirtyFields.has('includeInCv') ? current.includeInCv : refreshed.includeInCv,
  }
}

export function ProjectForm({
  initialValues = emptyStudentProjectForm,
  initialSkills = emptyInitialSkills,
  mode,
  onCancel,
  onSubmit,
}: {
  initialValues?: StudentProjectFormValues
  initialSkills?: IndividualSkill[]
  mode: 'create' | 'edit'
  onCancel: () => void
  onSubmit: (values: StudentProjectFormValues) => Promise<void>
}) {
  const [values, setValues] = useState(() => ({
    ...initialValues,
    skillIds: [...initialValues.skillIds],
  }))
  const [fieldErrors, setFieldErrors] = useState<ProjectFormErrors>({})
  const [formError, setFormError] = useState<string>()
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [taxonomySearch, setTaxonomySearch] = useState('')
  const [taxonomyPage, setTaxonomyPage] = useState(0)
  const [dirtyFields, setDirtyFields] = useState<Set<ProjectFormField>>(() => new Set())
  const dirtyFieldsRef = useRef<Set<ProjectFormField>>(new Set())
  const [skillsById, setSkillsById] = useState<Map<string, IndividualSkill>>(
    () => new Map(initialSkills.map((skill) => [skill.skillId, skill])),
  )
  const [isPending, setIsPending] = useState(false)
  const valuesRef = useRef(values)
  const titleRef = useRef<HTMLInputElement | null>(null)
  const endDateRef = useRef<HTMLInputElement | null>(null)
  const debouncedTaxonomySearch = useDebouncedValue(taxonomySearch.trim(), 300)
  const taxonomy = useIndividualSkills({
    page: taxonomyPage,
    size: taxonomyPageSize,
    sort: 'name,asc',
    search: debouncedTaxonomySearch || undefined,
  })
  const selectedSkills = values.skillIds
    .map((skillId) => skillsById.get(skillId))
    .filter((skill) => skill !== undefined)
  const isDirty = dirtyFields.size > 0 && !valuesMatch(values, initialValues)

  useEffect(() => {
    setSkillsById((current) => {
      const next = new Map(current)
      for (const skill of initialSkills) next.set(skill.skillId, skill)
      for (const skill of taxonomy.data?.items ?? []) next.set(skill.skillId, skill)
      return next
    })
  }, [initialSkills, taxonomy.data?.items])

  useEffect(() => {
    setTaxonomyPage(0)
    setSelectedSkillId('')
  }, [debouncedTaxonomySearch])

  useEffect(() => {
    if (mode !== 'edit') return
    const merged = mergeRefreshedValues(valuesRef.current, initialValues, dirtyFieldsRef.current)
    const nextDirtyFields = new Set(dirtyFieldsRef.current)
    for (const field of projectFormFields) {
      if (fieldValuesMatch(field, merged, initialValues)) nextDirtyFields.delete(field)
    }
    valuesRef.current = merged
    dirtyFieldsRef.current = nextDirtyFields
    setValues(merged)
    setDirtyFields(nextDirtyFields)
  }, [initialValues, mode])

  const update = <Field extends ProjectFormField>(
    field: Field,
    value: StudentProjectFormValues[Field],
  ) => {
    const next = { ...valuesRef.current, [field]: value }
    const nextDirtyFields = new Set(dirtyFieldsRef.current)
    if (fieldValuesMatch(field, next, initialValues)) nextDirtyFields.delete(field)
    else nextDirtyFields.add(field)
    valuesRef.current = next
    dirtyFieldsRef.current = nextDirtyFields
    setValues(next)
    setDirtyFields(nextDirtyFields)
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(undefined)
  }

  const addSkill = () => {
    if (!selectedSkillId) return
    if (values.skillIds.includes(selectedSkillId)) {
      setFieldErrors((current) => ({ ...current, skillIds: 'Select each skill only once.' }))
      return
    }
    update('skillIds', [...values.skillIds, selectedSkillId])
    setSelectedSkillId('')
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})
    setFormError(undefined)
    const parsed = studentProjectFormSchema.safeParse(values)
    if (!parsed.success) {
      const errors: ProjectFormErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && !errors[field as ProjectFormField]) {
          errors[field as ProjectFormField] = issue.message
        }
      }
      setFieldErrors(errors)
      window.requestAnimationFrame(() => {
        if (errors.title) titleRef.current?.focus()
        else if (errors.endDate) endDateRef.current?.focus()
      })
      return
    }

    setIsPending(true)
    try {
      await onSubmit(parsed.data)
    } catch (reason) {
      const mapped = mapApiError(reason, 'protected')
      const errors: ProjectFormErrors = {}
      for (const fieldError of mapped.fieldErrors) {
        if (fieldError.field in values) {
          errors[fieldError.field as ProjectFormField] = fieldError.message
        }
      }
      setFieldErrors(errors)
      setFormError(mapped.message)
    } finally {
      setIsPending(false)
    }
  }

  const describedBy = (field: ProjectFormField) =>
    fieldErrors[field] ? `project-${field}-error` : undefined

  return (
    <Modal
      closeDisabled={isPending}
      description="Add portfolio evidence using canonical taxonomy skills."
      onClose={onCancel}
      title={mode === 'create' ? 'Add project' : 'Edit project'}
    >
      <form className="s4-projects-form" noValidate onSubmit={submit}>
        {formError ? (
          <div className="inline-alert s4-projects-form-alert" role="alert">
            <p>{formError}</p>
            <p>Your entered values are preserved. Review them before retrying.</p>
          </div>
        ) : null}

        <FormField
          error={fieldErrors.title}
          errorId="project-title-error"
          htmlFor="project-title"
          label="Project title"
        >
          <TextInput
            aria-describedby={describedBy('title')}
            aria-invalid={Boolean(fieldErrors.title)}
            disabled={isPending}
            id="project-title"
            maxLength={200}
            onChange={(event) => update('title', event.target.value)}
            ref={titleRef}
            value={values.title}
          />
        </FormField>

        <FormField
          error={fieldErrors.description}
          errorId="project-description-error"
          htmlFor="project-description"
          label="Description"
        >
          <textarea
            aria-describedby={describedBy('description')}
            aria-invalid={Boolean(fieldErrors.description)}
            className="input"
            disabled={isPending}
            id="project-description"
            onChange={(event) => update('description', event.target.value)}
            rows={4}
            value={values.description}
          />
        </FormField>

        <div className="s4-projects-form-grid">
          <FormField
            error={fieldErrors.repositoryUrl}
            errorId="project-repositoryUrl-error"
            htmlFor="project-repository-url"
            label="Repository URL"
          >
            <TextInput
              aria-describedby={describedBy('repositoryUrl')}
              aria-invalid={Boolean(fieldErrors.repositoryUrl)}
              disabled={isPending}
              id="project-repository-url"
              inputMode="url"
              onChange={(event) => update('repositoryUrl', event.target.value)}
              placeholder="https://github.com/..."
              type="url"
              value={values.repositoryUrl}
            />
          </FormField>
          <FormField
            error={fieldErrors.demoUrl}
            errorId="project-demoUrl-error"
            htmlFor="project-demo-url"
            label="Demo URL"
          >
            <TextInput
              aria-describedby={describedBy('demoUrl')}
              aria-invalid={Boolean(fieldErrors.demoUrl)}
              disabled={isPending}
              id="project-demo-url"
              inputMode="url"
              onChange={(event) => update('demoUrl', event.target.value)}
              placeholder="https://example.com/..."
              type="url"
              value={values.demoUrl}
            />
          </FormField>
          <FormField
            error={fieldErrors.startDate}
            errorId="project-startDate-error"
            htmlFor="project-start-date"
            label="Start date"
          >
            <TextInput
              aria-describedby={describedBy('startDate')}
              aria-invalid={Boolean(fieldErrors.startDate)}
              disabled={isPending}
              id="project-start-date"
              onChange={(event) => update('startDate', event.target.value)}
              type="date"
              value={values.startDate}
            />
          </FormField>
          <FormField
            error={fieldErrors.endDate}
            errorId="project-endDate-error"
            htmlFor="project-end-date"
            label="End date"
          >
            <TextInput
              aria-describedby={describedBy('endDate')}
              aria-invalid={Boolean(fieldErrors.endDate)}
              disabled={isPending}
              id="project-end-date"
              min={values.startDate || undefined}
              onChange={(event) => update('endDate', event.target.value)}
              ref={endDateRef}
              type="date"
              value={values.endDate}
            />
          </FormField>
        </div>

        <fieldset className="s4-projects-skills-fieldset" disabled={isPending}>
          <legend>Project skills</legend>
          <SearchInput
            aria-label="Search project taxonomy skills"
            disabled={taxonomy.isPending}
            onChange={(event) => setTaxonomySearch(event.target.value)}
            placeholder="Search taxonomy skills"
            value={taxonomySearch}
          />
          <div className="s4-projects-skill-picker">
            <SelectField
              aria-label="Taxonomy skill"
              disabled={taxonomy.isPending || Boolean(taxonomy.error)}
              onChange={(event) => setSelectedSkillId(event.target.value)}
              value={selectedSkillId}
            >
              <option value="">Select a taxonomy skill</option>
              {taxonomy.data?.items.map((skill) => (
                <option
                  disabled={values.skillIds.includes(skill.skillId)}
                  key={skill.skillId}
                  value={skill.skillId}
                >
                  {skill.name}
                </option>
              ))}
            </SelectField>
            <Button disabled={!selectedSkillId} onClick={addSkill} variant="secondary">
              Add skill
            </Button>
          </div>
          {taxonomy.data && taxonomy.data.page.totalPages > 1 ? (
            <PaginationBar
              label="Project taxonomy skills pagination"
              onPageChange={(nextPage) => {
                setTaxonomyPage(nextPage)
                setSelectedSkillId('')
              }}
              page={taxonomy.data.page.page}
              size={taxonomy.data.page.size}
              totalElements={taxonomy.data.page.totalElements}
              totalPages={taxonomy.data.page.totalPages}
            />
          ) : null}
          {taxonomy.error ? (
            <p className="error-text" role="alert">
              Skill taxonomy is unavailable. Existing selections are preserved.
            </p>
          ) : null}
          <ProjectSkillChips
            disabled={isPending}
            onRemove={(skillId) =>
              update(
                'skillIds',
                values.skillIds.filter((value) => value !== skillId),
              )
            }
            skills={selectedSkills}
          />
          {fieldErrors.skillIds ? (
            <p className="error-text" id="project-skillIds-error">
              {fieldErrors.skillIds}
            </p>
          ) : null}
        </fieldset>

        <label className="s4-projects-cv-option">
          <input
            checked={values.includeInCv}
            disabled={isPending}
            onChange={(event) => update('includeInCv', event.target.checked)}
            type="checkbox"
          />
          <span>Include this project in my generated CV</span>
        </label>

        <div className="modal-actions">
          <Button disabled={isPending} onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button disabled={mode === 'edit' && !isDirty} isLoading={isPending} type="submit">
            {mode === 'create' ? 'Create project' : 'Save project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
