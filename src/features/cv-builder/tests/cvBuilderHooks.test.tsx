import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NotificationProvider } from '../../../app/providers/NotificationProvider'
import * as downloadBlob from '../../../shared/utils/downloadBlob'
import { cvBuilderApi } from '../api/cvBuilderApi'
import { cvBuilderKeys } from '../hooks/cvBuilderKeys'
import { useCurrentCv } from '../hooks/useCurrentCv'
import { useCvPreview } from '../hooks/useCvPreview'
import { useDownloadCv } from '../hooks/useDownloadCv'
import { useSaveCv } from '../hooks/useSaveCvVersion'
import { cvFreshnessSchema, cvPreviewSchema, cvSchema } from '../schemas/cvBuilderSchemas'
import { emptyCvRecordSelections } from '../mappers/cvMapper'

const previewId = '70000000-0000-4000-8000-000000000001'
const cvId = '50000000-0000-4000-8000-000000000004'
const freshness = cvFreshnessSchema.parse({
  status: 'NOT_SAVED',
  changedAreas: [],
  cvId: null,
  savedAt: null,
  evaluatedAt: '2026-07-21T08:00:00Z',
  message: 'No saved CV exists.',
})
const preview = cvPreviewSchema.parse({
  previewId,
  htmlPreview: '<article>Preview</article>',
  freshness,
  configuration: emptyCvRecordSelections,
  generatedAt: '2026-07-21T08:00:00Z',
  expiresAt: '2026-07-21T08:15:00Z',
})
const cv = cvSchema.parse({
  cvId,
  revision: 1,
  createdAt: '2026-07-21T08:02:00Z',
  generatedAt: '2026-07-21T08:01:30Z',
  savedAt: '2026-07-21T08:02:00Z',
  downloadUrl: '/me/cv/download',
  freshnessStatus: 'CURRENT',
  configuration: preview.configuration,
  pdfFile: {
    fileName: 'student-cv.pdf',
    mediaType: 'application/pdf',
    fileSizeBytes: 184_320,
    generatedAt: '2026-07-21T08:01:30Z',
  },
})

describe('CV Builder hooks', () => {
  afterEach(() => vi.restoreAllMocks())

  it('does not request the active CV until a saved CV is known', async () => {
    const getCurrent = vi.spyOn(cvBuilderApi, 'getCurrent').mockResolvedValue(cv)
    const { wrapper } = createWrapper()
    const { result, rerender } = renderHook(({ enabled }) => useCurrentCv(enabled), {
      initialProps: { enabled: false },
      wrapper,
    })
    expect(result.current.fetchStatus).toBe('idle')
    expect(getCurrent).not.toHaveBeenCalled()
    rerender({ enabled: true })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.revision).toBe(1)
  })

  it('keeps preview generation user-triggered and non-retrying', async () => {
    const createPreview = vi.spyOn(cvBuilderApi, 'createPreview').mockResolvedValue(preview)
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useCvPreview(), { wrapper })
    expect(createPreview).not.toHaveBeenCalled()
    await act(async () => void (await result.current.mutateAsync(preview.configuration)))
    expect(createPreview).toHaveBeenCalledOnce()
  })

  it('stores the active CV and invalidates freshness after save', async () => {
    vi.spyOn(cvBuilderApi, 'saveCurrent').mockResolvedValue(cv)
    const { queryClient, wrapper } = createWrapper()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useSaveCv(), { wrapper })

    await act(async () => void (await result.current.mutateAsync({ previewId, revision: null })))

    expect(queryClient.getQueryData(cvBuilderKeys.current())).toEqual(cv)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: cvBuilderKeys.freshness() })
  })

  it('downloads only after a user mutation and delegates blob saving once', async () => {
    const blob = new Blob(['pdf'], { type: 'application/pdf' })
    const downloadCurrent = vi.spyOn(cvBuilderApi, 'downloadCurrent').mockResolvedValue({
      blob,
      filename: 'student-cv.pdf',
      contentType: 'application/pdf',
      contentLength: 3,
    })
    const save = vi.spyOn(downloadBlob, 'saveBlobAsFile').mockImplementation(() => undefined)
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useDownloadCv(), { wrapper })
    expect(downloadCurrent).not.toHaveBeenCalled()
    await act(async () => void (await result.current.mutateAsync({ kind: 'current' })))
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
