import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { internshipManagementApi } from '../api/internshipManagementApi'
import type {
  CompaniesQuery,
  CompanyCreateInput,
  CompanyDeleteInput,
  CompanyUpdateInput,
} from '../types/internshipManagementTypes'
import { internshipManagementKeys } from './internshipManagementQueryKeys'

export function shouldRetryCompanyQuery(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && status < 500) return false
  return failureCount < 1
}

export function useCompanies(query: CompaniesQuery) {
  return useQuery({
    queryKey: internshipManagementKeys.companyList(query),
    queryFn: ({ signal }) => internshipManagementApi.listCompanies(query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryCompanyQuery,
  })
}

export function useCompany(companyId: string | null) {
  return useQuery({
    enabled: Boolean(companyId),
    queryKey: internshipManagementKeys.companyDetail(companyId ?? ''),
    queryFn: ({ signal }) => internshipManagementApi.getCompany(companyId ?? '', signal),
    retry: shouldRetryCompanyQuery,
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CompanyCreateInput) => internshipManagementApi.createCompany(input),
    onSuccess: (company) => {
      queryClient.setQueryData(internshipManagementKeys.companyDetail(company.companyId), company)
      return queryClient.invalidateQueries({ queryKey: internshipManagementKeys.companies() })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CompanyUpdateInput) => internshipManagementApi.updateCompany(input),
    onSuccess: (company) => {
      queryClient.setQueryData(internshipManagementKeys.companyDetail(company.companyId), company)
      return queryClient.invalidateQueries({ queryKey: internshipManagementKeys.companies() })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CompanyDeleteInput) => internshipManagementApi.deleteCompany(input),
    onSuccess: (_result, input) => {
      queryClient.removeQueries({
        queryKey: internshipManagementKeys.companyDetail(input.companyId),
      })
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: internshipManagementKeys.companies() }),
        queryClient.invalidateQueries({ queryKey: internshipManagementKeys.requests() }),
      ])
    },
  })
}

export function getCompanyMutationErrorMessage(error: unknown) {
  const mapped = mapApiError(error, 'protected')
  if (mapped.status === 412) return 'Company data changed. Reload the latest version and try again.'
  if (mapped.status === 428) return 'Reload this company before deleting it.'
  if (mapped.code === 'DUPLICATE_COMPANY') {
    return 'A company with this name already exists. Review the existing company record.'
  }
  if (mapped.status === 409) return 'This company cannot be deleted because linked data is in use.'
  return mapped.message
}
