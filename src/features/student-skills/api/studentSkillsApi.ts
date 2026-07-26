import { formatIfMatchVersion } from '../../../shared/api/formatIfMatchVersion'
import { httpClient } from '../../../shared/api/httpClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import {
  declaredSkillCreateSchema,
  declaredSkillSchema,
  declaredSkillUpdateSchema,
  pagedDeclaredSkillsSchema,
} from '../schemas/studentSkillSchemas'
import type {
  DeclaredSkillCreateRequest,
  DeclaredSkillQuery,
  DeclaredSkillUpdateRequest,
} from '../types/studentSkillTypes'

export const studentSkillsApi = {
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
