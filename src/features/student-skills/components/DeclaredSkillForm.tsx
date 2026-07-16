import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FormErrorMessage } from '../../../shared/components/forms/FormErrorMessage'
import { Button } from '../../../shared/components/ui/Button'
import type { CompetencyLevel, IndividualSkill } from '../types/studentSkillTypes'
import { SkillLevelSelect } from './SkillLevelSelect'

export function DeclaredSkillForm({
  isPending,
  onSubmit,
  selectedSkill,
}: {
  selectedSkill: IndividualSkill | null
  isPending: boolean
  onSubmit: (competencyLevel: CompetencyLevel) => Promise<void>
}) {
  const [competencyLevel, setCompetencyLevel] = useState<CompetencyLevel | ''>('')
  const [error, setError] = useState<string>()

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(undefined)
    if (!selectedSkill) {
      setError('Select an available taxonomy skill.')
      return
    }
    if (!competencyLevel) {
      setError('Select a competency level.')
      return
    }
    try {
      await onSubmit(competencyLevel)
      setCompetencyLevel('')
    } catch (reason) {
      setError(mapApiError(reason, 'protected').message)
    }
  }

  return (
    <form className="s4-skills-declare-form" noValidate onSubmit={submit}>
      <div>
        <span className="s4-skills-field-label">Selected skill</span>
        <strong>{selectedSkill?.name ?? 'Choose a skill above'}</strong>
      </div>
      <label>
        <span>Competency Level</span>
        <SkillLevelSelect
          disabled={isPending}
          errorId={error ? 'declare-skill-error' : undefined}
          id="declare-skill-competency"
          onChange={setCompetencyLevel}
          value={competencyLevel}
        />
      </label>
      <Button disabled={!selectedSkill || !competencyLevel} isLoading={isPending} type="submit">
        Add declared skill
      </Button>
      <FormErrorMessage id="declare-skill-error" message={error} />
    </form>
  )
}
