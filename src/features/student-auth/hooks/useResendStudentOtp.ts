import { useMutation } from '@tanstack/react-query'
import { studentAuthApi } from '../api/studentAuthApi'

export function useResendStudentOtp() {
  return useMutation({
    mutationFn: (verificationId: string) => studentAuthApi.resendOtp(verificationId),
  })
}
