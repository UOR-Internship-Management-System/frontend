import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { Button } from '../../../shared/components/ui/Button'
import type { CompetencyLevel, DeclaredSkill, SkillTaxonomyPath } from '../types/studentSkillTypes'
import { competencyLabel, SkillLevelSelect } from './SkillLevelSelect'

export function DeclaredSkillsTable({
  deletingId,
  items,
  onRemove,
  onUpdate,
  taxonomyPathsBySkillId,
  updatingId,
}: {
  items: DeclaredSkill[]
  taxonomyPathsBySkillId: ReadonlyMap<string, SkillTaxonomyPath[]>
  updatingId?: string
  deletingId?: string
  onUpdate: (item: DeclaredSkill, competencyLevel: CompetencyLevel) => Promise<void>
  onRemove: (item: DeclaredSkill) => void
}) {
  const [levels, setLevels] = useState<Record<string, CompetencyLevel>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setLevels((current) => {
      const next = { ...current }
      for (const item of items) next[item.declaredSkillId] ??= item.competencyLevel
      return next
    })
  }, [items])

  const update = async (item: DeclaredSkill) => {
    const competencyLevel = levels[item.declaredSkillId] ?? item.competencyLevel
    setErrors((current) => ({ ...current, [item.declaredSkillId]: '' }))
    try {
      await onUpdate(item, competencyLevel)
    } catch (reason) {
      setErrors((current) => ({
        ...current,
        [item.declaredSkillId]: mapApiError(reason, 'protected').message,
      }))
    }
  }

  return (
    <>
      <div className="s4-skills-table-wrap">
        <table className="s4-skills-table">
          <thead>
            <tr>
              <th scope="col">Core Cluster</th>
              <th scope="col">Skill Category</th>
              <th scope="col">Skill</th>
              <th scope="col">Competency</th>
              <th scope="col">Last updated</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const errorId = `declared-skill-${item.declaredSkillId}-error`
              const isUpdating = updatingId === item.declaredSkillId
              const paths = taxonomyPathsBySkillId.get(item.skillId) ?? []
              return (
                <tr key={item.declaredSkillId}>
                  <td>{taxonomyNames(paths, 'clusterName')}</td>
                  <td>{taxonomyNames(paths, 'categoryName')}</td>
                  <th scope="row">{item.skillName}</th>
                  <td>
                    <span className="visually-hidden">
                      Current competency: {competencyLabel(item.competencyLevel)}.
                    </span>
                    <SkillLevelSelect
                      disabled={isUpdating || deletingId === item.declaredSkillId}
                      errorId={errors[item.declaredSkillId] ? errorId : undefined}
                      id={`declared-skill-${item.declaredSkillId}-level`}
                      label={`Competency for ${item.skillName}`}
                      onChange={(level) => {
                        if (level)
                          setLevels((current) => ({ ...current, [item.declaredSkillId]: level }))
                      }}
                      value={levels[item.declaredSkillId] ?? item.competencyLevel}
                    />
                    {errors[item.declaredSkillId] ? (
                      <p className="error-text" id={errorId} role="alert">
                        {errors[item.declaredSkillId]}
                      </p>
                    ) : null}
                  </td>
                  <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div className="s4-skills-row-actions">
                      <Button
                        disabled={
                          (levels[item.declaredSkillId] ?? item.competencyLevel) ===
                          item.competencyLevel
                        }
                        isLoading={isUpdating}
                        onClick={() => void update(item)}
                        variant="secondary"
                      >
                        Update
                      </Button>
                      <Button
                        disabled={isUpdating || deletingId === item.declaredSkillId}
                        onClick={() => onRemove(item)}
                        variant="secondary"
                      >
                        Remove {item.skillName}
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div aria-label="Declared skills" className="s4-skills-mobile-list">
        {items.map((item) => {
          const isUpdating = updatingId === item.declaredSkillId
          const paths = taxonomyPathsBySkillId.get(item.skillId) ?? []
          return (
            <article className="s4-skills-mobile-card" key={item.declaredSkillId}>
              <h3>{item.skillName}</h3>
              <p>
                <span>Core Cluster</span>
                <strong>{taxonomyNames(paths, 'clusterName')}</strong>
              </p>
              <p>
                <span>Skill Category</span>
                <strong>{taxonomyNames(paths, 'categoryName')}</strong>
              </p>
              <p>
                <span>Current competency</span>
                <strong>{competencyLabel(item.competencyLevel)}</strong>
              </p>
              <label>
                <span>Change competency</span>
                <SkillLevelSelect
                  disabled={isUpdating || deletingId === item.declaredSkillId}
                  id={`mobile-declared-skill-${item.declaredSkillId}-level`}
                  label={`Mobile competency for ${item.skillName}`}
                  onChange={(level) => {
                    if (level)
                      setLevels((current) => ({ ...current, [item.declaredSkillId]: level }))
                  }}
                  value={levels[item.declaredSkillId] ?? item.competencyLevel}
                />
              </label>
              {errors[item.declaredSkillId] ? (
                <p className="error-text" role="alert">
                  {errors[item.declaredSkillId]}
                </p>
              ) : null}
              <div className="s4-skills-row-actions">
                <Button
                  disabled={
                    (levels[item.declaredSkillId] ?? item.competencyLevel) === item.competencyLevel
                  }
                  isLoading={isUpdating}
                  onClick={() => void update(item)}
                  variant="secondary"
                >
                  Update
                </Button>
                <Button onClick={() => onRemove(item)} variant="secondary">
                  Remove
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

function taxonomyNames(paths: SkillTaxonomyPath[], field: 'clusterName' | 'categoryName') {
  const names = [...new Set(paths.map((path) => path[field]))]
  return names.length ? names.join(', ') : 'Taxonomy context unavailable'
}
