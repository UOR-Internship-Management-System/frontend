import { queryKeys } from '../../../shared/api/queryKeys'

export const studentProfileKeys = {
  all: [...queryKeys.protected, 'student-profile'] as const,
  core: () => [...studentProfileKeys.all, 'core'] as const,
}
