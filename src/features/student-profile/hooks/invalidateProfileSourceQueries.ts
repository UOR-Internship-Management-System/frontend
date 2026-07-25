import type { QueryClient } from '@tanstack/react-query'
import { cvBuilderKeys } from '../../cv-builder/hooks/cvBuilderKeys'
import type { ProfileCollectionKind } from '../types/profileEntryTypes'
import { studentProfileKeys } from './studentProfileKeys'

/**
 * Marks every view derived from Student profile data as stale after a committed mutation.
 * Active Profile queries refresh immediately; the CV Builder freshness query refreshes when
 * mounted and remains stale until then.
 */
export async function invalidateProfileSourceQueries(
  queryClient: QueryClient,
  collection?: ProfileCollectionKind,
) {
  const invalidations = [
    queryClient.invalidateQueries({
      queryKey: studentProfileKeys.core(),
      refetchType: 'active',
    }),
    queryClient.invalidateQueries({
      queryKey: cvBuilderKeys.freshness(),
      refetchType: 'active',
    }),
  ]

  if (collection) {
    invalidations.unshift(
      queryClient.invalidateQueries({
        queryKey: studentProfileKeys.collection(collection),
        refetchType: 'active',
      }),
    )
  }

  await Promise.all(invalidations)
}
