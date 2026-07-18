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

const completeDeclaredPageSize = 100

export function useAllDeclaredSkills() {
  return useQuery({
    queryKey: studentSkillKeys.declaredAll(),
    queryFn: async ({ signal }) => {
      const query = { page: 0, size: completeDeclaredPageSize, sort: 'skillName,asc' }
      const firstPage = await studentSkillsApi.listDeclaredSkills(query, signal)
      if (firstPage.page.totalPages <= 1) return firstPage.items

      const remainingPages = await Promise.all(
        Array.from({ length: firstPage.page.totalPages - 1 }, (_, index) =>
          studentSkillsApi.listDeclaredSkills({ ...query, page: index + 1 }, signal),
        ),
      )
      return [firstPage, ...remainingPages].flatMap((page) => page.items)
    },
    retry: shouldRetryTaxonomyQuery,
    staleTime: 60_000,
  })
}
