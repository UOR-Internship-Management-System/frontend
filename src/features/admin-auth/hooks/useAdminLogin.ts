import { useMutation } from '@tanstack/react-query'
import { adminAuthApi } from '../api/adminAuthApi'
import type { AdminLoginRequest } from '../types/adminAuthTypes'

export function useAdminLogin() {
  return useMutation({ mutationFn: (request: AdminLoginRequest) => adminAuthApi.login(request) })
}
