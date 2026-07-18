import type {
  ApiCvFreshnessResponse,
  ApiCvPreviewRequest,
  ApiCvPreviewResponse,
  ApiCvSourceArea,
  ApiCvResponse,
} from '../../../shared/api/generated/cvManagementApi.types'

export type CvFreshness = ApiCvFreshnessResponse
export type CvPreviewRequest = ApiCvPreviewRequest
export type CvPreview = ApiCvPreviewResponse
export type Cv = ApiCvResponse
export type CvSourceArea = ApiCvSourceArea

export type CvFreshnessView = CvFreshness & {
  title: string
  tone: 'neutral' | 'success' | 'warning'
  changedAreaLabels: string[]
  savedAtLabel: string | null
}

export type CvView = Cv & {
  savedAtLabel: string
  generatedAtLabel: string
  fileSizeLabel: string
}

export type CvDownloadTarget = { kind: 'current' }
