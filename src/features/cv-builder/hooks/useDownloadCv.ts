import { useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { saveBlobAsFile } from '../../../shared/utils/downloadBlob'
import { cvBuilderApi } from '../api/cvBuilderApi'
import type { CvDownloadTarget } from '../types/cvBuilderTypes'

export function useDownloadCv() {
  const { notify } = useNotifications()
  const activeController = useRef<AbortController | null>(null)

  useEffect(() => () => activeController.current?.abort(), [])

  const mutation = useMutation({
    mutationFn: async (target: CvDownloadTarget) => {
      activeController.current?.abort()
      const controller = new AbortController()
      activeController.current = controller
      try {
        const file =
          target.kind === 'latest'
            ? await cvBuilderApi.downloadLatest(controller.signal)
            : await cvBuilderApi.downloadVersion(target.cvVersionId, controller.signal)
        saveBlobAsFile(file.blob, file.filename)
        return file
      } finally {
        if (activeController.current === controller) {
          activeController.current = null
        }
      }
    },
    retry: false,
    onSuccess: (file) => {
      notify({ tone: 'success', title: 'PDF download started', message: file.filename })
    },
    onError: (error) => {
      const mapped = mapApiError(error, 'protected')
      const message =
        mapped.code === 'CV_NOT_SAVED'
          ? 'Save a CV version before downloading the latest PDF.'
          : mapped.code === 'CV_FILE_UNAVAILABLE'
            ? 'The PDF is temporarily unavailable. Please try the download again.'
            : mapped.message
      notify({ tone: 'error', title: 'PDF download failed', message })
    },
  })

  return {
    ...mutation,
    pendingTargetKey: mutation.isPending ? targetKey(mutation.variables) : null,
  }
}

function targetKey(target: CvDownloadTarget | undefined) {
  if (!target) return null
  return target.kind === 'latest' ? 'latest' : target.cvVersionId
}
