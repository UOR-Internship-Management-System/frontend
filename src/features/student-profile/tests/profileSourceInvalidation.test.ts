import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { cvBuilderKeys } from '../../cv-builder/hooks/cvBuilderKeys'
import { invalidateProfileSourceQueries } from '../hooks/invalidateProfileSourceQueries'
import { studentProfileKeys } from '../hooks/studentProfileKeys'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

describe('Student Profile source-data invalidation', () => {
  it(
    'invalidates the core Profile and CV freshness queries after a core or photo mutation',
    async () => {
      const queryClient = createQueryClient()
      queryClient.setQueryData(studentProfileKeys.core(), { version: 1 })
      queryClient.setQueryData(cvBuilderKeys.freshness(), { stale: false })

      await invalidateProfileSourceQueries(queryClient)

      expect(queryClient.getQueryState(studentProfileKeys.core())?.isInvalidated).toBe(true)
      expect(queryClient.getQueryState(cvBuilderKeys.freshness())?.isInvalidated).toBe(true)
    },
  )

  it('also invalidates every active page of the changed repeating Profile section', async () => {
    const queryClient = createQueryClient()
    const firstPageKey = studentProfileKeys.collectionPage('certificates', {
      page: 0,
      search: '',
      size: 5,
      sort: 'issueDate,desc',
    })
    const searchPageKey = studentProfileKeys.collectionPage('certificates', {
      page: 0,
      search: 'cloud',
      size: 5,
      sort: 'issueDate,desc',
    })
    queryClient.setQueryData(firstPageKey, { items: [] })
    queryClient.setQueryData(searchPageKey, { items: [] })
    queryClient.setQueryData(studentProfileKeys.core(), { version: 1 })
    queryClient.setQueryData(cvBuilderKeys.freshness(), { stale: false })

    await invalidateProfileSourceQueries(queryClient, 'certificates')

    expect(queryClient.getQueryState(firstPageKey)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(searchPageKey)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(studentProfileKeys.core())?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(cvBuilderKeys.freshness())?.isInvalidated).toBe(true)
  })
})
