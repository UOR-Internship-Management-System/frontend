import { createSprintOneDeferredApi } from '../../../shared/api/sprintOneDeferredApi'
import { formatIfMatchVersion } from '../../../shared/api/formatIfMatchVersion'
import { httpClient } from '../../../shared/api/httpClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import {
  pagedStudentProjectsSchema,
  studentProjectCreateSchema,
  studentProjectSchema,
  studentProjectUpdateSchema,
} from '../schemas/studentProjectSchemas'
import type {
  StudentProjectCreateRequest,
  StudentProjectQuery,
  StudentProjectUpdateRequest,
} from '../types/studentProjectTypes'

export const studentProjectsApi = {
  async list(query: StudentProjectQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/me/projects${buildQueryString({
        page: query.page,
        size: query.size,
        sort: query.sort,
        search: query.search,
      })}`,
      { signal },
    )
    return pagedStudentProjectsSchema.parse(response)
  },

  async get(projectId: string, signal?: AbortSignal) {
    const response = await httpClient<unknown>(`/me/projects/${projectId}`, { signal })
    return studentProjectSchema.parse(response)
  },

  async create(body: StudentProjectCreateRequest, signal?: AbortSignal) {
    const request = studentProjectCreateSchema.parse(body)
    const response = await httpClient<unknown>('/me/projects', {
      method: 'POST',
      body: request,
      signal,
    })
    return studentProjectSchema.parse(response)
  },

  async update(
    projectId: string,
    body: StudentProjectUpdateRequest,
    version: number,
    signal?: AbortSignal,
  ) {
    const request = studentProjectUpdateSchema.parse(body)
    const response = await httpClient<unknown>(`/me/projects/${projectId}`, {
      method: 'PATCH',
      body: request,
      headers: { 'If-Match': formatIfMatchVersion(version) },
      signal,
    })
    return studentProjectSchema.parse(response)
  },

  async delete(projectId: string, version: number, signal?: AbortSignal) {
    await httpClient<void>(`/me/projects/${projectId}`, {
      method: 'DELETE',
      headers: { 'If-Match': formatIfMatchVersion(version) },
      signal,
    })
  },
}
export const apiBoundary = createSprintOneDeferredApi('Feature')
