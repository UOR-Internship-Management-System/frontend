import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { cvBuilderApi } from '../api/cvBuilderApi'
import { cvBuilderKeys } from './cvBuilderKeys'

export function useSaveCv() {
  const queryClient = useQueryClient()
  const { notify } = useNotifications()

  return useMutation({
    mutationFn: ({ previewId, revision }: { previewId: string; revision: number | null }) =>
      cvBuilderApi.saveCurrent(previewId, revision),
    retry: false,
    onSuccess: async (cv) => {
      queryClient.setQueryData(cvBuilderKeys.current(), cv)
      notify({
        tone: 'success',
        title: cv.revision === 1 ? 'CV saved' : 'CV updated',
        message: 'Your active CV is ready to download and available to administrators.',
      })
      await queryClient.invalidateQueries({ queryKey: cvBuilderKeys.freshness() })
    },
    onError: (error) => {
      const mapped = mapApiError(error, 'protected')
      notify({
        tone: 'error',
        title: mapped.code === 'CV_PREVIEW_EXPIRED' ? 'Preview expired' : 'CV was not saved',
        message:
          mapped.code === 'CV_PREVIEW_EXPIRED'
            ? 'Regenerate the preview, review it, and save again.'
            : mapped.code === 'STALE_VERSION'
              ? 'Your saved CV changed in another session. Refresh and generate a new preview.'
              : mapped.message,
      })
    },
  })
}
