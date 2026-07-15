import { queryKeys } from '../../../shared/api/queryKeys'
import type { ProfileCollectionKind, ProfileCollectionQuery } from '../types/profileEntryTypes'

export const studentProfileKeys = {
  all: [...queryKeys.protected, 'student-profile'] as const,
  core: () => [...studentProfileKeys.all, 'core'] as const,
  uploadPolicy: () => [...studentProfileKeys.all, 'upload-policy'] as const,
  collection: (kind: ProfileCollectionKind) => [...studentProfileKeys.all, kind] as const,
  collectionPage: (kind: ProfileCollectionKind, query: ProfileCollectionQuery) =>
    [...studentProfileKeys.collection(kind), query] as const,
}
