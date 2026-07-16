import { SelectField } from '../../../shared/components/forms/SelectField'
import { competencyLevels, type CompetencyLevel } from '../types/studentSkillTypes'

const labels: Record<CompetencyLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

export function SkillLevelSelect({
  disabled,
  errorId,
  id,
  label,
  onChange,
  value,
}: {
  id: string
  label?: string
  value: CompetencyLevel | ''
  onChange: (value: CompetencyLevel | '') => void
  disabled?: boolean
  errorId?: string
}) {
  return (
    <SelectField
      aria-describedby={errorId}
      aria-invalid={Boolean(errorId) || undefined}
      aria-label={label}
      disabled={disabled}
      id={id}
      onChange={(event) => onChange(event.target.value as CompetencyLevel | '')}
      required
      value={value}
    >
      <option value="">Select competency</option>
      {competencyLevels.map((level) => (
        <option key={level} value={level}>
          {labels[level]}
        </option>
      ))}
    </SelectField>
  )
}

export function competencyLabel(level: CompetencyLevel) {
  return labels[level]
}
