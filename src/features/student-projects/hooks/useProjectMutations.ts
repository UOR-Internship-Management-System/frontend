import { useMutation, useQueryClient } from '@tanstack/react-query'
import { studentProjectsApi } from '../api/studentProjectsApi'
import type {
  DeleteStudentProjectInput,
  StudentProjectCreateRequest,
  UpdateStudentProjectInput,
} from '../types/studentProjectTypes'
import { studentProjectKeys } from './studentProjectKeys'

function useProjectInvalidation() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: studentProjectKeys.all })
}

export function useCreateProject() {
  const invalidate = useProjectInvalidation()
  return useMutation({
    mutationFn: (request: StudentProjectCreateRequest) => studentProjectsApi.create(request),
    retry: false,
    onSuccess: invalidate,
  })
}

export function useUpdateProject() {
  const invalidate = useProjectInvalidation()
  return useMutation({
    mutationFn: ({ projectId, request, version }: UpdateStudentProjectInput) =>
      studentProjectsApi.update(projectId, request, version),
    retry: false,
    onSuccess: invalidate,
  })
}

export function useDeleteProject() {
  const invalidate = useProjectInvalidation()
  return useMutation({
    mutationFn: ({ projectId, version }: DeleteStudentProjectInput) =>
      studentProjectsApi.delete(projectId, version),
    retry: false,
    onSuccess: invalidate,
  })
}
