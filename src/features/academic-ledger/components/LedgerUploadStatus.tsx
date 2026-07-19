import type { ApiAcademicLedgerUploadDetailResponse } from '../../../shared/api/generated/cvManagementApi.types'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import { mapUploadStatus, mapValidationStatus } from '../mappers/academicLedgerMappers'

export function LedgerUploadStatus({ detail }: { detail: ApiAcademicLedgerUploadDetailResponse }) {
  const upload = mapUploadStatus(detail.uploadStatus)
  const validation = mapValidationStatus(detail.validationStatus)
  return (
    <section aria-live="polite" className="section-card ledger-status-card">
      <div>
        <p className="section-kicker">Selected batch</p>
        <h2>{detail.originalFilename}</h2>
        <p>{detail.statusMessage}</p>
      </div>
      <div className="ledger-status-badges">
        <StatusBadge tone={upload.tone}>{upload.label}</StatusBadge>
        <StatusBadge tone={validation.tone}>{validation.label}</StatusBadge>
      </div>
      <dl className="ledger-stat-grid">
        <div>
          <dt>Total rows</dt>
          <dd>{detail.totalRows}</dd>
        </div>
        <div>
          <dt>Valid</dt>
          <dd>{detail.validRows}</dd>
        </div>
        <div>
          <dt>Invalid</dt>
          <dd>{detail.invalidRows}</dd>
        </div>
      </dl>
      {detail.failureSummary ? (
        <p className="error-text" role="alert">
          {detail.failureSummary}
        </p>
      ) : null}
    </section>
  )
}
