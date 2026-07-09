import { useMutation } from '@tanstack/react-query'
import { adminAuthApi } from '../api/adminAuthApi'
import type { AdminPasswordRequest } from '../types/adminAuthTypes'

export function useCompleteAdminPasswordReset() {
  return useMutation({
    mutationFn: ({ request, resetId }: { resetId: string; request: AdminPasswordRequest }) =>
      adminAuthApi.completePasswordReset(resetId, request),
  })
}
