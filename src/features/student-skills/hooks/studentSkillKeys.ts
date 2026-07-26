import { queryKeys } from '../../../shared/api/queryKeys'

export const studentSkillKeys = {
  all: [...queryKeys.protected, 'student-skills'] as const,
  declared: () => [...studentSkillKeys.all, 'declared'] as const,
  declaredAll: () => [...studentSkillKeys.declared(), 'all'] as const,
  declaredPage: (query: { page: number; size: number; sort?: string; search?: string }) =>
    [...studentSkillKeys.declared(), query] as const,
}
