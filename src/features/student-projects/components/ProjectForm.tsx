import { useEffect, useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { FormErrorMessage } from '../../../shared/components/forms/FormErrorMessage'
import { Switch } from '../../../shared/components/forms/Switch'
import { TextArea } from '../../../shared/components/forms/TextArea'
import { TextField } from '../../../shared/components/forms/TextField'
import { Button } from '../../../shared/components/ui/Button'
import { List, ListItem } from '../../../shared/components/ui/List'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { useIndividualSkills } from '../../../shared/skill-taxonomy'
import type { IndividualSkill } from '../../../shared/skill-taxonomy'
import { studentProjectFormSchema } from '../schemas/studentProjectSchemas'
import type { StudentProjectFormValues } from '../types/studentProjectTypes'
import { ProjectSkillChips } from './ProjectSkillChips'

type ProjectFormField = keyof StudentProjectFormValues
type ProjectFormErrors = Partial<Record<ProjectFormField, string>>
const taxonomyPageSize = 8
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
  const [isOngoing, setIsOngoing] = useState(() =>
    Boolean(initialValues.startDate && !initialValues.endDate),
  )
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
    if (!dirtyFieldsRef.current.has('endDate')) {
      setIsOngoing(Boolean(initialValues.startDate && !initialValues.endDate))
    }
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

  const addSkill = (skillId: string) => {
    if (values.skillIds.includes(skillId)) return
    update('skillIds', [...values.skillIds, skillId])
    setFieldErrors((current) => ({ ...current, skillIds: undefined }))
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

  return (
    <form className="s4-projects-form" noValidate onSubmit={submit}>
      {formError ? (
        <div className="inline-alert s4-projects-form-alert" role="alert">
          <p>{formError}</p>
          <p>Your entered values are preserved. Review them before retrying.</p>
        </div>
      ) : null}

      <TextField
        error={fieldErrors.title}
        id="project-title"
        label="Title"
        maxLength={200}
        onChange={(event) => update('title', event.target.value)}
        ref={titleRef}
        value={values.title}
      />

      <div className="s4-projects-form-grid">
        <TextField
          error={fieldErrors.startDate}
          id="project-start-date"
          label="Start date"
          onChange={(event) => update('startDate', event.target.value)}
          placeholder=" "
          type="date"
          value={values.startDate}
        />
        <TextField
          disabled={isOngoing}
          error={fieldErrors.endDate}
          id="project-end-date"
          label="End date"
          min={values.startDate || undefined}
          onChange={(event) => update('endDate', event.target.value)}
          placeholder=" "
          ref={endDateRef}
          type="date"
          value={values.endDate}
        />
      </div>

      <Switch
        checked={isOngoing}
        label="This project is still in progress"
        onChange={(event) => {
          const checked = event.target.checked
          setIsOngoing(checked)
          if (checked && values.endDate) update('endDate', '')
        }}
      />

      <div className="s4-projects-form-grid">
        <TextField
          error={fieldErrors.repositoryUrl}
          id="project-repository-url"
          inputMode="url"
          label="Repository URL"
          onChange={(event) => update('repositoryUrl', event.target.value)}
          placeholder="https://github.com/..."
          type="url"
          value={values.repositoryUrl}
        />
        <TextField
          error={fieldErrors.demoUrl}
          id="project-demo-url"
          inputMode="url"
          label="Demo URL"
          onChange={(event) => update('demoUrl', event.target.value)}
          placeholder="https://example.com/..."
          type="url"
          value={values.demoUrl}
        />
      </div>

      <TextArea
        error={fieldErrors.description}
        id="project-description"
        label="Project abstract / high-level description"
        onChange={(event) => update('description', event.target.value)}
        rows={4}
        value={values.description}
      />

      <fieldset className="s4-projects-skills-fieldset" disabled={isPending}>
        <legend>Skills</legend>
        <p className="s4-projects-field-help">
          Search the system skill taxonomy and select the technologies used in this project.
        </p>
        <SearchBar
          aria-label="Search project taxonomy skills"
          disabled={taxonomy.isPending}
          onChange={(event) => setTaxonomySearch(event.target.value)}
          placeholder="Search taxonomy skills"
          value={taxonomySearch}
        />
        {taxonomy.data ? (
          <List aria-label="Taxonomy skill results" className="s4-projects-skill-results">
            {taxonomy.data.items.map((skill) => {
              const selected = values.skillIds.includes(skill.skillId)
              return (
                <ListItem
                  aria-disabled={selected || undefined}
                  aria-label={skill.name}
                  headline={skill.name}
                  interactive={!selected}
                  key={skill.skillId}
                  onClick={() => addSkill(skill.skillId)}
                  onKeyDown={(event) => {
                    if (selected) return
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      addSkill(skill.skillId)
                    }
                  }}
                  role="button"
                  supportingText={selected ? 'Already added' : skill.description}
                  trailing={
                    selected ? (
                      <span className="material-symbols-outlined" aria-hidden="true">
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined" aria-hidden="true">
                        add_circle
                      </span>
                    )
                  }
                />
              )
            })}
          </List>
        ) : null}
        {taxonomy.data && taxonomy.data.page.totalPages > 1 ? (
          <nav aria-label="Project taxonomy skills pagination" className="s4-projects-taxonomy-pagination">
            <Button
              disabled={taxonomyPage <= 0}
              onClick={() => setTaxonomyPage((current) => current - 1)}
              size="sm"
              type="button"
              variant="text"
            >
              Previous
            </Button>
            <span>
              Page {taxonomy.data.page.page + 1} of {taxonomy.data.page.totalPages}
            </span>
            <Button
              disabled={taxonomyPage >= taxonomy.data.page.totalPages - 1}
              onClick={() => setTaxonomyPage((current) => current + 1)}
              size="sm"
              type="button"
              variant="text"
            >
              Next
            </Button>
          </nav>
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
        <FormErrorMessage id="project-skillIds-error" message={fieldErrors.skillIds} />
      </fieldset>

      <Switch
        checked={values.includeInCv}
        label="Include this project in the CV"
        onChange={(event) => update('includeInCv', event.target.checked)}
      />

      <div className="s4-projects-form-footer">
        <Button disabled={isPending} onClick={onCancel} type="button" variant="text">
          Cancel
        </Button>
        <Button disabled={mode === 'edit' && !isDirty} isLoading={isPending} type="submit">
          {mode === 'create' ? 'Save' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
