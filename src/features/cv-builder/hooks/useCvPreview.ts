import { useMutation } from '@tanstack/react-query'
import { cvBuilderApi } from '../api/cvBuilderApi'
import type { CvPreview, CvPreviewRequest } from '../types/cvBuilderTypes'

export function useCvPreview(options?: {
  onSuccess?: (preview: CvPreview, request: CvPreviewRequest) => void
}) {
  return useMutation({
    mutationFn: (request: CvPreviewRequest) => cvBuilderApi.createPreview(request),
    retry: false,
    onSuccess: options?.onSuccess,
  })
}
