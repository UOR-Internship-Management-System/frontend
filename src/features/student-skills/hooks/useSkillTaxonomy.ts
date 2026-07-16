import { useQuery } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { studentSkillsApi } from '../api/studentSkillsApi'
import type { TaxonomyQuery } from '../types/studentSkillTypes'
import { studentSkillKeys } from './studentSkillKeys'

const nonRetryableStatuses = new Set([400, 401, 403, 404, 409, 412, 415, 422, 428, 429])

export function shouldRetryTaxonomyQuery(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && (nonRetryableStatuses.has(status) || status < 500)) return false
  return failureCount < 1
}

export function useSkillClusters(query: TaxonomyQuery) {
  return useQuery({
    queryKey: studentSkillKeys.clusters(query),
    queryFn: ({ signal }) => studentSkillsApi.listClusters(query, signal),
    retry: shouldRetryTaxonomyQuery,
  })
}

export function useSkillCategories(query: TaxonomyQuery, enabled = true) {
  return useQuery({
    queryKey: studentSkillKeys.categories(query),
    queryFn: ({ signal }) => studentSkillsApi.listCategories(query, signal),
    retry: shouldRetryTaxonomyQuery,
    enabled,
  })
}

export function useIndividualSkills(query: TaxonomyQuery) {
  return useQuery({
    queryKey: studentSkillKeys.skills(query),
    queryFn: ({ signal }) => studentSkillsApi.listSkills(query, signal),
    retry: shouldRetryTaxonomyQuery,
  })
}
