import { queryKeys } from '../../../shared/api/queryKeys'
import type { StudentProjectQuery } from '../types/studentProjectTypes'

export const studentProjectKeys = {
  all: [...queryKeys.protected, 'student-projects'] as const,
  lists: () => [...studentProjectKeys.all, 'list'] as const,
  list: (query: StudentProjectQuery) => [...studentProjectKeys.lists(), query] as const,
  details: () => [...studentProjectKeys.all, 'detail'] as const,
  detail: (projectId: string) => [...studentProjectKeys.details(), projectId] as const,
}
