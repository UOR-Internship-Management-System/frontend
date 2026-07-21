import { formatIfMatchVersion } from '../../../shared/api/formatIfMatchVersion'
import { httpClient } from '../../../shared/api/httpClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import {
  companyRequestSchema,
  companyResponseSchema,
  companyUpdateRequestSchema,
  internshipRequestCreateSchema,
  internshipRequestResponseSchema,
  internshipRequestUpdateSchema,
  internshipRequiredSkillRequestSchema,
  internshipRequiredSkillResponseSchema,
  pagedCompanyResponseSchema,
  pagedInternshipRequestResponseSchema,
  pagedInternshipRequiredSkillResponseSchema,
} from '../schemas/internshipSchemas'
import type {
  CompaniesQuery,
  CompanyCreateInput,
  CompanyDeactivateInput,
  CompanyUpdateInput,
  InternshipRequestCancelInput,
  InternshipRequestCreateInput,
  InternshipRequestsQuery,
  InternshipRequestUpdateInput,
  RequiredSkillAddInput,
  RequiredSkillRemoveInput,
  RequiredSkillsQuery,
} from '../types/internshipManagementTypes'

const companiesPath = '/admin/companies'
const internshipRequestsPath = '/admin/internship-requests'

function companyPath(companyId: string) {
  return `${companiesPath}/${encodeURIComponent(companyId)}`
}

function internshipRequestPath(requestId: string) {
  return `${internshipRequestsPath}/${encodeURIComponent(requestId)}`
}

function requiredSkillsPath(requestId: string) {
  return `${internshipRequestPath(requestId)}/required-skills`
}

export const internshipManagementApi = {
  async listCompanies(query: CompaniesQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `${companiesPath}${buildQueryString({
        page: query.page,
        size: query.size,
        sort: query.sort,
        search: query.search,
        active: query.active,
      })}`,
      { signal },
    )
    return pagedCompanyResponseSchema.parse(response)
  },

  async getCompany(companyId: string, signal?: AbortSignal) {
    return companyResponseSchema.parse(
      await httpClient<unknown>(companyPath(companyId), { signal }),
    )
  },

  async createCompany(input: CompanyCreateInput) {
    const body = companyRequestSchema.parse(input)
    return companyResponseSchema.parse(
      await httpClient<unknown>(companiesPath, { method: 'POST', body }),
    )
  },

  async updateCompany({ body: input, companyId, version }: CompanyUpdateInput) {
    const body = companyUpdateRequestSchema.parse(input)
    return companyResponseSchema.parse(
      await httpClient<unknown>(companyPath(companyId), {
        method: 'PATCH',
        body,
        headers: { 'If-Match': formatIfMatchVersion(version) },
      }),
    )
  },

  async deactivateCompany({ companyId, version }: CompanyDeactivateInput) {
    await httpClient<void>(companyPath(companyId), {
      method: 'DELETE',
      headers: { 'If-Match': formatIfMatchVersion(version) },
    })
  },

  async listInternshipRequests(query: InternshipRequestsQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `${internshipRequestsPath}${buildQueryString({
        page: query.page,
        size: query.size,
        sort: query.sort,
        search: query.search,
        status: query.status,
        companyId: query.companyId,
      })}`,
      { signal },
    )
    return pagedInternshipRequestResponseSchema.parse(response)
  },

  async getInternshipRequest(requestId: string, signal?: AbortSignal) {
    return internshipRequestResponseSchema.parse(
      await httpClient<unknown>(internshipRequestPath(requestId), { signal }),
    )
  },

  async createInternshipRequest(input: InternshipRequestCreateInput) {
    const body = internshipRequestCreateSchema.parse(input)
    return internshipRequestResponseSchema.parse(
      await httpClient<unknown>(internshipRequestsPath, { method: 'POST', body }),
    )
  },

  async updateInternshipRequest({ body: input, requestId, version }: InternshipRequestUpdateInput) {
    const body = internshipRequestUpdateSchema.parse(input)
    return internshipRequestResponseSchema.parse(
      await httpClient<unknown>(internshipRequestPath(requestId), {
        method: 'PATCH',
        body,
        headers: { 'If-Match': formatIfMatchVersion(version) },
      }),
    )
  },

  async cancelInternshipRequest({ requestId, version }: InternshipRequestCancelInput) {
    await httpClient<void>(internshipRequestPath(requestId), {
      method: 'DELETE',
      headers: { 'If-Match': formatIfMatchVersion(version) },
    })
  },

  async listRequiredSkills(query: RequiredSkillsQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `${requiredSkillsPath(query.requestId)}${buildQueryString({ page: query.page, size: query.size })}`,
      { signal },
    )
    return pagedInternshipRequiredSkillResponseSchema.parse(response)
  },

  async addRequiredSkill({ body: input, requestId, version }: RequiredSkillAddInput) {
    const body = internshipRequiredSkillRequestSchema.parse(input)
    return internshipRequiredSkillResponseSchema.parse(
      await httpClient<unknown>(requiredSkillsPath(requestId), {
        method: 'POST',
        body,
        headers: { 'If-Match': formatIfMatchVersion(version) },
      }),
    )
  },

  async removeRequiredSkill({ requestId, requiredSkillId, version }: RequiredSkillRemoveInput) {
    await httpClient<void>(
      `${requiredSkillsPath(requestId)}/${encodeURIComponent(requiredSkillId)}`,
      {
        method: 'DELETE',
        headers: { 'If-Match': formatIfMatchVersion(version) },
      },
    )
  },
}
