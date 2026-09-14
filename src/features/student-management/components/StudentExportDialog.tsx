import { useId, useState } from 'react'
import { Dialog } from '../../../shared/components/overlays/Dialog'
import { Button } from '../../../shared/components/ui/Button'
import type { RegisteredStudentView } from '../types/studentManagementTypes'

type ExportColumn = 'indexNumber' | 'fullName' | 'degreeProgram' | 'level' | 'gpa' | 'batch' | 'email'

const COLUMN_OPTIONS: ReadonlyArray<{ key: ExportColumn; label: string }> = [
  { key: 'indexNumber', label: 'Index Number' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'email', label: 'University Email' },
  { key: 'degreeProgram', label: 'Degree Program' },
  { key: 'batch', label: 'Academic Batch' },
  { key: 'level', label: 'Current Level' },
  { key: 'gpa', label: 'Official GPA' },
]

const DEFAULT_COLUMNS = new Set<ExportColumn>([
  'indexNumber',
  'fullName',
  'degreeProgram',
  'level',
  'gpa',
])

function buildCsv(students: RegisteredStudentView[], columns: Set<ExportColumn>): string {
  const headers = COLUMN_OPTIONS.filter((c) => columns.has(c.key)).map((c) => c.label)
  const rows = students.map((s) => {
    const cells: string[] = []
    if (columns.has('indexNumber')) cells.push(`"${s.indexNumber}"`)
    if (columns.has('fullName')) cells.push(`"${s.fullName}"`)
    if (columns.has('email')) cells.push(`"${s.universityEmail}"`)
    if (columns.has('degreeProgram')) cells.push(`"${s.degreeProgram}"`)
    if (columns.has('batch')) cells.push(`"${s.academicBatch}"`)
    if (columns.has('level')) cells.push(`"Level ${s.currentLevel}"`)
    if (columns.has('gpa')) cells.push(s.officialGpa !== null ? String(s.officialGpa.toFixed(2)) : '""')
    return cells.join(',')
  })
  return [headers.join(','), ...rows].join('\r\n')
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

type StudentExportDialogProps = {
  isOpen: boolean
  students: RegisteredStudentView[]
  selectedIds?: Set<string>
  onClose: () => void
  onExportDone?: () => void
}

export function StudentExportDialog({
  isOpen,
  students,
  selectedIds,
  onClose,
  onExportDone,
}: StudentExportDialogProps) {
  const formId = useId()
  const [selectedColumns, setSelectedColumns] = useState<Set<ExportColumn>>(DEFAULT_COLUMNS)

  const exportStudents = selectedIds && selectedIds.size > 0
    ? students.filter((s) => selectedIds.has(s.studentId))
    : students

  function toggleColumn(key: ExportColumn) {
    setSelectedColumns((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function handleExport() {
    if (selectedColumns.size === 0) return
    const csv = buildCsv(exportStudents, selectedColumns)
    const timestamp = new Date().toISOString().slice(0, 10)
    downloadCsv(csv, `registered-students-${timestamp}.csv`)
    onClose()
    onExportDone?.()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      title="Export Student Roster"
      description={
        exportStudents.length === students.length
          ? `Exporting all ${students.length.toLocaleString()} students from current page.`
          : `Exporting ${exportStudents.length} selected ${exportStudents.length === 1 ? 'student' : 'students'}.`
      }
      icon={
        <span className="material-symbols-outlined" aria-hidden="true">
          download
        </span>
      }
      actions={
        <>
          <Button onClick={onClose} variant="text">
            Cancel
          </Button>
          <Button
            disabled={selectedColumns.size === 0}
            onClick={handleExport}
            variant="filled"
            icon={
              <span className="material-symbols-outlined" aria-hidden="true">
                file_download
              </span>
            }
          >
            Export CSV
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={(e) => { e.preventDefault(); handleExport() }}>
        <fieldset className="sed-columns-fieldset">
          <legend className="sed-columns-legend">Select columns to include</legend>
          <div className="sed-columns-grid">
            {COLUMN_OPTIONS.map((col) => {
              const checked = selectedColumns.has(col.key)
              return (
                <label key={col.key} className={`sed-column-option${checked ? ' sed-column-option--selected' : ''}`}>
                  <input
                    checked={checked}
                    className="rst-checkbox"
                    onChange={() => toggleColumn(col.key)}
                    type="checkbox"
                  />
                  <span className="sed-column-label">{col.label}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        {selectedColumns.size === 0 && (
          <p className="sed-error" role="alert">
            <span className="material-symbols-outlined" aria-hidden="true">warning</span>
            Select at least one column to export.
          </p>
        )}
      </form>
    </Dialog>
  )
}
