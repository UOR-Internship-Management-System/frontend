import { useMemo, useState } from 'react'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { M3SelectField } from '../../../shared/components/forms/M3SelectField'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import type { SkillTaxonomy } from '../../../shared/skill-taxonomy'

const pageSize = 12

type SkillOption = {
  skillId: string
  name: string
  description?: string | null
  clusterId: string
  clusterName: string
  categoryId: string
  categoryName: string
}

function flattenTaxonomy(taxonomy: SkillTaxonomy) {
  const byId = new Map<string, SkillOption>()
  for (const cluster of taxonomy.clusters) {
    for (const category of cluster.categories ?? []) {
      for (const skill of category.skills ?? []) {
        if (!byId.has(skill.skillId)) {
          byId.set(skill.skillId, {
            ...skill,
            clusterId: cluster.clusterId,
            clusterName: cluster.name,
            categoryId: category.categoryId,
            categoryName: category.name,
          })
        }
      }
    }
  }
  return [...byId.values()].sort((left, right) => left.name.localeCompare(right.name))
}

export function AdditionalSkillsModal({
  onApply,
  onClose,
  requestSkillIds,
  selectedSkillIds,
  taxonomy,
}: {
  onApply: (skillIds: string[]) => void
  onClose: () => void
  requestSkillIds: string[]
  selectedSkillIds: string[]
  taxonomy: SkillTaxonomy
}) {
  const [search, setSearch] = useState('')
  const [clusterId, setClusterId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(0)
  const [staged, setStaged] = useState(() => new Set(selectedSkillIds))

  const allSkills = useMemo(() => flattenTaxonomy(taxonomy), [taxonomy])
  const requestIds = useMemo(() => new Set(requestSkillIds), [requestSkillIds])
  const categories = useMemo(
    () => taxonomy.clusters.find((cluster) => cluster.clusterId === clusterId)?.categories ?? [],
    [clusterId, taxonomy.clusters],
  )
  const filtered = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase()
    return allSkills.filter(
      (skill) =>
        !requestIds.has(skill.skillId) &&
        (!clusterId || skill.clusterId === clusterId) &&
        (!categoryId || skill.categoryId === categoryId) &&
        (!normalized ||
          `${skill.name} ${skill.clusterName} ${skill.categoryName}`
            .toLocaleLowerCase()
            .includes(normalized)),
    )
  }, [allSkills, categoryId, clusterId, requestIds, search])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const safePage = Math.min(page, Math.max(0, totalPages - 1))
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize)

  const resetPage = () => setPage(0)

  return (
    <Modal
      description="Search globally or browse the canonical cluster and category hierarchy."
      onClose={onClose}
      size="wide"
      title="Select additional declared skills"
    >
      <div className="cf-skills-modal">
        <label className="cf-modal-field">
          <span>Global taxonomy search</span>
          <SearchBar
            aria-label="Search additional declared skills"
            onChange={(event) => {
              setSearch(event.target.value)
              resetPage()
            }}
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
          <strong>{filtered.length} available skills</strong>
          <span>{staged.size} selected for this run</span>
        </div>

        <div
          aria-label="Additional taxonomy skills"
          className="cf-skills-options"
          role="list"
        >
          {visible.map((skill) => {
            const checked = staged.has(skill.skillId)
            return (
              <label
                className={checked ? 'cf-skill-option cf-skill-option--selected' : 'cf-skill-option'}
                key={skill.skillId}
              >
                <input
                  checked={checked}
                  onChange={() => {
                    setStaged((current) => {
                      const next = new Set(current)
                      if (next.has(skill.skillId)) next.delete(skill.skillId)
                      else next.add(skill.skillId)
                      return next
                    })
                  }}
                  type="checkbox"
                />
                <span>
                  <strong>{skill.name}</strong>
                  <small>
                    {skill.clusterName} · {skill.categoryName}
                  </small>
                  {skill.description ? <small>{skill.description}</small> : null}
                </span>
              </label>
            )
          })}
          {visible.length === 0 ? (
            <p className="cf-taxonomy-empty-result">No skills match the selected controls.</p>
          ) : null}
        </div>

        {totalPages > 1 ? (
          <div className="cf-modal-pagination" aria-label="Additional skill result pages">
            <span>
              Page {safePage + 1} of {totalPages}
            </span>
            <div>
              <Button
                disabled={safePage === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                size="sm"
                variant="outlined"
              >
                Previous
              </Button>
              <Button
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                size="sm"
                variant="outlined"
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}

        <div className="modal-actions">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onApply([...staged])
              onClose()
            }}
          >
            Apply selected skills
          </Button>
        </div>
      </div>
    </Modal>
  )
}
