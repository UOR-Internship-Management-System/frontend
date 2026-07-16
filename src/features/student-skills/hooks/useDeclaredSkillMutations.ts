import { useMutation, useQueryClient } from '@tanstack/react-query'
import { studentSkillsApi } from '../api/studentSkillsApi'
import type {
  DeclaredSkillCreateRequest,
  DeclaredSkillUpdateRequest,
} from '../types/studentSkillTypes'
import { studentDashboardKeys } from '../../student-dashboard/hooks/studentDashboardKeys'
import { studentSkillKeys } from './studentSkillKeys'

export type UpdateDeclaredSkillInput = {
  declaredSkillId: string
  request: DeclaredSkillUpdateRequest
  version: number
}

export type DeleteDeclaredSkillInput = { declaredSkillId: string; version: number }

function useDeclaredSkillInvalidation() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: studentSkillKeys.declared(),
        refetchType: 'active',
      }),
      queryClient.invalidateQueries({
        queryKey: studentDashboardKeys.metrics(),
        refetchType: 'active',
      }),
    ])
}

export function useCreateDeclaredSkill() {
  const invalidate = useDeclaredSkillInvalidation()
  return useMutation({
    mutationFn: (request: DeclaredSkillCreateRequest) =>
      studentSkillsApi.createDeclaredSkill(request),
    retry: false,
    onSuccess: invalidate,
  })
}

export function useUpdateDeclaredSkill() {
  const invalidate = useDeclaredSkillInvalidation()
  return useMutation({
    mutationFn: ({ declaredSkillId, request, version }: UpdateDeclaredSkillInput) =>
      studentSkillsApi.updateDeclaredSkill(declaredSkillId, request, version),
    retry: false,
    onSuccess: invalidate,
  })
}

export function useDeleteDeclaredSkill() {
  const invalidate = useDeclaredSkillInvalidation()
  return useMutation({
    mutationFn: ({ declaredSkillId, version }: DeleteDeclaredSkillInput) =>
      studentSkillsApi.deleteDeclaredSkill(declaredSkillId, version),
    retry: false,
    onSuccess: invalidate,
  })
}
