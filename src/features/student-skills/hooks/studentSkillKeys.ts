import { queryKeys } from '../../../shared/api/queryKeys'
import type { TaxonomyQuery } from '../types/studentSkillTypes'

export const studentSkillKeys = {
  all: [...queryKeys.protected, 'student-skills'] as const,
  taxonomy: () => [...studentSkillKeys.all, 'taxonomy'] as const,
  tree: () => [...studentSkillKeys.taxonomy(), 'tree'] as const,
  clusters: (query: TaxonomyQuery) => [...studentSkillKeys.taxonomy(), 'clusters', query] as const,
  categories: (query: TaxonomyQuery) =>
    [...studentSkillKeys.taxonomy(), 'categories', query] as const,
  skills: (query: TaxonomyQuery) => [...studentSkillKeys.taxonomy(), 'skills', query] as const,
  declared: () => [...studentSkillKeys.all, 'declared'] as const,
  declaredPage: (query: { page: number; size: number; sort?: string; search?: string }) =>
    [...studentSkillKeys.declared(), query] as const,
}
