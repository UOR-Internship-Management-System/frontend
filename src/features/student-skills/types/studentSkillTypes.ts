import type { PagedQuery, PagedResponse } from '../../../shared/types/pagination'

export const competencyLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const
export type CompetencyLevel = (typeof competencyLevels)[number]

export type DeclaredSkill = {
  declaredSkillId: string
  skillId: string
  skillName: string
  competencyLevel: CompetencyLevel
  version: number
  createdAt: string
  updatedAt: string
}

export type DeclaredSkillCreateRequest = {
  skillId: string
  competencyLevel: CompetencyLevel
}

export type DeclaredSkillUpdateRequest = { competencyLevel: CompetencyLevel }

export type DeclaredSkillQuery = PagedQuery
export type PagedDeclaredSkills = PagedResponse<DeclaredSkill>
