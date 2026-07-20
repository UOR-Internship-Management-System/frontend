import type {
  ApiCompanyRequest,
  ApiCompanyResponse,
  ApiCompanySort,
  ApiCompanyUpdateRequest,
} from '../../../shared/api/generated/cvManagementApi.types'
import type { z } from 'zod'
import type { companyFormSchema } from '../schemas/internshipSchemas'

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

export type Company = ApiCompanyResponse
export type CompanyFormSubmission = z.output<typeof companyFormSchema>
export type CompanyFormValues = z.input<typeof companyFormSchema>
