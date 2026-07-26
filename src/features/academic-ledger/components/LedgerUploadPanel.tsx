import { useEffect, useId, useRef, useState, type DragEvent } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FileUploadField } from '../../../shared/components/forms/FileUploadField'
import { Button } from '../../../shared/components/ui/Button'
import { academicLedgerFileSchema } from '../schemas/ledgerSchemas'

export function LedgerUploadPanel({
  error,
  isPending,
  onReset,
  onUpload,
}: {
  error: unknown
  isPending: boolean
  onReset: () => void
  onUpload: (file: File) => void
}) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const wasPendingRef = useRef(false)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const requestError = error ? mapApiError(error, 'protected') : null

  useEffect(() => {
    if (wasPendingRef.current && !isPending && !error) {
      setFile(null)
      setValidationMessage(null)
      if (inputRef.current) inputRef.current.value = ''
    }
    wasPendingRef.current = isPending
  }, [error, isPending])

  function chooseFile(nextFile: File | null) {
    onReset()
    setValidationMessage(null)
    if (!nextFile) {
      setFile(null)
      return
    }

    const parsed = academicLedgerFileSchema.safeParse(nextFile)
    if (!parsed.success) {
      setFile(null)
      setValidationMessage(parsed.error.issues[0]?.message ?? 'Choose a valid CSV file.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setFile(parsed.data)
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (isPending) return
    chooseFile(event.dataTransfer.files.item(0))
  }

  function clearFile() {
    onReset()
    setFile(null)
    setValidationMessage(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section aria-labelledby="ledger-upload-title" className="section-card ledger-upload-panel">
      <div className="ledger-upload-heading">
        <h2 id="ledger-upload-title">Upload academic records here.</h2>
        <p>
          Select one official UTF-8 CSV ledger file. The file is parsed, staged, and validated
          before any academic record can be committed.
        </p>
      </div>

      <FileUploadField
        accept=".csv,text/csv"
        aria-describedby={`ledger-file-help${
          validationMessage || requestError ? ' ledger-file-error' : ''
        }`}
        aria-invalid={Boolean(validationMessage || requestError) || undefined}
        aria-label="Official academic ledger CSV"
        className="visually-hidden"
        disabled={isPending}
        id={inputId}
        onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
        ref={inputRef}
      />

      <button
        aria-controls={inputId}
        className={`ledger-dropzone ${isDragging ? 'is-dragging' : ''}`.trim()}
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          if (!isPending) setIsDragging(true)
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDragging(false)
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined ledger-dropzone-icon">
          cloud_upload
        </span>
        <strong>Drag &amp; drop official transcript file here or click to browse</strong>
        <span>Supported format: official academic CSV ledger file · Maximum size: 5 MiB</span>
      </button>

      <p className="field-help" id="ledger-file-help">
        Required headers and row values are validated by the backend before commit.
      </p>

      {file ? (
        <div className="ledger-selected-file" role="status">
          <span aria-hidden="true" className="material-symbols-outlined">
            description
          </span>
          <span>
            <strong>{file.name}</strong>
            <small>{Math.max(1, Math.ceil(file.size / 1024))} KiB selected</small>
          </span>
        </div>
      ) : null}

      {validationMessage || requestError ? (
        <p className="error-text" id="ledger-file-error" role="alert">
          {validationMessage ?? requestError?.message}
          {requestError?.correlationId ? ` Reference: ${requestError.correlationId}` : ''}
        </p>
      ) : null}

      <div className="button-row ledger-upload-actions">
        <Button disabled={!file} isLoading={isPending} onClick={() => file && onUpload(file)}>
          Process and Stage Ledger
        </Button>
        {file ? (
          <Button disabled={isPending} onClick={clearFile} variant="secondary">
            Clear selected file
          </Button>
        ) : null}
      </div>
    </section>
  )
}
