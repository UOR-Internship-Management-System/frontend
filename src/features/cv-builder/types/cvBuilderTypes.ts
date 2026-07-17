import type {
  ApiCvFreshnessResponse,
  ApiCvPreviewRequest,
  ApiCvPreviewResponse,
  ApiCvSectionType,
  ApiCvSourceArea,
  ApiCvVersionResponse,
  ApiPagedCvVersionResponse,
} from '../../../shared/api/generated/cvManagementApi.types'

export type CvFreshness = ApiCvFreshnessResponse
export type CvPreviewRequest = ApiCvPreviewRequest
export type CvPreview = ApiCvPreviewResponse
export type CvVersion = ApiCvVersionResponse
export type PagedCvVersions = ApiPagedCvVersionResponse
export type CvSection = ApiCvSectionType
export type CvSourceArea = ApiCvSourceArea

export type CvVersionQuery = {
  page: number
  size: number
  sort: string
}

export type CvFreshnessView = CvFreshness & {
  title: string
  tone: 'neutral' | 'success' | 'warning'
  changedAreaLabels: string[]
  latestSavedAtLabel: string | null
}

export type CvVersionView = CvVersion & {
  savedAtLabel: string
  generatedAtLabel: string
  fileSizeLabel: string
}

export type CvDownloadTarget = { kind: 'latest' } | { kind: 'version'; cvVersionId: string }
