import type { IndividualSkill } from '../types/studentSkillTypes'

export function deduplicateCanonicalSkills(skills: IndividualSkill[]): IndividualSkill[] {
  const canonical = new Map<string, IndividualSkill>()
  for (const skill of skills) {
    if (!canonical.has(skill.skillId)) {
      canonical.set(skill.skillId, skill)
    }
  }
  return [...canonical.values()]
}
