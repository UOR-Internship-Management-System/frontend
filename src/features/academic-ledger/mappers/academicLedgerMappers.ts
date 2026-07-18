import type {
  ApiAcademicLedgerUploadDetailResponse,
  ApiAcademicLedgerUploadStatus,
  ApiAcademicLedgerValidationStatus,
} from '../../../shared/api/generated/cvManagementApi.types'
import type { CommitEligibilityInput, LedgerStatusView } from '../types/academicLedgerTypes'

const uploadStatusLabels: Record<ApiAcademicLedgerUploadStatus, LedgerStatusView> = {
  RECEIVED: { label: 'Upload received', tone: 'neutral' },
  PROCESSING: { label: 'Processing file', tone: 'neutral' },
  STAGED: { label: 'Rows staged', tone: 'neutral' },
  READY_TO_COMMIT: { label: 'Ready to commit', tone: 'success' },
  COMMITTING: { label: 'Committing records', tone: 'neutral' },
  COMMITTED: { label: 'Committed', tone: 'success' },
  VALIDATION_FAILED: { label: 'Validation failed', tone: 'danger' },
  PROCESSING_FAILED: { label: 'Processing failed', tone: 'danger' },
}

const validationStatusLabels: Record<ApiAcademicLedgerValidationStatus, LedgerStatusView> = {
  NOT_STARTED: { label: 'Validation not started', tone: 'neutral' },
  IN_PROGRESS: { label: 'Validation in progress', tone: 'neutral' },
  PASSED: { label: 'Validation passed', tone: 'success' },
  FAILED: { label: 'Validation failed', tone: 'danger' },
}

export const mapUploadStatus = (status: ApiAcademicLedgerUploadStatus) => uploadStatusLabels[status]
export const mapValidationStatus = (status: ApiAcademicLedgerValidationStatus) =>
  validationStatusLabels[status]

const pollableStatuses = new Set<ApiAcademicLedgerUploadStatus>([
  'RECEIVED',
  'PROCESSING',
  'COMMITTING',
])

export function shouldPollLedgerUpload(detail: ApiAcademicLedgerUploadDetailResponse) {
  if (detail.uploadStatus === 'STAGED') {
    return detail.validationStatus === 'NOT_STARTED' || detail.validationStatus === 'IN_PROGRESS'
  }
  return pollableStatuses.has(detail.uploadStatus)
}

export function ledgerPollInterval(
  detail: ApiAcademicLedgerUploadDetailResponse | undefined,
  retryAfterSeconds?: number | null,
) {
  if (!detail || !shouldPollLedgerUpload(detail)) return false as const
  return (detail.nextPollAfterSeconds ?? retryAfterSeconds ?? 3) * 1000
}

export function canCommitLedger({ detail, isPending, validation }: CommitEligibilityInput) {
  return Boolean(
    detail?.uploadStatus === 'READY_TO_COMMIT' &&
    detail.validationStatus === 'PASSED' &&
    validation?.validationStatus === 'PASSED' &&
    validation.valid &&
    validation.invalidRows === 0 &&
    !isPending,
  )
}
