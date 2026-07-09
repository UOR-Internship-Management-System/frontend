import { useMutation } from '@tanstack/react-query'
import { studentAuthApi } from '../api/studentAuthApi'
import type { LoginRequest } from '../types/studentAuthTypes'

export function useStudentLogin() {
  return useMutation({ mutationFn: (request: LoginRequest) => studentAuthApi.login(request) })
}
