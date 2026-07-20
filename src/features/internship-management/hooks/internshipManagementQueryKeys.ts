import { queryKeys } from '../../../shared/api/queryKeys'
import type { CompaniesQuery } from '../types/internshipManagementTypes'

export const internshipManagementKeys = {
  all: [...queryKeys.protected, 'internship-management'] as const,
  companies: () => [...internshipManagementKeys.all, 'companies'] as const,
  companyList: (query: CompaniesQuery) =>
    [...internshipManagementKeys.companies(), 'list', query] as const,
  companyDetail: (companyId: string) =>
    [...internshipManagementKeys.companies(), 'detail', companyId] as const,
}
