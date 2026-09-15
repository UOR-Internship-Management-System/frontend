import type { LedgerUploadDetail } from '../schemas/ledgerSchemas'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import { mapUploadStatus, mapValidationStatus } from '../mappers/academicLedgerMappers'

export function LedgerUploadStatus({ detail }: { detail: LedgerUploadDetail }) {
  const upload = mapUploadStatus(detail.uploadStatus)
  const validation = mapValidationStatus(detail.validationStatus)
  return (
    <Card aria-live="polite" variant="outlined">
      <CardHeader className="s5-section-heading">
        <div>
          <CardTitle>{detail.originalFilename}</CardTitle>
          <p>{detail.statusMessage}</p>
        </div>
        <div className="al-status-badges">
          <StatusBadge tone={upload.tone}>{upload.label}</StatusBadge>
          <StatusBadge tone={validation.tone}>{validation.label}</StatusBadge>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="al-stat-grid">
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
      </CardContent>
    </Card>
  )
}
