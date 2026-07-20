import type {
  ApiCompanyRequest,
  ApiCompanyResponse,
  ApiCompanySort,
  ApiCompanyUpdateRequest,
  ApiInternshipRequestCreateRequest,
  ApiInternshipRequestSort,
  ApiInternshipRequestStatus,
  ApiInternshipRequestUpdateRequest,
  ApiInternshipRequiredSkillRequest,
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

export type InternshipRequestPageSize = 20 | 50 | 100
export type InternshipRequestsQuery = {
  page: number
  size: InternshipRequestPageSize
  sort: ApiInternshipRequestSort
  search: string
  status?: ApiInternshipRequestStatus
  companyId?: string
}
export type RequiredSkillsQuery = {
  requestId: string
  page: number
  size: InternshipRequestPageSize
}
export type InternshipRequestCreateInput = ApiInternshipRequestCreateRequest
export type InternshipRequestUpdateInput = {
  requestId: string
  version: number
  body: ApiInternshipRequestUpdateRequest
}
export type InternshipRequestCancelInput = { requestId: string; version: number }
export type RequiredSkillAddInput = {
  requestId: string
  version: number
  body: ApiInternshipRequiredSkillRequest
}
export type RequiredSkillRemoveInput = {
  requestId: string
  requiredSkillId: string
  version: number
}
