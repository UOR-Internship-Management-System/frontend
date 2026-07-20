import { queryKeys } from '../../../shared/api/queryKeys'
import type {
  CompaniesQuery,
  InternshipRequestsQuery,
  RequiredSkillsQuery,
} from '../types/internshipManagementTypes'

export const internshipManagementKeys = {
  all: [...queryKeys.protected, 'internship-management'] as const,
  companies: () => [...internshipManagementKeys.all, 'companies'] as const,
  companyList: (query: CompaniesQuery) =>
    [...internshipManagementKeys.companies(), 'list', query] as const,
  companyDetail: (companyId: string) =>
    [...internshipManagementKeys.companies(), 'detail', companyId] as const,
  requests: () => [...internshipManagementKeys.all, 'requests'] as const,
  requestList: (query: InternshipRequestsQuery) =>
    [...internshipManagementKeys.requests(), 'list', query] as const,
  requestDetail: (requestId: string) =>
    [...internshipManagementKeys.requests(), 'detail', requestId] as const,
  requiredSkills: (query: RequiredSkillsQuery) =>
    [...internshipManagementKeys.requestDetail(query.requestId), 'required-skills', query] as const,
}
