import { useMutation } from '@tanstack/react-query'
import { studentAuthApi } from '../api/studentAuthApi'
import type { PasswordRequest } from '../types/studentAuthTypes'

export function useCreateStudentPassword() {
  return useMutation({
    mutationFn: ({
      request,
      verificationId,
    }: {
      verificationId: string
      request: PasswordRequest
    }) => studentAuthApi.createPassword(verificationId, request),
  })
}
