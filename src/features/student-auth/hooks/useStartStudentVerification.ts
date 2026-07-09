import { useMutation } from '@tanstack/react-query'
import { studentAuthApi } from '../api/studentAuthApi'
import type { StudentVerificationStartRequest } from '../types/studentAuthTypes'

export function useStartStudentVerification() {
  return useMutation({
    mutationFn: (request: StudentVerificationStartRequest) =>
      studentAuthApi.startVerification(request),
  })
}
