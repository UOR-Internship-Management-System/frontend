import { useMemo, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { Button } from '../../../shared/components/ui/Button'
import { indexSkillTaxonomy, useSkillTaxonomyTree } from '../../../shared/skill-taxonomy'
import type { InternshipRequiredSkill } from '../../internship-management/types/internshipManagementTypes'

function label(value: string | null) {
  return value ? value.charAt(0) + value.slice(1).toLowerCase() : 'Any declared level'
}

export function DeclaredSkillFilterPanel({
  additionalSkillIds,
  disabled,
  onAdditionalSkillIdsChange,
  onRequestSkillIdsChange,
  requestSkillIds,
  requestSkills,
}: {
  additionalSkillIds: string[]
  disabled?: boolean
  onAdditionalSkillIdsChange: (skillIds: string[]) => void
  onRequestSkillIdsChange: (skillIds: string[]) => void
  requestSkillIds: string[]
  requestSkills: InternshipRequiredSkill[]
}) {
  const [search, setSearch] = useState('')
  const taxonomy = useSkillTaxonomyTree()
  const index = useMemo(
    () => (taxonomy.data ? indexSkillTaxonomy(taxonomy.data) : null),
    [taxonomy.data],
  )
  const availableSkills = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase()
    return [...(index?.skillsById.values() ?? [])]
      .filter((skill) => !normalized || skill.name.toLocaleLowerCase().includes(normalized))
      .filter((skill) => !requestSkills.some((required) => required.skillId === skill.skillId))
      .slice(0, 12)
  }, [index, requestSkills, search])
  const mappedError = taxonomy.error ? mapApiError(taxonomy.error, 'protected') : null

  const toggleRequestSkill = (skillId: string) => {
    onRequestSkillIdsChange(
      requestSkillIds.includes(skillId)
        ? requestSkillIds.filter((current) => current !== skillId)
        : [...requestSkillIds, skillId],
    )
  }

  return (
    <div className="declared-skill-filter-panel">
      <fieldset disabled={disabled}>
        <legend>Request-required skills</legend>
        <p>Choose which requirements from the selected request apply to this run.</p>
        <div className="filtering-request-skills">
          {requestSkills.map((skill) => (
            <label key={skill.skillId}>
              <input
                checked={requestSkillIds.includes(skill.skillId)}
                onChange={() => toggleRequestSkill(skill.skillId)}
                type="checkbox"
              />
              <span>
                <strong>{skill.skillName}</strong>
                <small>{label(skill.requiredCompetencyLevel)}</small>
              </span>
            </label>
          ))}
          {requestSkills.length === 0 ? <p>No required skills on this request.</p> : null}
        </div>
      </fieldset>

      <fieldset disabled={disabled}>
        <legend>Additional declared skills</legend>
        <p>Add developer-managed taxonomy skills for this filtering run only.</p>
        <SearchInput
          aria-label="Search additional taxonomy skills"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search taxonomy"
          value={search}
        />
        {mappedError ? (
          <ErrorState
            correlationId={mappedError.correlationId}
            message={mappedError.message}
            onAction={() => void taxonomy.refetch()}
            title="Skill taxonomy unavailable"
          />
        ) : (
          <div
            aria-label="Additional skill options"
            className="filtering-skill-options"
            role="list"
          >
            {availableSkills.map((skill) => {
              const selected = additionalSkillIds.includes(skill.skillId)
              return (
                <button
                  aria-pressed={selected}
                  className="request-skill-result"
                  key={skill.skillId}
                  onClick={() =>
                    onAdditionalSkillIdsChange(
                      selected
                        ? additionalSkillIds.filter((current) => current !== skill.skillId)
                        : [...additionalSkillIds, skill.skillId],
                    )
                  }
                  type="button"
                >
                  <strong>{skill.name}</strong>
                  <span>{selected ? 'Selected' : 'Add skill'}</span>
                </button>
              )
            })}
          </div>
        )}
        {additionalSkillIds.length ? (
          <div aria-label="Selected additional skills" className="filtering-selected-skills">
            {additionalSkillIds.map((skillId) => (
              <div key={skillId}>
                <span>{index?.skillsById.get(skillId)?.name ?? 'Selected taxonomy skill'}</span>
                <Button
                  onClick={() =>
                    onAdditionalSkillIdsChange(
                      additionalSkillIds.filter((current) => current !== skillId),
                    )
                  }
                  variant="secondary"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </fieldset>
    </div>
  )
}
