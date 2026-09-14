import { Chip } from '../../../shared/components/ui/Chip'
import type { IndividualSkill } from '../../../shared/skill-taxonomy'

export function ProjectSkillChips({
  disabled = false,
  onRemove,
  skills,
}: {
  skills: IndividualSkill[]
  disabled?: boolean
  onRemove?: (skillId: string) => void
}) {
  if (!skills.length) {
    return <span className="s4-projects-no-skills">No skills selected</span>
  }

  return (
    <ul aria-label="Project skills" className="s4-projects-skill-chips">
      {skills.map((skill) => (
        <li key={skill.skillId}>
          <Chip
            onRemove={onRemove && !disabled ? () => onRemove(skill.skillId) : undefined}
            variant="input"
          >
            {skill.name}
          </Chip>
        </li>
      ))}
    </ul>
  )
}
