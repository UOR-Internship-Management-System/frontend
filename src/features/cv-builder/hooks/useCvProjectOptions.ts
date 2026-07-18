import { useQuery } from '@tanstack/react-query'
import { studentProjectsApi } from '../../student-projects/api/studentProjectsApi'
import { cvBuilderKeys } from './cvBuilderKeys'
import { shouldRetryCvQuery } from './useCvFreshness'

const projectPageSize = 100

export function useCvProjectOptions() {
  return useQuery({
    queryKey: cvBuilderKeys.projectOptions(),
    queryFn: async ({ signal }) => {
      const query = { page: 0, size: projectPageSize, sort: 'title,asc' }
      const firstPage = await studentProjectsApi.list(query, signal)
      if (firstPage.page.totalPages <= 1) return firstPage.items

      const remainingPages = await Promise.all(
        Array.from({ length: firstPage.page.totalPages - 1 }, (_, index) =>
          studentProjectsApi.list({ ...query, page: index + 1 }, signal),
        ),
      )
      return [firstPage, ...remainingPages].flatMap((page) => page.items)
    },
    staleTime: 60_000,
    retry: shouldRetryCvQuery,
  })
}
