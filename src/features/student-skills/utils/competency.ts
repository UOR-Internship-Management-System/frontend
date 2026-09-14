import type { StatusBadgeTone } from '../../../shared/components/ui/StatusBadge'
import { competencyLevels, type CompetencyLevel } from '../types/studentSkillTypes'

const labels: Record<CompetencyLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

const tones: Record<CompetencyLevel, StatusBadgeTone> = {
  BEGINNER: 'info',
  INTERMEDIATE: 'warning',
  ADVANCED: 'success',
}

export function competencyLabel(level: CompetencyLevel): string {
  return labels[level]
}

export function competencyTone(level: CompetencyLevel): StatusBadgeTone {
  return tones[level]
}

export const competencyOptions = competencyLevels.map((level) => ({
  value: level,
  label: labels[level],
}))
