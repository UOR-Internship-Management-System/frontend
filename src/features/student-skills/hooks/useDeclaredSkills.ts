import { useQuery } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { studentSkillsApi } from '../api/studentSkillsApi'
import type { DeclaredSkillQuery } from '../types/studentSkillTypes'
import { studentSkillKeys } from './studentSkillKeys'

const nonRetryableStatuses = new Set([400, 401, 403, 404, 409, 412, 415, 422, 428, 429])

export function shouldRetryDeclaredSkillsQuery(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && (nonRetryableStatuses.has(status) || status < 500)) return false
  return failureCount < 1
}

export function useDeclaredSkills(query: DeclaredSkillQuery) {
  return useQuery({
    queryKey: studentSkillKeys.declaredPage(query),
    queryFn: ({ signal }) => studentSkillsApi.listDeclaredSkills(query, signal),
    retry: shouldRetryDeclaredSkillsQuery,
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
    retry: shouldRetryDeclaredSkillsQuery,
    staleTime: 60_000,
  })
}
