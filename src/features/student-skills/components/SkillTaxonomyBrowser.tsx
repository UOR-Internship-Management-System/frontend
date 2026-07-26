import { useEffect, useMemo, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { TaxonomyResultsSkeleton } from '../../../shared/skeletons'
import { useIndividualSkills } from '../../../shared/skill-taxonomy'
import type { IndividualSkill, SkillTaxonomyPath } from '../../../shared/skill-taxonomy'

const availablePageSize = 9

export function SkillTaxonomyBrowser({
  declaredSkillIds,
  disabled,
  onSelect,
  search,
  selectionDisabled,
  selectedSkillId,
  taxonomyPathsBySkillId,
}: {
  declaredSkillIds: ReadonlySet<string>
  disabled?: boolean
  selectionDisabled?: boolean
  onSelect: (skill: IndividualSkill) => void
  search: string
  selectedSkillId?: string
  taxonomyPathsBySkillId: ReadonlyMap<string, SkillTaxonomyPath[]>
}) {
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const skills = useIndividualSkills({
    page,
    size: availablePageSize,
    sort: 'name,asc',
    search: debouncedSearch || undefined,
  })

  useEffect(() => setPage(0), [debouncedSearch])

  const mappedError = skills.error ? mapApiError(skills.error, 'protected') : null
  const resultCount = skills.data?.page.totalElements ?? 0

  return (
    <section aria-labelledby="taxonomy-browser-title" className="s4-skills-taxonomy">
      <div className="s4-skills-section-heading">
        <div>
          <h2 id="taxonomy-browser-title">Available System Skills</h2>
          <p>Search results are filtered here. Select a card to fill the taxonomy fields above.</p>
        </div>
        <span aria-live="polite" className="s4-skills-count-chip">
          {skills.isPending ? 'Loading skills' : `${resultCount} skills`}
        </span>
      </div>

      {skills.isFetching && !skills.isPending ? (
        <p aria-live="polite" className="s4-skills-loading-note">
          Updating available skills...
        </p>
      ) : null}
      <LoadingBoundary
        isLoading={skills.isPending}
        label="Loading available skills"
        minHeight={460}
        skeleton={<TaxonomyResultsSkeleton />}
      >
        {mappedError ? (
          <ErrorState
            correlationId={mappedError.correlationId}
            message={mappedError.message}
            onAction={() => void skills.refetch()}
            title="Skill taxonomy unavailable"
          />
        ) : skills.data?.items.length === 0 ? (
          <EmptyState
            message={
              search
                ? 'No available system skills match your search.'
                : 'No taxonomy skills are currently available.'
            }
            title={search ? 'No matching skills' : 'Taxonomy is empty'}
          />
        ) : skills.data?.items.length ? (
          <>
            <div className="s4-skills-results" role="list" aria-label="Available taxonomy skills">
              {skills.data.items.map((skill) => (
                <SkillResultCard
                  declared={declaredSkillIds.has(skill.skillId)}
                  disabled={disabled || selectionDisabled}
                  key={skill.skillId}
                  onSelect={onSelect}
                  paths={taxonomyPathsBySkillId.get(skill.skillId) ?? []}
                  selected={selectedSkillId === skill.skillId}
                  skill={skill}
                />
              ))}
            </div>
            <PaginationBar
              label="Available skills pagination"
              onPageChange={setPage}
              page={skills.data.page.page}
              size={skills.data.page.size}
              totalElements={skills.data.page.totalElements}
              totalPages={skills.data.page.totalPages}
            />
          </>
        ) : null}
      </LoadingBoundary>
    </section>
  )
}

function SkillResultCard({
  declared,
  disabled,
  onSelect,
  paths,
  selected,
  skill,
}: {
  declared: boolean
  disabled?: boolean
  onSelect: (skill: IndividualSkill) => void
  paths: SkillTaxonomyPath[]
  selected: boolean
  skill: IndividualSkill
}) {
  const clusterNames = useMemo(() => uniqueNames(paths, 'clusterName'), [paths])
  const categoryNames = useMemo(() => uniqueNames(paths, 'categoryName'), [paths])
  const clusterLabel = clusterNames.length
    ? clusterNames.join(', ')
    : 'Taxonomy cluster unavailable'
  const categoryLabel = categoryNames.length
    ? categoryNames.join(', ')
    : 'Taxonomy category unavailable'

  return (
    <div role="listitem">
      <button
        aria-label={`${skill.name}. ${categoryLabel}. ${declared ? 'Already declared.' : selected ? 'Selected.' : 'Select skill.'}`}
        aria-pressed={selected}
        className={`s4-skills-result ${selected ? 'is-selected' : ''}`}
        disabled={disabled || declared}
        onClick={() => onSelect(skill)}
        type="button"
      >
        <span className="s4-skills-cluster-chip">{clusterLabel}</span>
        <strong>{skill.name}</strong>
        <span className="s4-skills-result-footer">
          <small>{categoryLabel}</small>
          {declared ? <span className="s4-skills-result-status">Already declared</span> : null}
          {!declared && selected ? <span className="s4-skills-result-status">Selected</span> : null}
        </span>
      </button>
    </div>
  )
}

function uniqueNames(paths: SkillTaxonomyPath[], field: 'clusterName' | 'categoryName') {
  return [...new Set(paths.map((path) => path[field]))]
}
