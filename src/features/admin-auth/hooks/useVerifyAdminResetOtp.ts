import { useMutation } from '@tanstack/react-query'
import { adminAuthApi } from '../api/adminAuthApi'

export function useVerifyAdminResetOtp() {
  return useMutation({
    mutationFn: ({ otp, resetId }: { resetId: string; otp: string }) =>
      adminAuthApi.verifyResetOtp(resetId, { otp }),
  })
}
