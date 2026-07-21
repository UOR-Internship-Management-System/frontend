import { useEffect, useMemo, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SelectField } from '../../../shared/components/forms/SelectField'
import { Button } from '../../../shared/components/ui/Button'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import {
  useIndividualSkills,
  useSkillCategories,
  useSkillClusters,
} from '../../../shared/skill-taxonomy'
import type { RequiredSkillSelection } from '../types/internshipManagementTypes'

const pageSize = 20

export function RequiredSkillPicker({
  disabled,
  onChange,
  value,
}: {
  disabled?: boolean
  onChange: (skills: RequiredSkillSelection[]) => void
  value: RequiredSkillSelection[]
}) {
  const [clusterId, setClusterId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [stagedSkills, setStagedSkills] = useState<RequiredSkillSelection[]>([])
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const selectedIds = useMemo(() => new Set(value.map((skill) => skill.skillId)), [value])
  const stagedIds = useMemo(
    () => new Set(stagedSkills.map((skill) => skill.skillId)),
    [stagedSkills],
  )

  const clusters = useSkillClusters({ page: 0, size: 100, sort: 'name,asc' })
  const categories = useSkillCategories(
    {
      page: 0,
      size: 100,
      sort: 'name,asc',
      clusterId: clusterId || undefined,
    },
    Boolean(clusterId),
  )
  const skills = useIndividualSkills({
    page,
    size: pageSize,
    sort: 'name,asc',
    search: debouncedSearch || undefined,
    clusterId: clusterId || undefined,
    categoryId: categoryId || undefined,
  })

  const activeClusterName =
    clusters.data?.items.find((cluster) => cluster.clusterId === clusterId)?.name ??
    'All clusters'
  const activeCategoryName =
    categories.data?.items.find((category) => category.categoryId === categoryId)?.name ??
    (clusterId ? 'All categories' : 'Global search')

  useEffect(() => {
    setPage(0)
    setStagedSkills([])
  }, [categoryId, clusterId, debouncedSearch])

  const taxonomyError = clusters.error ?? categories.error ?? skills.error
  const mappedError = taxonomyError ? mapApiError(taxonomyError, 'protected') : null
  const visibleAvailableSkills = (skills.data?.items ?? []).filter(
    (skill) => !selectedIds.has(skill.skillId),
  )

  const toggleStagedSkill = (skill: { skillId: string; name: string }) => {
    if (selectedIds.has(skill.skillId)) return
    setStagedSkills((current) =>
      current.some((item) => item.skillId === skill.skillId)
        ? current.filter((item) => item.skillId !== skill.skillId)
        : [
            ...current,
            {
              skillId: skill.skillId,
              skillName: skill.name,
              requiredCompetencyLevel: null,
            },
          ],
    )
  }

  const selectAllShown = () => {
    setStagedSkills((current) => {
      const byId = new Map(current.map((skill) => [skill.skillId, skill]))
      for (const skill of visibleAvailableSkills) {
        byId.set(skill.skillId, {
          skillId: skill.skillId,
          skillName: skill.name,
          requiredCompetencyLevel: null,
        })
      }
      return [...byId.values()]
    })
  }

  const addSelectedSkills = () => {
    if (!stagedSkills.length) return
    const newSkills = stagedSkills.filter((skill) => !selectedIds.has(skill.skillId))
    onChange([...value, ...newSkills])
    setStagedSkills([])
  }

  return (
    <fieldset
      aria-describedby="required-skills-help"
      className="request-skill-picker"
      disabled={disabled}
    >
      <legend>Required Technical Skills</legend>
      <p id="required-skills-help">
        Browse the developer-managed taxonomy. Select one or more results, then add them to
        the compiled matching array.
      </p>

      <div className="request-skill-filters">
        <label>
          <span>Target Core Cluster — Level 1</span>
          <SelectField
            aria-label="Required skill core cluster"
            disabled={disabled || clusters.isPending}
            onChange={(event) => {
              setClusterId(event.target.value)
              setCategoryId('')
            }}
            value={clusterId}
          >
            <option value="">All clusters — global search</option>
            {clusters.data?.items.map((cluster) => (
              <option key={cluster.clusterId} value={cluster.clusterId}>
                {cluster.name}
              </option>
            ))}
          </SelectField>
        </label>

        <label>
          <span>Target Core Category — Level 2</span>
          <SelectField
            aria-label="Required skill category"
            disabled={disabled || !clusterId || categories.isPending}
            onChange={(event) => setCategoryId(event.target.value)}
            value={categoryId}
          >
            <option value="">{clusterId ? 'All categories' : 'Select a cluster first'}</option>
            {categories.data?.items.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </SelectField>
        </label>

        <label className="request-skill-search-field">
          <span>Search and add multiple skills</span>
          <SearchInput
            aria-label="Search required skills"
            disabled={disabled}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Type a skill, category, or technology"
            value={search}
          />
        </label>
      </div>

      <div className="taxonomy-context-line" aria-live="polite">
        <span>{activeClusterName}</span>
        <span aria-hidden="true">›</span>
        <span>{activeCategoryName}</span>
      </div>

      {mappedError ? (
        <ErrorState
          correlationId={mappedError.correlationId}
          message={mappedError.message}
          onAction={() =>
            void Promise.all([clusters.refetch(), categories.refetch(), skills.refetch()])
          }
          title="Skill taxonomy unavailable"
        />
      ) : (
        <div className="hierarchy-skill-panel">
          <div className="hierarchy-skill-panel-header">
            <div>
              <strong className="hierarchy-skill-title">Available taxonomy skills</strong>
              <span className="hierarchy-skill-subtitle">
                {stagedSkills.length} staged. Already-added skills are unavailable for duplicate
                selection.
              </span>
            </div>
            <div className="hierarchy-skill-actions">
              <Button
                disabled={disabled || visibleAvailableSkills.length === 0}
                onClick={selectAllShown}
                type="button"
                variant="secondary"
              >
                Select all shown
              </Button>
              <Button
                disabled={disabled || stagedSkills.length === 0}
                onClick={() => setStagedSkills([])}
                type="button"
                variant="secondary"
              >
                Clear selection
              </Button>
              <Button
                disabled={disabled || stagedSkills.length === 0}
                onClick={addSelectedSkills}
                type="button"
              >
                Add selected skills
              </Button>
            </div>
          </div>

          <div
            aria-label="Required skill search results"
            className="hierarchy-skill-list"
            role="group"
          >
            {skills.data?.items.map((skill) => {
              const alreadyAdded = selectedIds.has(skill.skillId)
              const staged = stagedIds.has(skill.skillId)
              return (
                <label
                  className={`hierarchy-skill-option ${
                    alreadyAdded ? 'hierarchy-skill-option-disabled' : ''
                  }`.trim()}
                  key={skill.skillId}
                >
                  <input
                    aria-label={`Select ${skill.name}`}
                    checked={alreadyAdded || staged}
                    disabled={disabled || alreadyAdded}
                    onChange={() => toggleStagedSkill(skill)}
                    type="checkbox"
                  />
                  <span className="hierarchy-skill-option-main">
                    <span className="hierarchy-skill-option-name">{skill.name}</span>
                    <span className="hierarchy-skill-option-meta">
                      {alreadyAdded
                        ? 'Already added'
                        : skill.description || `${activeClusterName} · ${activeCategoryName}`}
                    </span>
                  </span>
                </label>
              )
            })}
            {skills.data?.items.length === 0 ? (
              <p className="taxonomy-empty-result">No taxonomy skills match these controls.</p>
            ) : null}
          </div>
        </div>
      )}

      {skills.data && skills.data.page.totalPages > 1 ? (
        <PaginationBar
          label="Required skill pages"
          onPageChange={setPage}
          page={skills.data.page.page}
          size={skills.data.page.size}
          totalElements={skills.data.page.totalElements}
          totalPages={skills.data.page.totalPages}
        />
      ) : null}

      <div className="selected-skill-token-field">
        <div className="selected-skill-token-heading">
          <strong>Required Technical Skills — Compiled Matching Array</strong>
          <span>{value.length} selected</span>
        </div>
        <div aria-label="Selected required skills" className="selected-skill-token-list" role="list">
          {value.map((skill) => (
            <div className="selected-skill-token" key={skill.skillId} role="listitem">
              <strong>{skill.skillName}</strong>
              <SelectField
                aria-label={`Required competency for ${skill.skillName}`}
                disabled={disabled}
                onChange={(event) =>
                  onChange(
                    value.map((item) =>
                      item.skillId === skill.skillId
                        ? {
                            ...item,
                            requiredCompetencyLevel: (event.target.value ||
                              null) as RequiredSkillSelection['requiredCompetencyLevel'],
                          }
                        : item,
                    ),
                  )
                }
                value={skill.requiredCompetencyLevel ?? ''}
              >
                <option value="">Any competency</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </SelectField>
              <button
                aria-label={`Remove ${skill.skillName}`}
                className="skill-token-remove"
                disabled={disabled}
                onClick={() => onChange(value.filter((item) => item.skillId !== skill.skillId))}
                type="button"
              >
                ×
              </button>
            </div>
          ))}
          {value.length === 0 ? (
            <p className="selected-skills-empty">No required skills selected yet.</p>
          ) : null}
        </div>
      </div>
    </fieldset>
  )
}