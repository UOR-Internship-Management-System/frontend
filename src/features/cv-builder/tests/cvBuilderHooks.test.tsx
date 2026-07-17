import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NotificationProvider } from '../../../app/providers/NotificationProvider'
import * as downloadBlob from '../../../shared/utils/downloadBlob'
import { cvBuilderApi } from '../api/cvBuilderApi'
import { cvBuilderKeys } from '../hooks/cvBuilderKeys'
import { useCvFreshness } from '../hooks/useCvFreshness'
import { useCvPreview } from '../hooks/useCvPreview'
import { useCvVersions } from '../hooks/useCvVersions'
import { useDownloadCv } from '../hooks/useDownloadCv'
import { useSaveCvVersion } from '../hooks/useSaveCvVersion'
import { cvFreshnessSchema, cvPreviewSchema, cvVersionSchema } from '../schemas/cvBuilderSchemas'

const previewId = '70000000-0000-4000-8000-000000000001'
const versionId = '50000000-0000-4000-8000-000000000004'
const freshness = cvFreshnessSchema.parse({
  status: 'NOT_SAVED',
  changedAreas: [],
  latestSavedCvVersionId: null,
  latestSavedAt: null,
  evaluatedAt: '2026-07-21T08:00:00Z',
  message: 'No saved CV exists.',
})
const preview = cvPreviewSchema.parse({
  previewId,
  htmlPreview: '<article>Preview</article>',
  latexSource: '\\documentclass{article}',
  freshness,
  configuration: { sectionOrder: ['SKILLS'], includedProjectIds: [] },
  generatedAt: '2026-07-21T08:00:00Z',
  expiresAt: '2026-07-21T08:15:00Z',
})
const version = cvVersionSchema.parse({
  cvVersionId: versionId,
  versionNumber: 4,
  versionLabel: 'Version 4',
  latest: true,
  createdAt: '2026-07-21T08:02:00Z',
  generatedAt: '2026-07-21T08:01:30Z',
  savedAt: '2026-07-21T08:02:00Z',
  downloadUrl: `/me/cv/versions/${versionId}/download`,
  freshnessStatus: 'CURRENT',
  pdfFile: {
    fileName: 'cv-version-4.pdf',
    mediaType: 'application/pdf',
    fileSizeBytes: 184_320,
    generatedAt: '2026-07-21T08:01:30Z',
  },
})

describe('CV Builder hooks', () => {
  afterEach(() => vi.restoreAllMocks())

  it('loads freshness and always uses the feature-owned key', async () => {
    vi.spyOn(cvBuilderApi, 'getFreshness').mockResolvedValue(freshness)
    const { queryClient, wrapper } = createWrapper()
    const { result } = renderHook(() => useCvFreshness(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(cvBuilderKeys.freshness())).toEqual(freshness)
  })

  it('keeps preview POST user-triggered and never retries a failed generation', async () => {
    const createPreview = vi
      .spyOn(cvBuilderApi, 'createPreview')
      .mockRejectedValue({ status: 503, title: 'Unavailable', code: 'CV_GENERATION_FAILED' })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useCvPreview(), { wrapper })
    expect(createPreview).not.toHaveBeenCalled()

    await act(async () => {
      await expect(result.current.mutateAsync(preview.configuration)).rejects.toBeTruthy()
    })
    expect(createPreview).toHaveBeenCalledOnce()
  })

  it('invalidates freshness and all version lists after save without optimistic data', async () => {
    vi.spyOn(cvBuilderApi, 'saveVersion').mockResolvedValue(version)
    const { queryClient, wrapper } = createWrapper()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useSaveCvVersion(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(previewId)
    })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: cvBuilderKeys.freshness() })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: cvBuilderKeys.versions() })
  })

  it('maps version pages and retains contract query input', async () => {
    const query = { page: 0, size: 20, sort: 'savedAt,desc' }
    vi.spyOn(cvBuilderApi, 'listVersions').mockResolvedValue({
      items: [version],
      page: { page: 0, size: 20, totalElements: 1, totalPages: 1, sort: query.sort },
    })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useCvVersions(query), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items[0]?.fileSizeLabel).toBe('180.0 KB')
  })

  it('downloads only after a user mutation and delegates blob saving once', async () => {
    const blob = new Blob(['pdf'], { type: 'application/pdf' })
    const downloadLatest = vi.spyOn(cvBuilderApi, 'downloadLatest').mockResolvedValue({
      blob,
      filename: 'student-cv.pdf',
      contentType: 'application/pdf',
      contentLength: 3,
    })
    const save = vi.spyOn(downloadBlob, 'saveBlobAsFile').mockImplementation(() => undefined)
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useDownloadCv(), { wrapper })
    expect(downloadLatest).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.mutateAsync({ kind: 'latest' })
    })
    expect(save).toHaveBeenCalledWith(blob, 'student-cv.pdf')
  })
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>{children}</NotificationProvider>
    </QueryClientProvider>
  )
  return { queryClient, wrapper }
}
