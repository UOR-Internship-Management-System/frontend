import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { Button } from '../../../shared/components/ui/Button'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { LedgerInspectionTableSkeleton } from '../../../shared/skeletons'
import { useRegisteredStudents } from '../../student-management/hooks/useRegisteredStudents'
import type {
  RegisteredStudentsQuery,
  RegisteredStudentView,
} from '../../student-management/types/studentManagementTypes'
import { LedgerRecordDetailsModal } from './LedgerRecordDetailsModal'

export function LedgerAcademicInspection() {
  const [query, setQuery] = useState<RegisteredStudentsQuery>({
    page: 0,
    size: 20,
    sort: 'fullName,asc',
    search: '',
  })
  const [searchInput, setSearchInput] = useState('')
  const [selected, setSelected] = useState<RegisteredStudentView | null>(null)
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const students = useRegisteredStudents(query)

  useEffect(() => {
    const search = debouncedSearch.trim().slice(0, 120)
    setQuery((current) => (current.search === search ? current : { ...current, page: 0, search }))
  }, [debouncedSearch])

  const updateQuery = (patch: Partial<RegisteredStudentsQuery>) =>
    setQuery((current) => ({ ...current, ...patch, page: 'page' in patch ? (patch.page ?? 0) : 0 }))

  return (
    <section
      aria-labelledby="ledger-academic-inspection-title"
      className="section-card ledger-inspection-panel"
    >
      <div className="ledger-section-heading">
        <div>
          <p className="section-kicker">Read-only directory</p>
          <h2 id="ledger-academic-inspection-title">Inspect official Student records</h2>
          <p>Review committed academic history without changing Student data.</p>
        </div>
        {students.isFetching && !students.isPending ? <span role="status">Updating…</span> : null}
      </div>
      <div className="ledger-toolbar">
        <label>
          Search Students
          <input
            aria-label="Search Students for academic inspection"
            className="input"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Name, index, email, or batch"
            value={searchInput}
          />
        </label>
        <label>
          Current level
          <select
            className="select"
            value={query.level ?? ''}
            onChange={(event) =>
              updateQuery({
                level: event.target.value ? (Number(event.target.value) as 3 | 4) : undefined,
              })
            }
          >
            <option value="">All levels</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
          </select>
        </label>
      </div>
      {students.isPending ? <LedgerInspectionTableSkeleton /> : null}
      {students.isError ? (
        <ErrorState
          title="Unable to load Student records"
          message={mapApiError(students.error, 'protected').message}
          onAction={() => void students.refetch()}
        />
      ) : null}
      {students.data?.items.length ? (
        <div className="table-responsive ledger-table-wrap">
          <table className="ledger-table ledger-inspection-table">
            <caption>Students available for official academic record inspection</caption>
            <thead>
              <tr>
                <th scope="col">Index</th>
                <th scope="col">Student</th>
                <th scope="col">Program</th>
                <th scope="col">Level</th>
                <th scope="col">Official GPA</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.data.items.map((student) => (
                <tr key={student.studentId}>
                  <td data-label="Index">{student.indexNumber}</td>
                  <td data-label="Student">
                    <strong>{student.fullName}</strong>
                    <span className="ledger-secondary">{student.universityEmail}</span>
                  </td>
                  <td data-label="Program">{student.degreeProgram}</td>
                  <td data-label="Level">{student.levelLabel}</td>
                  <td data-label="Official GPA">{student.officialGpaLabel}</td>
                  <td data-label="Action">
                    <Button onClick={() => setSelected(student)} variant="secondary">
                      View academic records
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {students.data && !students.data.items.length ? (
        <EmptyState
          title="No matching Students"
          message="No Students match the current inspection controls."
        />
      ) : null}
      {students.data ? (
        <PaginationBar
          label="Academic inspection Student pages"
          page={students.data.page.page}
          size={students.data.page.size}
          totalElements={students.data.page.totalElements}
          totalPages={students.data.page.totalPages}
          pageSizeOptions={[20, 50, 100]}
          onPageChange={(page) => updateQuery({ page })}
          onPageSizeChange={(size) => updateQuery({ size: size as 20 | 50 | 100 })}
        />
      ) : null}
      {selected ? (
        <LedgerRecordDetailsModal onClose={() => setSelected(null)} student={selected} />
      ) : null}
    </section>
  )
}
