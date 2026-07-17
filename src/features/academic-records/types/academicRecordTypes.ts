import type {
  ApiAcademicRecordResponse,
  ApiGpaSummaryResponse,
  ApiPagedAcademicRecordResponse,
} from '../../../shared/api/generated/cvManagementApi.types'

export type AcademicRecord = ApiAcademicRecordResponse
export type GpaSummary = ApiGpaSummaryResponse
export type PagedAcademicRecords = ApiPagedAcademicRecordResponse

export type AcademicRecordQuery = {
  page: number
  size: number
  sort: string
  search?: string
}

export type AcademicRecordView = AcademicRecord & {
  creditsLabel: string
  gradePointLabel: string
  periodLabel: string
  committedAtLabel: string
}

export type GpaSummaryView = GpaSummary & {
  gpaLabel: string | null
  creditsLabel: string | null
  calculatedAtLabel: string | null
  sourceLabel: string | null
}

export type AcademicSortOption = {
  label: string
  value: string
}
