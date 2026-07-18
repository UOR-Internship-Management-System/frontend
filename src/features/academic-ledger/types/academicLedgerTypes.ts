import type {
  ApiAcademicLedgerRowValidationStatus,
  ApiAcademicLedgerStagedRowSort,
  ApiAcademicLedgerUploadDetailResponse,
  ApiAcademicLedgerUploadSort,
  ApiAcademicLedgerUploadStatus,
  ApiAcademicLedgerValidationResultResponse,
  ApiAcademicLedgerValidationStatus,
} from '../../../shared/api/generated/cvManagementApi.types'

export type LedgerUploadsQuery = {
  page: number
  size: 20 | 50 | 100
  sort: ApiAcademicLedgerUploadSort
  search: string
  status?: ApiAcademicLedgerUploadStatus
  validationStatus?: ApiAcademicLedgerValidationStatus
}

export type LedgerStagedRowsQuery = {
  page: number
  size: 20 | 50 | 100
  sort: ApiAcademicLedgerStagedRowSort
  search: string
  validationStatus?: ApiAcademicLedgerRowValidationStatus
}

export type LedgerUploadAcceptance = {
  data: ApiAcademicLedgerUploadDetailResponse
  location: string | null
  retryAfterSeconds: number | null
}

export type LedgerStatusView = {
  label: string
  tone: 'neutral' | 'success' | 'danger'
}

export type CommitEligibilityInput = {
  detail: ApiAcademicLedgerUploadDetailResponse | null | undefined
  validation: ApiAcademicLedgerValidationResultResponse | null | undefined
  isPending: boolean
}
