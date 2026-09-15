import { useEffect, useMemo, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { M3SelectField } from '../../../shared/components/forms/M3SelectField'
import { Dialog } from '../../../shared/components/overlays/Dialog'
import { Button } from '../../../shared/components/ui/Button'
import { List, ListItem } from '../../../shared/components/ui/List'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { useIndividualSkills } from '../../../shared/skill-taxonomy'
import type { SkillTaxonomy } from '../../../shared/skill-taxonomy'

const pageSize = 12

export function AdditionalSkillsModal({
  onChange,
  onClose,
  requestSkillIds,
  selectedSkillIds,
  taxonomy,
}: {
  onChange: (skillIds: string[]) => void
  onClose: () => void
  requestSkillIds: string[]
  selectedSkillIds: string[]
  taxonomy: SkillTaxonomy
}) {
  const [search, setSearch] = useState('')
  const [clusterId, setClusterId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  const requestIds = useMemo(() => new Set(requestSkillIds), [requestSkillIds])
  const selectedIds = useMemo(() => new Set(selectedSkillIds), [selectedSkillIds])
  const categories = useMemo(
    () => taxonomy.clusters.find((cluster) => cluster.clusterId === clusterId)?.categories ?? [],
    [clusterId, taxonomy.clusters],
  )

  const skills = useIndividualSkills({
    page,
    size: pageSize,
    sort: 'name,asc',
    search: debouncedSearch || undefined,
    clusterId: clusterId || undefined,
    categoryId: categoryId || undefined,
  })
  const mappedError = skills.error ? mapApiError(skills.error, 'protected') : null
  const visible = skills.data?.items.filter((skill) => !requestIds.has(skill.skillId)) ?? []

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const resetPage = () => setPage(0)

  const addSkill = (skillId: string) => {
    if (selectedIds.has(skillId)) return
    onChange([...selectedSkillIds, skillId])
  }

  return (
    <Dialog
      adaptiveFullscreen
      description="Search globally or browse the canonical cluster and category hierarchy."
      isOpen
      onClose={onClose}
      size="large"
      title="Select additional declared skills"
      actions={
        <Button onClick={onClose}>Done</Button>
      }
    >
      <div className="cf-skills-modal">
        <label className="cf-modal-field">
          <span>Global taxonomy search</span>
          <SearchBar
            aria-label="Search additional declared skills"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search skill, category, or cluster"
            value={search}
          />
        </label>

        <div className="cf-skills-browse-grid">
          <M3SelectField
            className="cf-modal-field"
            label="Core cluster"
            aria-label="Additional skill cluster"
            onChange={(value) => {
              setClusterId(value)
              setCategoryId('')
              resetPage()
            }}
            value={clusterId}
            options={[
              { value: '', label: 'All clusters' },
              ...taxonomy.clusters.map((cluster) => ({
                value: cluster.clusterId,
                label: cluster.name,
              })),
            ]}
          />
          <M3SelectField
            className="cf-modal-field"
            label="Skill category"
            aria-label="Additional skill category"
            disabled={!clusterId}
            onChange={(value) => {
              setCategoryId(value)
              resetPage()
            }}
            value={categoryId}
            options={[
              {
                value: '',
                label: clusterId ? 'All categories' : 'Select a cluster first',
              },
              ...categories.map((category) => ({
                value: category.categoryId,
                label: category.name,
              })),
            ]}
          />
        </div>

        <div className="cf-skills-result-heading">
          <strong>{skills.data?.page.totalElements ?? 0} available skills</strong>
          <span>{selectedSkillIds.length} selected for this run</span>
        </div>

        {mappedError ? (
          <ErrorState
            correlationId={mappedError.correlationId}
            message={mappedError.message}
            onAction={() => void skills.refetch()}
            title="Skill taxonomy unavailable"
          />
        ) : (
          <List aria-label="Additional taxonomy skills" className="im-skill-results">
            {visible.map((skill) => {
              const selected = selectedIds.has(skill.skillId)
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
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {selected ? 'check_circle' : 'add_circle'}
                    </span>
                  }
                />
              )
            })}
            {visible.length === 0 ? (
              <p className="im-taxonomy-empty-result">No skills match the selected controls.</p>
            ) : null}
          </List>
        )}

        {skills.data && skills.data.page.totalPages > 1 ? (
          <nav aria-label="Additional skill result pages" className="im-skill-pagination">
            <Button
              disabled={page <= 0}
              onClick={() => setPage((current) => current - 1)}
              size="sm"
              type="button"
              variant="text"
            >
              Previous
            </Button>
            <span>
              Page {skills.data.page.page + 1} of {skills.data.page.totalPages}
            </span>
            <Button
              disabled={page >= skills.data.page.totalPages - 1}
              onClick={() => setPage((current) => current + 1)}
              size="sm"
              type="button"
              variant="text"
            >
              Next
            </Button>
          </nav>
        ) : null}
      </div>
    </Dialog>
  )
}
