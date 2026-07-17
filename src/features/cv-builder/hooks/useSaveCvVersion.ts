import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { cvBuilderApi } from '../api/cvBuilderApi'
import { cvBuilderKeys } from './cvBuilderKeys'

export function useSaveCvVersion() {
  const queryClient = useQueryClient()
  const { notify } = useNotifications()

  return useMutation({
    mutationFn: (previewId: string) => cvBuilderApi.saveVersion(previewId),
    retry: false,
    onSuccess: async (version) => {
      notify({
        tone: 'success',
        title: 'CV version saved',
        message: `${version.versionLabel} is now your latest saved CV.`,
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cvBuilderKeys.freshness() }),
        queryClient.invalidateQueries({ queryKey: cvBuilderKeys.versions() }),
      ])
    },
    onError: (error) => {
      const mapped = mapApiError(error, 'protected')
      notify({
        tone: 'error',
        title: mapped.code === 'CV_PREVIEW_EXPIRED' ? 'Preview expired' : 'CV was not saved',
        message:
          mapped.code === 'CV_PREVIEW_EXPIRED'
            ? 'Regenerate the preview, review it, and save again.'
            : mapped.message,
      })
    },
  })
}
