import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SelectField } from '../../../shared/components/forms/SelectField'
import { TaxonomyResultsSkeleton } from '../../../shared/skeletons'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import {
  useIndividualSkills,
  useSkillCategories,
  useSkillClusters,
} from '../../../shared/skill-taxonomy'
import type { IndividualSkill } from '../../../shared/skill-taxonomy'

const skillPageSize = 6

export function SkillTaxonomyBrowser({
  declaredSkillIds,
  disabled,
  onSelect,
  selectionDisabled,
  selectedSkillId,
}: {
  declaredSkillIds: Set<string>
  disabled?: boolean
  selectionDisabled?: boolean
  onSelect: (skill: IndividualSkill) => void
  selectedSkillId?: string
}) {
  const [clusterId, setClusterId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  const clusters = useSkillClusters({ page: 0, size: 100, sort: 'name,asc' })
  const categories = useSkillCategories({
    page: 0,
    size: 100,
    sort: 'name,asc',
    clusterId: clusterId || undefined,
  })
  const skills = useIndividualSkills({
    page,
    size: skillPageSize,
    sort: 'name,asc',
    search: debouncedSearch || undefined,
    clusterId: clusterId || undefined,
    categoryId: categoryId || undefined,
  })

  useEffect(() => setPage(0), [clusterId, categoryId, debouncedSearch])

  const taxonomyError = clusters.error ?? categories.error ?? skills.error
  const mappedError = taxonomyError ? mapApiError(taxonomyError, 'protected') : null
  const isInitialLoading = clusters.isPending || categories.isPending || skills.isPending

  return (
    <section aria-labelledby="taxonomy-browser-title" className="s4-skills-taxonomy">
      <div className="s4-skills-section-heading">
        <div>
          <h2 id="taxonomy-browser-title">Available System Skills</h2>
          <p>Choose a canonical skill from the developer-managed taxonomy.</p>
        </div>
      </div>

      <div className="s4-skills-taxonomy-filters">
        <label>
          <span>Core Cluster</span>
          <SelectField
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
            aria-label="Search available skills"
            disabled={disabled}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search available skills"
            value={search}
          />
        </label>
      </div>

      {skills.isFetching && !skills.isPending ? (
        <p aria-live="polite">Updating available skills...</p>
      ) : null}
      <LoadingBoundary
        isLoading={isInitialLoading}
        label="Loading available skills"
        minHeight={360}
        skeleton={<TaxonomyResultsSkeleton />}
      >
        {mappedError ? (
          <ErrorState
            correlationId={mappedError.correlationId}
            message={mappedError.message}
            onAction={() =>
              void Promise.all([clusters.refetch(), categories.refetch(), skills.refetch()])
            }
            title="Skill taxonomy unavailable"
          />
        ) : skills.data?.items.length === 0 ? (
          <EmptyState
            message={
              search || clusterId || categoryId
                ? 'No available skills match the selected filters.'
                : 'No taxonomy skills are currently available.'
            }
            title={search || clusterId || categoryId ? 'No matching skills' : 'Taxonomy is empty'}
          />
        ) : skills.data?.items.length ? (
          <>
            <div className="s4-skills-results" role="list" aria-label="Available taxonomy skills">
              {skills.data.items.map((skill) => {
                const isDeclared = declaredSkillIds.has(skill.skillId)
                const isSelected = selectedSkillId === skill.skillId
                return (
                  <div key={skill.skillId} role="listitem">
                    <button
                      aria-pressed={isSelected}
                      className={`s4-skills-result ${isSelected ? 'is-selected' : ''}`}
                      disabled={disabled || selectionDisabled || isDeclared}
                      onClick={() => onSelect(skill)}
                      type="button"
                    >
                      <span>
                        <strong>{skill.name}</strong>
                        {skill.description ? <small>{skill.description}</small> : null}
                      </span>
                      <span className="s4-skills-result-status">
                        {isDeclared ? 'Already declared' : isSelected ? 'Selected' : 'Select'}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
            {skills.data.page.totalPages > 0 ? (
              <PaginationBar
                label="Available skills pagination"
                onPageChange={setPage}
                page={skills.data.page.page}
                size={skills.data.page.size}
                totalElements={skills.data.page.totalElements}
                totalPages={skills.data.page.totalPages}
              />
            ) : null}
          </>
        ) : null}
      </LoadingBoundary>
    </section>
  )
}
