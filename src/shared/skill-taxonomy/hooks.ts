import { useQuery } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../api/apiErrorMapper'
import { skillTaxonomyApi } from './api'
import { skillTaxonomyKeys } from './queryKeys'
import type { TaxonomyQuery } from './types'

const nonRetryableStatuses = new Set([400, 401, 403, 404, 409, 412, 415, 422, 428, 429])

export function shouldRetryTaxonomyQuery(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && (nonRetryableStatuses.has(status) || status < 500)) return false
  return failureCount < 1
}

export function useSkillClusters(query: TaxonomyQuery) {
  return useQuery({
    queryKey: skillTaxonomyKeys.clusters(query),
    queryFn: ({ signal }) => skillTaxonomyApi.listClusters(query, signal),
    retry: shouldRetryTaxonomyQuery,
  })
}

export function useSkillTaxonomyTree() {
  return useQuery({
    queryKey: skillTaxonomyKeys.tree(),
    queryFn: ({ signal }) => skillTaxonomyApi.getTree(signal),
    retry: shouldRetryTaxonomyQuery,
    staleTime: 5 * 60_000,
  })
}

export function useSkillCategories(query: TaxonomyQuery, enabled = true) {
  return useQuery({
    queryKey: skillTaxonomyKeys.categories(query),
    queryFn: ({ signal }) => skillTaxonomyApi.listCategories(query, signal),
    retry: shouldRetryTaxonomyQuery,
    enabled,
  })
}

export function useIndividualSkills(query: TaxonomyQuery) {
  return useQuery({
    queryKey: skillTaxonomyKeys.skills(query),
    queryFn: ({ signal }) => skillTaxonomyApi.listSkills(query, signal),
    retry: shouldRetryTaxonomyQuery,
  })
}
