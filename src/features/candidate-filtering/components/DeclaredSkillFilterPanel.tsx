import { useMemo, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { Button } from '../../../shared/components/ui/Button'
import { Chip } from '../../../shared/components/ui/Chip'
import { indexSkillTaxonomy, useSkillTaxonomyTree } from '../../../shared/skill-taxonomy'
import type { InternshipRequiredSkill } from '../../internship-management/types/internshipManagementTypes'
import { AdditionalSkillsModal } from './AdditionalSkillsModal'

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
  const [modalOpen, setModalOpen] = useState(false)
  const taxonomy = useSkillTaxonomyTree()
  const index = useMemo(
    () => (taxonomy.data ? indexSkillTaxonomy(taxonomy.data) : null),
    [taxonomy.data],
  )
  const mappedError = taxonomy.error ? mapApiError(taxonomy.error, 'protected') : null

  const toggleRequestSkill = (skillId: string) => {
    onRequestSkillIdsChange(
      requestSkillIds.includes(skillId)
        ? requestSkillIds.filter((current) => current !== skillId)
        : [...requestSkillIds, skillId],
    )
  }

  return (
    <div className="cf-skill-panel">
      <fieldset disabled={disabled}>
        <legend>Requested Skills</legend>
        <div aria-label="Request-required skills" className="cf-skill-chip-grid">
          {requestSkills.map((skill) => {
            const selected = requestSkillIds.includes(skill.skillId)
            return (
              <button
                aria-pressed={selected}
                className={`cf-skill-chip ${selected ? 'cf-skill-chip--selected' : ''}`.trim()}
                key={skill.skillId}
                onClick={() => toggleRequestSkill(skill.skillId)}
                type="button"
              >
                <span className="cf-skill-chip-dot" />
                <span>{skill.skillName}</span>
              </button>
            )
          })}
          {requestSkills.length === 0 ? (
            <p className="cf-skill-empty">No required skills on this request.</p>
          ) : null}
        </div>
      </fieldset>

      <fieldset disabled={disabled}>
        <legend>Add Custom Skills Selector</legend>

        {mappedError ? (
          <ErrorState
            correlationId={mappedError.correlationId}
            message={mappedError.message}
            onAction={() => void taxonomy.refetch()}
            title="Skill taxonomy unavailable"
          />
        ) : (
          <Button
            disabled={disabled || taxonomy.isPending || !taxonomy.data}
            onClick={() => setModalOpen(true)}
            size="sm"
            variant="outlined"
          >
            Custom Skills
          </Button>
        )}

        <div aria-label="Selected additional skills" className="cf-selected-skill-chips">
          {additionalSkillIds.map((skillId) => (
            <Chip
              key={skillId}
              onRemove={() =>
                onAdditionalSkillIdsChange(
                  additionalSkillIds.filter((current) => current !== skillId),
                )
              }
              variant="input"
            >
              {index?.skillsById.get(skillId)?.name ?? 'Selected taxonomy skill'}
            </Chip>
          ))}
          {additionalSkillIds.length === 0 ? (
            <span className="cf-skill-empty">No additional skills selected.</span>
          ) : null}
        </div>
      </fieldset>

      {modalOpen && taxonomy.data ? (
        <AdditionalSkillsModal
          onChange={onAdditionalSkillIdsChange}
          onClose={() => setModalOpen(false)}
          requestSkillIds={requestSkills.map((skill) => skill.skillId)}
          selectedSkillIds={additionalSkillIds}
          taxonomy={taxonomy.data}
        />
      ) : null}
    </div>
  )
}
