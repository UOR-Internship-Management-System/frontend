import { httpClient } from '../api/httpClient'
import { buildQueryString } from '../utils/buildQueryString'
import {
  pagedIndividualSkillsSchema,
  pagedSkillCategoriesSchema,
  pagedSkillClustersSchema,
  skillTaxonomySchema,
} from './schemas'
import type { SkillTaxonomy, TaxonomyQuery } from './types'

function taxonomyQueryString(query: TaxonomyQuery) {
  return buildQueryString({
    page: query.page,
    size: query.size,
    sort: query.sort,
    search: query.search,
    clusterId: query.clusterId,
    categoryId: query.categoryId,
  })
}

export const skillTaxonomyApi = {
  async getTree(signal?: AbortSignal): Promise<SkillTaxonomy> {
    const response = await httpClient<unknown>('/skill-taxonomy', { signal })
    return skillTaxonomySchema.parse(response)
  },

  async listClusters(query: TaxonomyQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/skill-taxonomy/clusters${taxonomyQueryString(query)}`,
      { signal },
    )
    return pagedSkillClustersSchema.parse(response)
  },

  async listCategories(query: TaxonomyQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/skill-taxonomy/categories${taxonomyQueryString(query)}`,
      { signal },
    )
    return pagedSkillCategoriesSchema.parse(response)
  },

  async listSkills(query: TaxonomyQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/skill-taxonomy/skills${taxonomyQueryString(query)}`,
      { signal },
    )
    return pagedIndividualSkillsSchema.parse(response)
  },
}
