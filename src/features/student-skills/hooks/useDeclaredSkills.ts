import { useQuery } from '@tanstack/react-query'
import { studentSkillsApi } from '../api/studentSkillsApi'
import type { DeclaredSkillQuery } from '../types/studentSkillTypes'
import { studentSkillKeys } from './studentSkillKeys'
import { shouldRetryTaxonomyQuery } from './useSkillTaxonomy'

export function useDeclaredSkills(query: DeclaredSkillQuery) {
  return useQuery({
    queryKey: studentSkillKeys.declaredPage(query),
    queryFn: ({ signal }) => studentSkillsApi.listDeclaredSkills(query, signal),
    retry: shouldRetryTaxonomyQuery,
  })
}
