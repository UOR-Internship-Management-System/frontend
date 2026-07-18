import type { ApiAcademicLedgerUploadSummaryResponse } from '../../../shared/api/generated/cvManagementApi.types'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import { mapUploadStatus, mapValidationStatus } from '../mappers/academicLedgerMappers'

export function LedgerUploadsTable({
  items,
  onSelect,
  selectedId,
}: {
  items: ApiAcademicLedgerUploadSummaryResponse[]
  selectedId: string | null
  onSelect: (uploadId: string) => void
}) {
  return (
    <div className="table-responsive ledger-table-wrap">
      <table className="ledger-table">
        <caption>Recent academic ledger upload batches</caption>
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
              <tr key={item.uploadId} className={selectedId === item.uploadId ? 'is-selected' : ''}>
                <td data-label="File">
                  <strong>{item.originalFilename}</strong>
                  <span className="ledger-secondary">
                    {Math.ceil(item.fileSizeBytes / 1024)} KiB
                  </span>
                </td>
                <td data-label="Uploaded">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(item.uploadedAt))}
                </td>
                <td data-label="Upload">
                  <StatusBadge tone={upload.tone}>{upload.label}</StatusBadge>
                </td>
                <td data-label="Validation">
                  <StatusBadge tone={validation.tone}>{validation.label}</StatusBadge>
                </td>
                <td data-label="Rows">{item.totalRows}</td>
                <td data-label="Action">
                  <Button
                    aria-pressed={selectedId === item.uploadId}
                    onClick={() => onSelect(item.uploadId)}
                    variant="secondary"
                  >
                    Inspect
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
