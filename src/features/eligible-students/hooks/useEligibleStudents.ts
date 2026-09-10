import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  const refresh = () => queryClient.invalidateQueries({ queryKey: keys.all })
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
