import { queryKeys } from '../../../shared/api/queryKeys'
import type { CvVersionQuery } from '../types/cvBuilderTypes'

export const cvBuilderKeys = {
  all: [...queryKeys.protected, 'cv-builder'] as const,
  projectOptions: () => [...cvBuilderKeys.all, 'project-options'] as const,
  freshness: () => [...cvBuilderKeys.all, 'freshness'] as const,
  versions: () => [...cvBuilderKeys.all, 'versions'] as const,
  versionList: (query: CvVersionQuery) => [...cvBuilderKeys.versions(), 'list', query] as const,
  versionDetails: () => [...cvBuilderKeys.versions(), 'detail'] as const,
  versionDetail: (cvVersionId: string) => [...cvBuilderKeys.versionDetails(), cvVersionId] as const,
}
