import { queryKeys } from '../../../shared/api/queryKeys'

export const exportKeys = {
  all: [...queryKeys.protected, 'exports'] as const,
  jobs: () => [...exportKeys.all, 'job'] as const,
  job: (exportJobId: string) => [...exportKeys.jobs(), exportJobId] as const,
}
