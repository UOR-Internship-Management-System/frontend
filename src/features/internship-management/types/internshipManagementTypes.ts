import type {
  ApiCompanyRequest,
  ApiCompanyResponse,
  ApiCompanySort,
  ApiCompanyUpdateRequest,
} from '../../../shared/api/generated/cvManagementApi.types'

export type CompanyPageSize = 20 | 50 | 100

export type CompaniesQuery = {
  page: number
  size: CompanyPageSize
  sort: ApiCompanySort
  search: string
  active?: boolean
}

export type CompaniesUrlState = CompaniesQuery & {
  selectedCompanyId?: string
}

export type CompanyCreateInput = ApiCompanyRequest
export type CompanyUpdateInput = {
  companyId: string
  version: number
  body: ApiCompanyUpdateRequest
}
export type CompanyDeactivateInput = Pick<ApiCompanyResponse, 'companyId' | 'version'>
