import { useQuery } from '@tanstack/react-query'
import { cvBuilderApi } from '../api/cvBuilderApi'
import { mapCv } from '../mappers/cvMapper'
import { cvBuilderKeys } from './cvBuilderKeys'
import { shouldRetryCvQuery } from './useCvFreshness'

export function useCurrentCv(enabled: boolean) {
  return useQuery({
    queryKey: cvBuilderKeys.current(),
    queryFn: ({ signal }) => cvBuilderApi.getCurrent(signal),
    enabled,
    retry: shouldRetryCvQuery,
    select: mapCv,
  })
}
