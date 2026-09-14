import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import { mapUploadStatus, mapValidationStatus } from '../mappers/academicLedgerMappers'
import type { LedgerUploadSummary } from '../schemas/ledgerSchemas'

export function LedgerUploadsCardList({
  items,
  onDelete,
  onSelect,
  selectedId,
}: {
  items: LedgerUploadSummary[]
  selectedId: string | null
  onDelete: (item: LedgerUploadSummary) => void
  onSelect: (uploadId: string) => void
}) {
  const DELETE_BLOCKED_STATUSES = new Set(['PROCESSING', 'COMMITTING', 'COMMITTED'])

  return (
    <ul className="rsp-card-list" aria-label="Recent academic ledger upload batches" role="list">
      {items.map((item) => {
        const upload = mapUploadStatus(item.uploadStatus)
        const validation = mapValidationStatus(item.validationStatus)
        const isSelected = selectedId === item.uploadId

        return (
          <li key={item.uploadId} className="rsp-card-list__item">
            <article
              className={`rsp-student-card ${isSelected ? 'is-selected' : ''}`}
              aria-label={`Batch: ${item.originalFilename}`}
            >
              {/* Icon / Avatar substitute */}
              <div
                className="rsp-student-card__avatar"
                style={{ background: 'var(--surface-container-high)', color: 'var(--text)' }}
                aria-hidden="true"
              >
                <span className="material-symbols-outlined">csv</span>
              </div>

              {/* Body */}
              <div className="rsp-student-card__body">
                <div className="rsp-student-card__header">
                  <span className="rsp-student-card__name" style={{ wordBreak: 'break-all' }}>
                    {item.originalFilename}
                  </span>
                  <span className="rsp-student-card__index">{Math.ceil(item.fileSizeBytes / 1024)} KiB</span>
                </div>

                <p className="rsp-student-card__degree">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(item.uploadedAt))} • {item.totalRows} rows
                </p>

                <div className="rsp-student-card__chips">
                  <StatusBadge tone={upload.tone}>{upload.label}</StatusBadge>
                  <StatusBadge tone={validation.tone}>{validation.label}</StatusBadge>
                </div>
              </div>

              {/* Trailing actions */}
              <div className="rsp-student-card__action" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button
                  aria-pressed={isSelected}
                  onClick={() => onSelect(item.uploadId)}
                  size="sm"
                  variant={isSelected ? 'filled' : 'outlined'}
                >
                  Inspect
                </Button>
                <Button
                  aria-label={`Delete ${item.originalFilename}`}
                  disabled={DELETE_BLOCKED_STATUSES.has(item.uploadStatus)}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item)
                  }}
                  size="sm"
                  variant="text"
                  icon={<span className="material-symbols-outlined" aria-hidden="true">delete</span>}
                />
              </div>
            </article>
          </li>
        )
      })}
    </ul>
  )
}
