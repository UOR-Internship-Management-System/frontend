import { useQuery } from '@tanstack/react-query'
import { studentProjectsApi } from '../api/studentProjectsApi'
import { studentProjectKeys } from './studentProjectKeys'
import { shouldRetryStudentProjectQuery } from './useStudentProjects'

export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: studentProjectKeys.detail(projectId ?? 'unselected'),
    queryFn: ({ signal }) => studentProjectsApi.get(projectId!, signal),
    enabled: Boolean(projectId),
    retry: shouldRetryStudentProjectQuery,
  })
}
