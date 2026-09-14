import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { Button } from '../../../shared/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card'
import { SegmentedButton } from '../../../shared/components/ui/SegmentedButton'
import { SkeletonTableGrid } from '../../../shared/skeletons'
import { useRegisteredStudents } from '../../student-management/hooks/useRegisteredStudents'
import type {
  RegisteredStudentsQuery,
  RegisteredStudentView,
} from '../../student-management/types/studentManagementTypes'
import { LedgerAcademicInspectionCardList } from './LedgerAcademicInspectionCardList'
import { LedgerRecordDetailsModal } from './LedgerRecordDetailsModal'

const viewOptions = [
  {
    value: 'table' as const,
    label: 'Table',
    icon: <span className="material-symbols-outlined" style={{ fontSize: 18 }}>table_rows</span>,
  },
  {
    value: 'cards' as const,
    label: 'Cards',
    icon: <span className="material-symbols-outlined" style={{ fontSize: 18 }}>grid_view</span>,
  },
]

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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [selected, setSelected] = useState<RegisteredStudentView | null>(null)
  const students = useRegisteredStudents(query)

  useEffect(() => {
    const totalPages = students.data?.page.totalPages ?? 0
    if (totalPages > 0 && query.page >= totalPages) onQueryChange({ page: totalPages - 1 })
  }, [onQueryChange, query.page, students.data?.page.totalPages])

  return (
    <Card aria-labelledby="ledger-academic-inspection-title" variant="outlined">
      <CardHeader className="s5-section-heading">
        <div>
          <CardTitle id="ledger-academic-inspection-title">Student record inspection</CardTitle>
          <p>Search the student directory to review official academic records, read-only.</p>
        </div>
        {students.isFetching && !students.isPending ? (
          <span className="al-updating-note" role="status">
            Updating…
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="al-toolbar">
          <SearchBar
            aria-label="Search Students by name or index number"
            onChange={(event) => onSearchChange(event.target.value.slice(0, 120))}
            placeholder="Search Students by name or index number"
            value={searchInput}
          />
          <div className="al-toolbar-toggle">
            <SegmentedButton
              onChange={(val) => setViewMode(val as 'table' | 'cards')}
              options={viewOptions}
              value={viewMode}
            />
          </div>
        </div>

        {students.isPending ? (
          <SkeletonTableGrid
            columns={4}
            gridTemplateColumns="repeat(4, minmax(120px, 1fr))"
            rows={4}
          />
        ) : null}
        {students.isError ? (
          <ErrorState
            message={mapApiError(students.error, 'protected').message}
            onAction={() => void students.refetch()}
            title="Unable to load Student records"
          />
        ) : null}
        {students.data?.items.length ? (
          <div className={`al-data-container ${viewMode === 'cards' ? 'al-mode-cards' : 'al-mode-table'}`}>
            {viewMode === 'table' ? (
              <div className="al-table-wrap" tabIndex={0}>
                <table className="al-table">
                  <caption className="visually-hidden">
                    Students available for official academic record inspection
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Student Name</th>
                      <th scope="col">Student Index Number</th>
                      <th scope="col">Computer Science GPA</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.data.items.map((student) => (
                      <tr key={student.studentId}>
                        <td>{student.fullName}</td>
                        <td>{student.indexNumber}</td>
                        <td>{student.officialGpaLabel}</td>
                        <td className="al-action-cell">
                          <Button onClick={() => setSelected(student)} size="sm" variant="outlined">
                            View More
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <LedgerAcademicInspectionCardList onSelect={setSelected} students={students.data.items} />
            )}
          </div>
        ) : null}
        {students.data && !students.data.items.length ? (
          <EmptyState
            message="No Students match the entered name or index number."
            title="No matching Students"
          />
        ) : null}
        {students.data?.page.totalPages ? (
          <PaginationBar
            label="Student academic directory pagination"
            onPageChange={(page) => onQueryChange({ page })}
            page={students.data.page.page}
            size={students.data.page.size}
            totalElements={students.data.page.totalElements}
            totalPages={students.data.page.totalPages}
          />
        ) : null}
      </CardContent>
      {selected ? (
        <LedgerRecordDetailsModal onClose={() => setSelected(null)} student={selected} />
      ) : null}
    </Card>
  )
}
