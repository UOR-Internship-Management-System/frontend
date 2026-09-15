import type { LedgerUploadSummary } from '../schemas/ledgerSchemas'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import { mapUploadStatus, mapValidationStatus } from '../mappers/academicLedgerMappers'

const DELETE_BLOCKED_STATUSES = new Set(['PROCESSING', 'COMMITTING', 'COMMITTED'])

export function LedgerUploadsTable({
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
  return (
    <div className="al-table-wrap" tabIndex={0}>
      <table className="al-table">
        <caption className="visually-hidden">Recent academic ledger upload batches</caption>
        <thead>
          <tr>
            <th scope="col">File</th>
            <th scope="col">Uploaded</th>
            <th scope="col">Upload</th>
            <th scope="col">Validation</th>
            <th scope="col">Rows</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const upload = mapUploadStatus(item.uploadStatus)
            const validation = mapValidationStatus(item.validationStatus)
            return (
              <tr className={selectedId === item.uploadId ? 'is-selected' : ''} key={item.uploadId}>
                <td>
                  <strong>{item.originalFilename}</strong>
                  <span className="al-secondary">{Math.ceil(item.fileSizeBytes / 1024)} KiB</span>
                </td>
                <td>
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(item.uploadedAt))}
                </td>
                <td>
                  <StatusBadge tone={upload.tone}>{upload.label}</StatusBadge>
                </td>
                <td>
                  <StatusBadge tone={validation.tone}>{validation.label}</StatusBadge>
                </td>
                <td>{item.totalRows}</td>
                <td className="al-action-cell">
                  <Button
                    aria-pressed={selectedId === item.uploadId}
                    onClick={() => onSelect(item.uploadId)}
                    size="sm"
                    variant={selectedId === item.uploadId ? 'tonal' : 'outlined'}
                  >
                    Inspect
                  </Button>
                  <Button
                    aria-label={`Delete ${item.originalFilename}`}
                    disabled={DELETE_BLOCKED_STATUSES.has(item.uploadStatus)}
                    onClick={() => onDelete(item)}
                    size="sm"
                    variant="text"
                    icon={
                      <span className="material-symbols-outlined" aria-hidden="true">
                        delete
                      </span>
                    }
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
