import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { cvBuilderApi } from '../api/cvBuilderApi'
import { mapCvVersion } from '../mappers/cvMapper'
import type { CvVersionQuery } from '../types/cvBuilderTypes'
import { cvBuilderKeys } from './cvBuilderKeys'
import { shouldRetryCvQuery } from './useCvFreshness'

export function useCvVersions(query: CvVersionQuery) {
  return useQuery({
    queryKey: cvBuilderKeys.versionList(query),
    queryFn: ({ signal }) => cvBuilderApi.listVersions(query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryCvQuery,
    select: (response) => ({
      ...response,
      items: response.items.map(mapCvVersion),
    }),
  })
}
