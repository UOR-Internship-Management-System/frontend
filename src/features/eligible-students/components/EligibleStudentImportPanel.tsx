import { useRef, useState, type DragEvent } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { Button } from '../../../shared/components/ui/Button'
import { Card, CardContent } from '../../../shared/components/ui/Card'
import { useEligibleStudentMutations } from '../hooks/useEligibleStudents'
import type { EligibleStudentImportResult } from '../types/eligibleStudentTypes'

export function EligibleStudentImportPanel() {
  const mutations = useEligibleStudentMutations()
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<EligibleStudentImportResult | null>(null)
  const [error, setError] = useState<string>()
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const submit = async () => {
    if (!file) return
    setError(undefined)
    setResult(null)
    try {
      const response = await mutations.importFile.mutateAsync(file)
      setResult(response)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (reason) {
      setError(mapApiError(reason, 'protected').message)
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (mutations.importFile.isPending) return
    const nextFile = event.dataTransfer.files.item(0)
    if (nextFile) {
      setFile(nextFile)
      setError(undefined)
      setResult(null)
    }
  }

  function clearFile() {
    setFile(null)
    setError(undefined)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <Card className="es-import-card" variant="outlined" style={{ padding: '0' }}>
      <CardContent className="es-import-content" style={{ padding: '24px' }}>
        <input
          accept=".csv,.xlsx,.xls"
          className="visually-hidden"
          disabled={mutations.importFile.isPending}
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null
            if (nextFile) {
              setFile(nextFile)
              setError(undefined)
              setResult(null)
            }
          }}
          ref={inputRef}
          tabIndex={-1}
          type="file"
        />

        <button
          className={`al-dropzone ${isDragging ? 'is-dragging' : ''}`}
          disabled={mutations.importFile.isPending}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsDragging(false)
            }
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined al-dropzone-icon">
            cloud_upload
          </span>
          <strong>Drag &amp; drop a file here, or click to browse</strong>
          <span>CSV or Excel (.xlsx) · Max 5 MiB</span>
        </button>

        <p className="field-hint" id="es-file-help" style={{ marginTop: '16px', marginBottom: '16px' }}>
          Columns and values are checked automatically before you can commit.
        </p>

        {file ? (
          <div className="al-selected-file" role="status" style={{ marginBottom: '16px' }}>
            <span aria-hidden="true" className="material-symbols-outlined">
              description
            </span>
            <span>
              <strong>{file.name}</strong>
              <small>{Math.max(1, Math.ceil(file.size / 1024))} KiB selected</small>
            </span>
          </div>
        ) : null}

        <div className="al-upload-actions" style={{ display: 'flex', gap: '8px' }}>
          <Button
            disabled={!file}
            isLoading={mutations.importFile.isPending}
            onClick={() => void submit()}
          >
            Upload
          </Button>
          {file ? (
            <Button disabled={mutations.importFile.isPending} onClick={clearFile} variant="outlined">
              Clear
            </Button>
          ) : null}
        </div>

        {error ? (
          <div className="es-import-banner es-import-banner--error" role="alert">
            <span className="material-symbols-outlined" aria-hidden="true">
              error
            </span>
            <span>{error}</span>
          </div>
        ) : null}
        {result ? (
          <div className="es-import-banner es-import-banner--success" role="status">
            <span className="material-symbols-outlined" aria-hidden="true">
              check_circle
            </span>
            <div>
              <p className="es-import-summary">
                Imported <strong>{result.importedCount}</strong> of {result.totalRows} row
                {result.totalRows === 1 ? '' : 's'}
                {result.skippedCount > 0 ? ` — ${result.skippedCount} skipped.` : '.'}
              </p>
              {result.errors.length > 0 ? (
                <ul className="es-import-errors">
                  {result.errors.map((rowError) => (
                    <li key={rowError.row}>
                      Row {rowError.row}: {rowError.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
