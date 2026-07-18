import { useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FileUploadField } from '../../../shared/components/forms/FileUploadField'
import { Button } from '../../../shared/components/ui/Button'
import { academicLedgerFileSchema } from '../schemas/ledgerSchemas'

export function LedgerUploadPanel({
  error,
  isPending,
  onUpload,
}: {
  error: unknown
  isPending: boolean
  onUpload: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const requestError = error ? mapApiError(error, 'protected') : null

  function chooseFile(nextFile: File | null) {
    setValidationMessage(null)
    if (!nextFile) return setFile(null)
    const parsed = academicLedgerFileSchema.safeParse(nextFile)
    if (!parsed.success) {
      setFile(null)
      setValidationMessage(parsed.error.issues[0]?.message ?? 'Choose a valid CSV file.')
      return
    }
    setFile(parsed.data)
  }

  return (
    <section aria-labelledby="ledger-upload-title" className="section-card ledger-upload-panel">
      <div>
        <p className="section-kicker">Import workflow</p>
        <h2 id="ledger-upload-title">Upload academic ledger CSV</h2>
        <p>CSV only, up to 5 MiB. Uploading stages records for review; it does not commit them.</p>
      </div>
      <div className="ledger-upload-controls">
        <label>
          <span className="field-label">Ledger CSV</span>
          <FileUploadField
            accept=".csv,text/csv"
            aria-describedby="ledger-file-help ledger-file-error"
            disabled={isPending}
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
            ref={inputRef}
          />
        </label>
        <p className="field-help" id="ledger-file-help">
          Required columns are validated by the server before commit.
        </p>
        {file ? <p className="ledger-selected-file">Selected: {file.name}</p> : null}
        {validationMessage || requestError ? (
          <p className="error-text" id="ledger-file-error" role="alert">
            {validationMessage ?? requestError?.message}
            {requestError?.correlationId ? ` Reference: ${requestError.correlationId}` : ''}
          </p>
        ) : null}
        <div className="button-row">
          <Button disabled={!file} isLoading={isPending} onClick={() => file && onUpload(file)}>
            Upload and validate
          </Button>
          {file ? (
            <Button
              disabled={isPending}
              onClick={() => {
                setFile(null)
                setValidationMessage(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              variant="secondary"
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
