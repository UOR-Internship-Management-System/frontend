import { formatIfMatchVersion } from '../../../shared/api/formatIfMatchVersion'
import { httpClient } from '../../../shared/api/httpClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import {
  declaredSkillCreateSchema,
  declaredSkillSchema,
  declaredSkillUpdateSchema,
  pagedDeclaredSkillsSchema,
  pagedIndividualSkillsSchema,
  pagedSkillCategoriesSchema,
  pagedSkillClustersSchema,
  skillTaxonomySchema,
} from '../schemas/studentSkillSchemas'
import type {
  DeclaredSkillCreateRequest,
  DeclaredSkillQuery,
  DeclaredSkillUpdateRequest,
  SkillTaxonomy,
  TaxonomyQuery,
} from '../types/studentSkillTypes'

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

  async listDeclaredSkills(query: DeclaredSkillQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/me/declared-skills${buildQueryString({
        page: query.page,
        size: query.size,
        sort: query.sort,
        search: query.search,
      })}`,
      { signal },
    )
    return pagedDeclaredSkillsSchema.parse(response)
  },

  async createDeclaredSkill(body: DeclaredSkillCreateRequest, signal?: AbortSignal) {
    const request = declaredSkillCreateSchema.parse(body)
    const response = await httpClient<unknown>('/me/declared-skills', {
      method: 'POST',
      body: request,
      signal,
    })
    return declaredSkillSchema.parse(response)
  },

  async updateDeclaredSkill(
    declaredSkillId: string,
    body: DeclaredSkillUpdateRequest,
    version: number,
    signal?: AbortSignal,
  ) {
    const request = declaredSkillUpdateSchema.parse(body)
    const response = await httpClient<unknown>(`/me/declared-skills/${declaredSkillId}`, {
      method: 'PATCH',
      body: request,
      headers: { 'If-Match': formatIfMatchVersion(version) },
      signal,
    })
    return declaredSkillSchema.parse(response)
  },

  async deleteDeclaredSkill(declaredSkillId: string, version: number, signal?: AbortSignal) {
    await httpClient<void>(`/me/declared-skills/${declaredSkillId}`, {
      method: 'DELETE',
      headers: { 'If-Match': formatIfMatchVersion(version) },
      signal,
    })
  },
}
