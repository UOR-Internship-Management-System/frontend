import type { PagedQuery, PagedResponse } from '../../../shared/types/pagination'

export const competencyLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const
export type CompetencyLevel = (typeof competencyLevels)[number]

export type IndividualSkill = {
  skillId: string
  name: string
  description?: string | null
}

export type SkillCategory = {
  categoryId: string
  name: string
  description?: string | null
  skills?: IndividualSkill[]
}

export type SkillCluster = {
  clusterId: string
  name: string
  description?: string | null
  categories?: SkillCategory[]
}

export type SkillTaxonomy = { clusters: SkillCluster[] }

export type SkillTaxonomyPath = {
  clusterId: string
  clusterName: string
  categoryId: string
  categoryName: string
}

export type SkillTaxonomyIndex = {
  skillsById: ReadonlyMap<string, IndividualSkill>
  pathsBySkillId: ReadonlyMap<string, SkillTaxonomyPath[]>
}

export type TaxonomyQuery = PagedQuery & {
  clusterId?: string
  categoryId?: string
}

export type PagedSkillClusters = PagedResponse<SkillCluster>
export type PagedSkillCategories = PagedResponse<SkillCategory>
export type PagedIndividualSkills = PagedResponse<IndividualSkill>

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
