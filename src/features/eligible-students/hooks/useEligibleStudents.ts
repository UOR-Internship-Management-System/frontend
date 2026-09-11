import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminDashboardKeys } from '../../admin-dashboard/hooks/adminDashboardQueryKeys'
import { eligibleStudentsApi } from '../api/eligibleStudentsApi'
import type { EligibleStudentQuery, EligibleStudentRequest } from '../types/eligibleStudentTypes'

const keys = {
  all: ['admin', 'eligible-students'] as const,
  list: (query: EligibleStudentQuery) => [...keys.all, 'list', query] as const,
}

export function useEligibleStudents(query: EligibleStudentQuery) {
  return useQuery({
    queryKey: keys.list(query),
    queryFn: ({ signal }) => eligibleStudentsApi.list(query, signal),
    placeholderData: keepPreviousData,
  })
}

export function useEligibleStudentMutations() {
  const queryClient = useQueryClient()
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: keys.all })
    // The Admin Dashboard's "Total Students" / "Registered Students" metrics are derived from the
    // eligible-students roster, so they go stale the moment a roster entry is added or removed.
    return queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all })
  }
  return {
    create: useMutation({
      mutationFn: (values: EligibleStudentRequest) => eligibleStudentsApi.create(values),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, values }: { id: string; values: EligibleStudentRequest }) =>
        eligibleStudentsApi.update(id, values),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: string) => eligibleStudentsApi.remove(id),
      onSuccess: refresh,
    }),
    importFile: useMutation({
      mutationFn: (file: File) => eligibleStudentsApi.importFile(file),
      onSuccess: refresh,
    }),
  }
}
