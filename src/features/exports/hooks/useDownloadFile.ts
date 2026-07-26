import { useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import type { DownloadedFile, DownloadContentType } from '../../../shared/api/httpDownloadClient'
import { saveBlobAsFile } from '../../../shared/utils/downloadBlob'
import { exportsApi } from '../api/exportsApi'
import type { CandidateCvDownloadInput, ExportDownloadInput } from '../types/exportTypes'

type DownloadResult = Promise<DownloadedFile<DownloadContentType>>

function useAbortableDownload<TInput>(
  download: (input: TInput, signal: AbortSignal) => DownloadResult,
  extension: (input: TInput) => '.pdf' | '.csv' | '.zip',
) {
  const activeController = useRef<AbortController | null>(null)
  useEffect(() => () => activeController.current?.abort(), [])

  return useMutation({
    mutationFn: async (input: TInput) => {
      activeController.current?.abort()
      const controller = new AbortController()
      activeController.current = controller
      try {
        const file = await download(input, controller.signal)
        saveBlobAsFile(file.blob, file.filename, extension(input))
        return file
      } finally {
        if (activeController.current === controller) activeController.current = null
      }
    },
    retry: false,
  })
}

export function useDownloadExportFile() {
  return useAbortableDownload<ExportDownloadInput>(
    (input, signal) => exportsApi.downloadExport(input, signal),
    (input) => (input.contentType === 'text/csv' ? '.csv' : '.zip'),
  )
}

export function useCandidateCvDownload() {
  return useAbortableDownload<CandidateCvDownloadInput>(
    (input, signal) => exportsApi.downloadCandidateCv(input, signal),
    () => '.pdf',
  )
}

export function getExportDownloadErrorMessage(error: unknown) {
  const mapped = mapApiError(error, 'protected')
  if (mapped.code === 'EXPORT_NOT_READY') {
    return 'The export is still being prepared. Wait for completion and try again.'
  }
  if (mapped.code === 'EXPORT_FILE_UNAVAILABLE' || mapped.code === 'EXPORT_EXPIRED') {
    return 'The export file is unavailable or expired. Start a new export.'
  }
  if (mapped.code === 'CV_NOT_SAVED') {
    return 'This Student no longer has a saved CV available for download.'
  }
  return mapped.message
}
