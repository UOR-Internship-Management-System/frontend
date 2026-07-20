import { formatIfMatchVersion } from '../../../shared/api/formatIfMatchVersion'
import { httpClient } from '../../../shared/api/httpClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import {
  companyRequestSchema,
  companyResponseSchema,
  companyUpdateRequestSchema,
  pagedCompanyResponseSchema,
} from '../schemas/internshipSchemas'
import type {
  CompaniesQuery,
  CompanyCreateInput,
  CompanyDeactivateInput,
  CompanyUpdateInput,
} from '../types/internshipManagementTypes'

const companiesPath = '/admin/companies'

function companyPath(companyId: string) {
  return `${companiesPath}/${encodeURIComponent(companyId)}`
}

export const internshipManagementApi = {
  async listCompanies(query: CompaniesQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `${companiesPath}${buildQueryString({
        page: query.page,
        size: query.size,
        sort: query.sort,
        search: query.search,
        active: query.active === undefined ? 'null' : query.active,
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
}
