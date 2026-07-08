import { useMutation } from '@tanstack/react-query'
import { studentAuthApi } from '../api/studentAuthApi'

export function useStartStudentPasswordReset() {
  return useMutation({
    mutationFn: (email: string) =>
      studentAuthApi.startPasswordReset({ accountType: 'STUDENT', email }),
  })
}
