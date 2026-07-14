import { useMutation, useQueryClient } from '@tanstack/react-query'
import { studentProfileApi } from '../api/studentProfileApi'
import type { StudentProfileFormValues } from '../types/studentProfileTypes'
import { studentProfileKeys } from './studentProfileKeys'

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: StudentProfileFormValues) => studentProfileApi.updateCurrent(values),
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
