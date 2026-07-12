import { useMutation } from '@tanstack/react-query'
import { studentAuthApi } from '../api/studentAuthApi'

export function useVerifyStudentResetOtp() {
  return useMutation({
    mutationFn: ({ otp, resetId }: { resetId: string; otp: string }) =>
      studentAuthApi.verifyResetOtp(resetId, { otpCode: otp }),
  })
}
