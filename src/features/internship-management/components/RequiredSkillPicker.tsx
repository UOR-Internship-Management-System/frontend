import { useEffect, useState } from 'react'
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

const pageSize = 6

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
  const categories = useSkillCategories({
    page: 0,
    size: 100,
    sort: 'name,asc',
    clusterId: clusterId || undefined,
  })
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
      <legend>Required skills</legend>
      <p>Select canonical taxonomy skills and optionally set the required competency.</p>
      <div className="request-skill-filters">
        <label>
          <span>Core Cluster</span>
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
          <span>Skill Category</span>
          <SelectField
            aria-label="Required skill category"
            disabled={disabled || categories.isPending}
            onChange={(event) => setCategoryId(event.target.value)}
            value={categoryId}
          >
            <option value="">All categories</option>
            {categories.data?.items.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </SelectField>
        </label>
        <label>
          <span>Individual Skill</span>
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
          className="request-skill-results"
          role="list"
        >
          {skills.data?.items.map((skill) => {
            const selected = selectedIds.has(skill.skillId)
            return (
              <div key={skill.skillId} role="listitem">
                <button
                  className="request-skill-result"
                  disabled={disabled || selected}
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
                  type="button"
                >
                  <span>
                    <strong>{skill.name}</strong>
                    {skill.description ? <small>{skill.description}</small> : null}
                  </span>
                  <span>{selected ? 'Selected' : 'Add skill'}</span>
                </button>
              </div>
            )
          })}
        </div>
      )}
      {skills.data && skills.data.page.totalPages > 0 ? (
        <PaginationBar
          label="Required skill pages"
          onPageChange={setPage}
          page={skills.data.page.page}
          size={skills.data.page.size}
          totalElements={skills.data.page.totalElements}
          totalPages={skills.data.page.totalPages}
        />
      ) : null}

      <div aria-label="Selected required skills" className="request-selected-skills" role="list">
        {value.map((skill) => (
          <div className="request-selected-skill" key={skill.skillId} role="listitem">
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
            <Button
              disabled={disabled}
              onClick={() => onChange(value.filter((item) => item.skillId !== skill.skillId))}
              variant="secondary"
            >
              Remove
            </Button>
          </div>
        ))}
        {value.length === 0 ? <p>No required skills selected.</p> : null}
      </div>
    </fieldset>
  )
}
