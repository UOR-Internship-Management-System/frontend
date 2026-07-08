import { useMutation } from '@tanstack/react-query'
import { studentAuthApi } from '../api/studentAuthApi'

export function useResendStudentResetOtp() {
  return useMutation({
    mutationFn: (resetId: string) => studentAuthApi.resendResetOtp(resetId),
  })
}
