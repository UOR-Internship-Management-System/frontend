import { useEffect, useMemo, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { M3SelectField } from '../../../shared/components/forms/M3SelectField'
import { Dialog } from '../../../shared/components/overlays/Dialog'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { SkeletonTableGrid } from '../../../shared/skeletons'
import { useAdminStudentAcademicRecords } from '../../student-management/hooks/useRegisteredStudents'
import type {
  AdminAcademicRecordsQuery,
  RegisteredStudentView,
} from '../../student-management/types/studentManagementTypes'

const pageSize = 5
const defaultQuery: AdminAcademicRecordsQuery = {
  page: 0,
  size: pageSize,
  sort: 'courseCode,asc',
  search: '',
  courseCode: '',
}

export function LedgerRecordDetailsModal({
  onClose,
  student,
}: {
  student: RegisteredStudentView
  onClose: () => void
}) {
  const [query, setQuery] = useState(defaultQuery)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const records = useAdminStudentAcademicRecords(student.studentId, query)
  const subjectDirectory = useAdminStudentAcademicRecords(student.studentId, {
    page: 0,
    size: 100,
    sort: 'courseCode,asc',
    search: '',
    courseCode: '',
  })
  const subjects = useMemo(() => {
    const options = new Map<string, string>()
    subjectDirectory.data?.items.forEach((record) => {
      options.set(record.courseCode, `${record.courseCode} - ${record.courseTitle}`)
    })
    return [...options.entries()]
  }, [subjectDirectory.data?.items])

  useEffect(() => {
    const search = debouncedSearch.trim().slice(0, 120)
    setQuery((current) => (current.search === search ? current : { ...current, page: 0, search }))
  }, [debouncedSearch])

  useEffect(() => {
    const totalPages = records.data?.page.totalPages ?? 0
    if (totalPages > 0 && query.page >= totalPages) {
      setQuery((current) => ({ ...current, page: totalPages - 1 }))
    }
  }, [query.page, records.data?.page.totalPages])

  const updateQuery = (patch: Partial<AdminAcademicRecordsQuery>) =>
    setQuery((current) => ({ ...current, ...patch, page: 'page' in patch ? (patch.page ?? 0) : 0 }))

  return (
    <Dialog
      adaptiveFullscreen
      isOpen
      onClose={onClose}
      size="large"
      title="Student Academic Records Detailed View"
    >
      <div className="al-record-modal-content">
        <p className="al-modal-student-context">
          <strong>{student.fullName}</strong>
          <span>{student.indexNumber}</span>
        </p>

        <div className="al-modal-filter-row">
          <SearchBar
            aria-label="Search Subject"
            onChange={(event) => setSearchInput(event.target.value.slice(0, 120))}
            placeholder="Search subjects by name or code"
            value={searchInput}
          />
          <M3SelectField
            className="al-field"
            label="Filter by Subject"
            aria-label="Filter by Subject"
            disabled={subjectDirectory.isPending}
            onChange={(value) => updateQuery({ courseCode: value })}
            value={query.courseCode}
            options={[
              { value: '', label: 'All Registered Subjects' },
              ...subjects.map(([courseCode, label]) => ({
                value: courseCode,
                label: label,
              })),
            ]}
          />
        </div>

        {records.isPending ? (
          <SkeletonTableGrid
            columns={5}
            gridTemplateColumns="repeat(5, minmax(100px, 1fr))"
            rows={5}
          />
        ) : null}
        {records.isError ? (
          <ErrorState
            message={mapApiError(records.error, 'protected').message}
            onAction={() => void records.refetch()}
            title="Unable to load academic records"
          />
        ) : null}
        {records.data?.items.length ? (
          <div className="al-table-wrap" tabIndex={0}>
            <table className="al-table">
              <caption className="visually-hidden">
                Official academic records for {student.fullName}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Subject Code</th>
                  <th scope="col">Subject Name</th>
                  <th scope="col">Credits</th>
                  <th scope="col">Grade Point</th>
                  <th scope="col">Grade</th>
                </tr>
              </thead>
              <tbody>
                {records.data.items.map((record) => (
                  <tr key={record.academicRecordId}>
                    <td>{record.courseCode}</td>
                    <td>{record.courseTitle}</td>
                    <td>{record.creditsLabel}</td>
                    <td>{record.gradePointLabel}</td>
                    <td>{record.letterGrade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {records.data && !records.data.items.length ? (
          <EmptyState
            message="No academic subject records match the current search or filter."
            title="No academic subject records"
          />
        ) : null}
        {records.data?.page.totalPages ? (
          <PaginationBar
            label={`${student.fullName} subject records pagination`}
            onPageChange={(page) => updateQuery({ page })}
            page={records.data.page.page}
            size={records.data.page.size}
            totalElements={records.data.page.totalElements}
            totalPages={records.data.page.totalPages}
          />
        ) : null}
      </div>
    </Dialog>
  )
}
