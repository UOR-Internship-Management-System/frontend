import { useMutation } from '@tanstack/react-query'
import { adminAuthApi } from '../api/adminAuthApi'

export function useStartAdminPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => adminAuthApi.startPasswordReset({ accountType: 'ADMIN', email }),
  })
}
