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
  if (!skills.length) return <span className="s4-projects-no-skills">No skills selected</span>

  return (
    <ul aria-label="Project skills" className="s4-projects-skill-chips">
      {skills.map((skill) => (
        <li className="chip" key={skill.skillId}>
          <span>{skill.name}</span>
          {onRemove ? (
            <button
              aria-label={`Remove ${skill.name}`}
              disabled={disabled}
              onClick={() => onRemove(skill.skillId)}
              type="button"
            >
              ×
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
