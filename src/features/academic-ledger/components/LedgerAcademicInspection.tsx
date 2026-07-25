import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { Button } from '../../../shared/components/ui/Button'
import { LedgerInspectionTableSkeleton } from '../../../shared/skeletons'
import { useRegisteredStudents } from '../../student-management/hooks/useRegisteredStudents'
import type {
  RegisteredStudentsQuery,
  RegisteredStudentView,
} from '../../student-management/types/studentManagementTypes'
import { LedgerRecordDetailsModal } from './LedgerRecordDetailsModal'

export function LedgerAcademicInspection({
  onQueryChange,
  onSearchChange,
  query,
  searchInput,
}: {
  query: RegisteredStudentsQuery
  searchInput: string
  onQueryChange: (patch: Partial<RegisteredStudentsQuery>) => void
  onSearchChange: (value: string) => void
}) {
  const [selected, setSelected] = useState<RegisteredStudentView | null>(null)
  const students = useRegisteredStudents(query)

  useEffect(() => {
    const totalPages = students.data?.page.totalPages ?? 0
    if (totalPages > 0 && query.page >= totalPages) onQueryChange({ page: totalPages - 1 })
  }, [onQueryChange, query.page, students.data?.page.totalPages])

  return (
    <section
      aria-labelledby="ledger-academic-inspection-title"
      className="section-card ledger-inspection-panel"
    >
      <div className="ledger-section-heading">
        <h2 id="ledger-academic-inspection-title">Students Details</h2>
        {students.isFetching && !students.isPending ? <span role="status">Updating…</span> : null}
      </div>

      <div className="ledger-student-search">
        <SearchInput
          aria-label="Search Students by name or index number"
          onChange={(event) => onSearchChange(event.target.value.slice(0, 120))}
          placeholder="Search Students by name or index number"
          value={searchInput}
        />
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
        <div className="table-responsive ledger-table-wrap" tabIndex={0}>
          <table className="ledger-table ledger-inspection-table">
            <caption>Students available for official academic record inspection</caption>
            <thead>
              <tr>
                <th scope="col">Student Name</th>
                <th scope="col">Student Index Number</th>
                <th scope="col">Computer Science GPA</th>
                <th className="ledger-action-column" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {students.data.items.map((student) => (
                <tr key={student.studentId}>
                  <td data-label="Student Name">{student.fullName}</td>
                  <td data-label="Student Index Number">{student.indexNumber}</td>
                  <td data-label="Computer Science GPA">{student.officialGpaLabel}</td>
                  <td className="ledger-action-cell" data-label="Actions">
                    <Button onClick={() => setSelected(student)} variant="secondary">
                      View More
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
          message="No Students match the entered name or index number."
        />
      ) : null}
      {students.data?.page.totalPages ? (
        <PaginationBar
          label="Student academic directory pagination"
          page={students.data.page.page}
          size={students.data.page.size}
          totalElements={students.data.page.totalElements}
          totalPages={students.data.page.totalPages}
          onPageChange={(page) => onQueryChange({ page })}
        />
      ) : null}
      {selected ? (
        <LedgerRecordDetailsModal onClose={() => setSelected(null)} student={selected} />
      ) : null}
    </section>
  )
}
