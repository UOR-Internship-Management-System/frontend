import { useMutation } from '@tanstack/react-query'
import { adminAuthApi } from '../api/adminAuthApi'

export function useResendAdminResetOtp() {
  return useMutation({
    mutationFn: (resetId: string) => adminAuthApi.resendResetOtp(resetId),
  })
}
