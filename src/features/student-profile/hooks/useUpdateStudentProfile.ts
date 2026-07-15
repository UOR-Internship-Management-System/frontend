import { useMutation, useQueryClient } from '@tanstack/react-query'
import { studentProfileApi } from '../api/studentProfileApi'
import type { UpdateStudentProfileInput } from '../types/studentProfileTypes'
import { studentProfileKeys } from './studentProfileKeys'

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ baseline, values, version }: UpdateStudentProfileInput) =>
      studentProfileApi.updateCurrent(values, version, baseline),
    retry: false,
    onSuccess: async (profile) => {
      queryClient.setQueryData(studentProfileKeys.core(), profile)
      await queryClient.invalidateQueries({
        queryKey: studentProfileKeys.core(),
        refetchType: 'active',
      })
    },
  })
}
