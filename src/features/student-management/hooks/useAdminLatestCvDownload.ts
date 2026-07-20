import { useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { saveBlobAsFile } from '../../../shared/utils/downloadBlob'
import { studentManagementApi } from '../api/studentManagementApi'

export function useAdminLatestCvDownload(studentId: string) {
  const activeController = useRef<AbortController | null>(null)
  useEffect(() => () => activeController.current?.abort(), [])

  return useMutation({
    mutationFn: async () => {
      activeController.current?.abort()
      const controller = new AbortController()
      activeController.current = controller
      try {
        const file = await studentManagementApi.downloadLatestCv(studentId, controller.signal)
        saveBlobAsFile(file.blob, file.filename)
        return file
      } finally {
        if (activeController.current === controller) activeController.current = null
      }
    },
    retry: false,
  })
}

export function getAdminCvDownloadErrorMessage(error: unknown) {
  const mapped = mapApiError(error, 'protected')
  if (mapped.code === 'CV_NOT_SAVED') {
    return 'This Student no longer has a saved CV available for download.'
  }
  if (mapped.code === 'CV_FILE_UNAVAILABLE' || mapped.code === 'CV_FILE_NOT_FOUND') {
    return 'The saved CV file is currently unavailable. Try again later.'
  }
  return mapped.message
}
