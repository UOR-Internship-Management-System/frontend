import { queryKeys } from '../api/queryKeys'
import type { TaxonomyQuery } from './types'

export const skillTaxonomyKeys = {
  all: [...queryKeys.protected, 'skill-taxonomy'] as const,
  tree: () => [...skillTaxonomyKeys.all, 'tree'] as const,
  clusters: (query: TaxonomyQuery) => [...skillTaxonomyKeys.all, 'clusters', query] as const,
  categories: (query: TaxonomyQuery) => [...skillTaxonomyKeys.all, 'categories', query] as const,
  skills: (query: TaxonomyQuery) => [...skillTaxonomyKeys.all, 'skills', query] as const,
}
