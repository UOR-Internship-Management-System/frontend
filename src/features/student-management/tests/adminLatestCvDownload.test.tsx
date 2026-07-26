import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as downloadBlob from '../../../shared/utils/downloadBlob'
import { studentManagementApi } from '../api/studentManagementApi'
import {
  getAdminCvDownloadErrorMessage,
  useAdminLatestCvDownload,
} from '../hooks/useAdminLatestCvDownload'
import { deepDiveStudentId } from './studentDeepDiveTestFixtures'

describe('Admin latest CV download', () => {
  afterEach(() => vi.restoreAllMocks())

  it('downloads on explicit mutation and saves the server filename once', async () => {
    const blob = new Blob(['pdf'], { type: 'application/pdf' })
    const download = vi.spyOn(studentManagementApi, 'downloadLatestCv').mockResolvedValue({
      blob,
      filename: 'Asha_Silva_CV.pdf',
      contentType: 'application/pdf',
      contentLength: 3,
    })
    const save = vi.spyOn(downloadBlob, 'saveBlobAsFile').mockImplementation(() => undefined)
    const { result } = renderHook(() => useAdminLatestCvDownload(deepDiveStudentId), {
      wrapper: createWrapper(),
    })

    expect(download).not.toHaveBeenCalled()
    await act(async () => void (await result.current.mutateAsync()))
    expect(download).toHaveBeenCalledWith(deepDiveStudentId, expect.any(AbortSignal))
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith(blob, 'Asha_Silva_CV.pdf')
  })

  it('aborts an active audited download when the owning panel unmounts', async () => {
    let signal: AbortSignal | undefined
    vi.spyOn(studentManagementApi, 'downloadLatestCv').mockImplementation((_studentId, value) => {
      signal = value
      return new Promise(() => undefined)
    })
    const { result, unmount } = renderHook(() => useAdminLatestCvDownload(deepDiveStudentId), {
      wrapper: createWrapper(),
    })
    act(() => result.current.mutate())
    await waitFor(() => expect(signal?.aborted).toBe(false))
    unmount()
    expect(signal?.aborted).toBe(true)
  })

  it('maps missing files, expired sessions, and transient failures to controlled messages', () => {
    expect(
      getAdminCvDownloadErrorMessage({
        status: 404,
        title: 'CV file not found',
        code: 'CV_FILE_UNAVAILABLE',
      }),
    ).toContain('currently unavailable')
    expect(getAdminCvDownloadErrorMessage({ status: 401, title: 'Unauthorized' })).toContain(
      'session has expired',
    )
    expect(getAdminCvDownloadErrorMessage({ status: 503, title: 'Service unavailable' })).toContain(
      'temporarily unavailable',
    )
  })
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  })
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
