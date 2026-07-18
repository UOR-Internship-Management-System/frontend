import { queryKeys } from '../../../shared/api/queryKeys'
export const cvBuilderKeys = {
  all: [...queryKeys.protected, 'cv-builder'] as const,
  projectOptions: () => [...cvBuilderKeys.all, 'project-options'] as const,
  freshness: () => [...cvBuilderKeys.all, 'freshness'] as const,
  current: () => [...cvBuilderKeys.all, 'current'] as const,
}
