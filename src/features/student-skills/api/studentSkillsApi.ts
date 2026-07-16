import { httpClient } from '../../../shared/api/httpClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import {
  pagedIndividualSkillsSchema,
  pagedSkillCategoriesSchema,
  pagedSkillClustersSchema,
  skillTaxonomySchema,
} from '../schemas/studentSkillSchemas'
import type { SkillTaxonomy, TaxonomyQuery } from '../types/studentSkillTypes'

function queryString(query: TaxonomyQuery) {
  return buildQueryString({
    page: query.page,
    size: query.size,
    sort: query.sort,
    search: query.search,
    clusterId: query.clusterId,
    categoryId: query.categoryId,
  })
}

export const studentSkillsApi = {
  async getTaxonomy(signal?: AbortSignal): Promise<SkillTaxonomy> {
    const response = await httpClient<unknown>('/skill-taxonomy', { signal })
    return skillTaxonomySchema.parse(response)
  },

  async listClusters(query: TaxonomyQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(`/skill-taxonomy/clusters${queryString(query)}`, {
      signal,
    })
    return pagedSkillClustersSchema.parse(response)
  },

  async listCategories(query: TaxonomyQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(`/skill-taxonomy/categories${queryString(query)}`, {
      signal,
    })
    return pagedSkillCategoriesSchema.parse(response)
  },

  async listSkills(query: TaxonomyQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(`/skill-taxonomy/skills${queryString(query)}`, {
      signal,
    })
    return pagedIndividualSkillsSchema.parse(response)
  },
}
