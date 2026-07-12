import { useMutation } from '@tanstack/react-query'
import { studentAuthApi } from '../api/studentAuthApi'

export function useVerifyStudentOtp() {
  return useMutation({
    mutationFn: ({ otp, verificationId }: { verificationId: string; otp: string }) =>
      studentAuthApi.verifyOtp(verificationId, { otpCode: otp }),
  })
}
