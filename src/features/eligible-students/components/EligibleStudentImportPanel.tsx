import { useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FileUploadField } from '../../../shared/components/forms/FileUploadField'
import { Button } from '../../../shared/components/ui/Button'
import { useEligibleStudentMutations } from '../hooks/useEligibleStudents'
import type { EligibleStudentImportResult } from '../types/eligibleStudentTypes'

export function EligibleStudentImportPanel() {
  const mutations = useEligibleStudentMutations()
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<EligibleStudentImportResult | null>(null)
  const [error, setError] = useState<string>()
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

  return (
    <div className="section-card eligible-students-import-panel">
      <h3>Bulk Import</h3>
      <p>
        Columns: <strong>Index Number</strong>, <strong>University Email</strong>,{' '}
        <strong>Full Name</strong>, <strong>Academic Level</strong> (3 or 4). Duplicates are
        skipped.
      </p>
      <div className="eligible-students-import-controls">
        <FileUploadField
          accept=".csv,.xlsx,.xls"
          disabled={mutations.importFile.isPending}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          ref={inputRef}
        />
        <Button
          disabled={!file}
          isLoading={mutations.importFile.isPending}
          onClick={() => void submit()}
        >
          Import
        </Button>
      </div>
      {error ? (
        <div className="inline-alert" role="alert">
          {error}
        </div>
      ) : null}
      {result ? (
        <div className="inline-alert-success" role="status">
          <p>
            Imported <strong>{result.importedCount}</strong> of {result.totalRows} row
            {result.totalRows === 1 ? '' : 's'}
            {result.skippedCount > 0 ? ` — ${result.skippedCount} skipped.` : '.'}
          </p>
          {result.errors.length > 0 ? (
            <ul className="eligible-students-import-errors">
              {result.errors.map((rowError) => (
                <li key={rowError.row}>
                  Row {rowError.row}: {rowError.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
