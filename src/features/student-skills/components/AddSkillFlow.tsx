import { useEffect, useMemo, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { FormErrorMessage } from '../../../shared/components/forms/FormErrorMessage'
import { Button } from '../../../shared/components/ui/Button'
import { Chip } from '../../../shared/components/ui/Chip'
import { List, ListItem } from '../../../shared/components/ui/List'
import { SegmentedButton } from '../../../shared/components/ui/SegmentedButton'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { SkeletonListRows, SkeletonStatusRegion } from '../../../shared/skeletons'
import { useIndividualSkills } from '../../../shared/skill-taxonomy'
import type { IndividualSkill, SkillTaxonomy } from '../../../shared/skill-taxonomy'
import { competencyOptions } from '../utils/competency'
import type { CompetencyLevel } from '../types/studentSkillTypes'

const resultsPageSize = 8

export function AddSkillFlow({
  declaredSkillIds,
  isPending,
  onSubmit,
  taxonomy,
}: {
  taxonomy: SkillTaxonomy
  declaredSkillIds: ReadonlySet<string>
  isPending: boolean
  onSubmit: (skill: IndividualSkill, competencyLevel: CompetencyLevel) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [clusterId, setClusterId] = useState<string>()
  const [categoryId, setCategoryId] = useState<string>()
  const [selectedSkill, setSelectedSkill] = useState<IndividualSkill | null>(null)
  const [competencyLevel, setCompetencyLevel] = useState<CompetencyLevel>('BEGINNER')
  const [page, setPage] = useState(0)
  const [error, setError] = useState<string>()
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  useEffect(() => setPage(0), [debouncedSearch, clusterId, categoryId])

  const categories = useMemo(
    () => taxonomy.clusters.find((cluster) => cluster.clusterId === clusterId)?.categories ?? [],
    [clusterId, taxonomy.clusters],
  )

  const results = useIndividualSkills({
    page,
    size: resultsPageSize,
    sort: 'name,asc',
    search: debouncedSearch || undefined,
    clusterId,
    categoryId,
  })
  const mappedError = results.error ? mapApiError(results.error, 'protected') : null

  const submit = async () => {
    if (!selectedSkill) return
    setError(undefined)
    try {
      await onSubmit(selectedSkill, competencyLevel)
      setSelectedSkill(null)
      setCompetencyLevel('BEGINNER')
    } catch (reason) {
      setError(mapApiError(reason, 'protected').message)
    }
  }

  return (
    <div className="s4-skills-add-flow">
      <SearchBar
        aria-label="Search system skills"
        disabled={isPending}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search system skills"
        value={search}
      />

      <div aria-label="Filter by core cluster" className="s4-skills-filter-row" role="group">
        {taxonomy.clusters.map((cluster) => (
          <Chip
            key={cluster.clusterId}
            onClick={() => {
              setClusterId(clusterId === cluster.clusterId ? undefined : cluster.clusterId)
              setCategoryId(undefined)
            }}
            selected={clusterId === cluster.clusterId}
            variant="filter"
          >
            {cluster.name}
          </Chip>
        ))}
      </div>

      {categories.length > 0 ? (
        <div aria-label="Filter by skill category" className="s4-skills-filter-row" role="group">
          {categories.map((category) => (
            <Chip
              key={category.categoryId}
              onClick={() =>
                setCategoryId(categoryId === category.categoryId ? undefined : category.categoryId)
              }
              selected={categoryId === category.categoryId}
              variant="filter"
            >
              {category.name}
            </Chip>
          ))}
        </div>
      ) : null}

      <LoadingBoundary
        isLoading={results.isPending}
        label="Loading system skills"
        minHeight={280}
        skeleton={
          <SkeletonStatusRegion label="Loading system skills">
            <SkeletonListRows count={8} showActions={false} />
          </SkeletonStatusRegion>
        }
      >
        {mappedError ? (
          <ErrorState
            correlationId={mappedError.correlationId}
            message={mappedError.message}
            onAction={() => void results.refetch()}
            title="System skills unavailable"
          />
        ) : results.data?.items.length === 0 ? (
          <EmptyState
            message="No system skills match your search or filters."
            title="No matching skills"
          />
        ) : results.data ? (
          <>
            <List aria-label="Search results">
              {results.data.items.map((skill) => {
                const declared = declaredSkillIds.has(skill.skillId)
                const selected = selectedSkill?.skillId === skill.skillId
                return (
                  <ListItem
                    aria-disabled={declared || undefined}
                    aria-label={skill.name}
                    aria-pressed={selected}
                    className={selected ? 'm3-list-item--selected' : ''}
                    headline={skill.name}
                    interactive={!declared}
                    key={skill.skillId}
                    onClick={() => {
                      if (declared) return
                      setSelectedSkill(skill)
                      setError(undefined)
                    }}
                    onKeyDown={(event) => {
                      if (declared) return
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setSelectedSkill(skill)
                        setError(undefined)
                      }
                    }}
                    role="button"
                    supportingText={declared ? 'Already declared' : skill.description}
                    trailing={
                      declared ? (
                        <span className="s4-skills-declared-tag">Declared</span>
                      ) : selected ? (
                        <span className="material-symbols-outlined" aria-hidden="true">
                          check_circle
                        </span>
                      ) : null
                    }
                  />
                )
              })}
            </List>
            {results.data.page.totalPages > 1 ? (
              <nav aria-label="Search results pagination" className="s4-skills-add-pagination">
                <Button
                  disabled={page <= 0}
                  onClick={() => setPage((current) => current - 1)}
                  size="sm"
                  variant="text"
                >
                  Previous
                </Button>
                <span>
                  Page {page + 1} of {results.data.page.totalPages}
                </span>
                <Button
                  disabled={page >= results.data.page.totalPages - 1}
                  onClick={() => setPage((current) => current + 1)}
                  size="sm"
                  variant="text"
                >
                  Next
                </Button>
              </nav>
            ) : null}
          </>
        ) : null}
      </LoadingBoundary>

      {selectedSkill ? (
        <div className="s4-skills-competency-picker">
          <p className="s4-skills-competency-picker-label">
            Competency level for <strong>{selectedSkill.name}</strong>
          </p>
          <SegmentedButton
            ariaLabel="Competency level"
            onChange={setCompetencyLevel}
            options={competencyOptions}
            value={competencyLevel}
          />
        </div>
      ) : null}

      <FormErrorMessage id="add-skill-error" message={error} />

      <div className="s4-skills-add-actions">
        <Button
          disabled={!selectedSkill}
          isLoading={isPending}
          onClick={() => void submit()}
          type="button"
        >
          Add skill
        </Button>
      </div>
    </div>
  )
}
