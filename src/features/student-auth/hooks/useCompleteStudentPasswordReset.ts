import { useMutation } from '@tanstack/react-query'
import { studentAuthApi } from '../api/studentAuthApi'
import type { PasswordRequest } from '../types/studentAuthTypes'

export function useCompleteStudentPasswordReset() {
  return useMutation({
    mutationFn: ({ request, resetId }: { resetId: string; request: PasswordRequest }) =>
      studentAuthApi.completePasswordReset(resetId, request),
  })
}
