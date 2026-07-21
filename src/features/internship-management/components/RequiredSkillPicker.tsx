import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SelectField } from '../../../shared/components/forms/SelectField'
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
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const selectedIds = new Set(value.map((skill) => skill.skillId))
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

  useEffect(() => setPage(0), [categoryId, clusterId, debouncedSearch])

  const taxonomyError = clusters.error ?? categories.error ?? skills.error
  const mappedError = taxonomyError ? mapApiError(taxonomyError, 'protected') : null

  return (
    <fieldset className="request-skill-picker" disabled={disabled}>
      <legend>Required technical skills</legend>
      <p>
        Browse the canonical taxonomy, add one or more skills, and optionally set the required
        competency level.
      </p>

      <div className="request-skill-filters">
        <label>
          <span>Core cluster</span>
          <SelectField
            aria-label="Required skill core cluster"
            disabled={disabled || clusters.isPending}
            onChange={(event) => {
              setClusterId(event.target.value)
              setCategoryId('')
            }}
            value={clusterId}
          >
            <option value="">All clusters</option>
            {clusters.data?.items.map((cluster) => (
              <option key={cluster.clusterId} value={cluster.clusterId}>
                {cluster.name}
              </option>
            ))}
          </SelectField>
        </label>
        <label>
          <span>Skill category</span>
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
          <span>Search individual skills</span>
          <SearchInput
            aria-label="Search required skills"
            disabled={disabled}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search taxonomy skills"
            value={search}
          />
        </label>
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
        <div
          aria-label="Required skill search results"
          className="request-skill-results-compact"
          role="listbox"
        >
          {skills.data?.items.map((skill) => {
            const selected = selectedIds.has(skill.skillId)
            return (
              <button
                aria-selected={selected}
                className={`taxonomy-option-row ${selected ? 'taxonomy-option-selected' : ''}`}
                disabled={disabled || selected}
                key={skill.skillId}
                onClick={() =>
                  onChange([
                    ...value,
                    {
                      skillId: skill.skillId,
                      skillName: skill.name,
                      requiredCompetencyLevel: null,
                    },
                  ])
                }
                role="option"
                type="button"
              >
                <span>
                  <strong>{skill.name}</strong>
                  {skill.description ? <small>{skill.description}</small> : null}
                </span>
                <span>{selected ? 'Selected' : 'Add'}</span>
              </button>
            )
          })}
          {skills.data?.items.length === 0 ? (
            <p className="taxonomy-empty-result">No taxonomy skills match these controls.</p>
          ) : null}
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
          <strong>Selected skills</strong>
          <span>{value.length} selected</span>
        </div>
        <div
          aria-label="Selected required skills"
          className="selected-skill-token-list"
          role="list"
        >
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
          {value.length === 0 ? <p>No required skills selected.</p> : null}
        </div>
      </div>
    </fieldset>
  )
}