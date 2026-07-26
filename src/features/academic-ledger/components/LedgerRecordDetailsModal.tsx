import { useEffect, useMemo, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { Modal } from '../../../shared/components/overlays/Modal'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { LedgerRecordsModalSkeleton } from '../../../shared/skeletons'
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
    <Modal
      closeOnBackdrop
      onClose={onClose}
      size="wide"
      title="Student Academic Records Detailed View"
    >
      <div className="ledger-record-modal-content">
        <p className="ledger-modal-student-context">
          <strong>{student.fullName}</strong>
          <span>{student.indexNumber}</span>
        </p>

        <div className="ledger-modal-filter-row">
          <label>
            Search Subject
            <SearchInput
              aria-label="Search Subject"
              onChange={(event) => setSearchInput(event.target.value.slice(0, 120))}
              placeholder="Search subjects by name or code"
              value={searchInput}
            />
          </label>
          <label>
            Filter by Subject
            <select
              aria-label="Filter by Subject"
              className="select"
              disabled={subjectDirectory.isPending}
              onChange={(event) => updateQuery({ courseCode: event.target.value })}
              value={query.courseCode}
            >
              <option value="">All Registered Subjects</option>
              {subjects.map(([courseCode, label]) => (
                <option key={courseCode} value={courseCode}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {records.isPending ? <LedgerRecordsModalSkeleton /> : null}
        {records.isError ? (
          <ErrorState
            title="Unable to load academic records"
            message={mapApiError(records.error, 'protected').message}
            onAction={() => void records.refetch()}
          />
        ) : null}
        {records.data?.items.length ? (
          <div className="table-responsive ledger-table-wrap" tabIndex={0}>
            <table className="ledger-table ledger-records-table">
              <caption>Official academic records for {student.fullName}</caption>
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
                    <td data-label="Subject Code">{record.courseCode}</td>
                    <td data-label="Subject Name">{record.courseTitle}</td>
                    <td data-label="Credits">{record.creditsLabel}</td>
                    <td data-label="Grade Point">{record.gradePointLabel}</td>
                    <td data-label="Grade">{record.letterGrade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {records.data && !records.data.items.length ? (
          <EmptyState
            title="No academic subject records"
            message="No academic subject records match the current search or filter."
          />
        ) : null}
        {records.data?.page.totalPages ? (
          <PaginationBar
            label={`${student.fullName} subject records pagination`}
            page={records.data.page.page}
            size={records.data.page.size}
            totalElements={records.data.page.totalElements}
            totalPages={records.data.page.totalPages}
            onPageChange={(page) => updateQuery({ page })}
          />
        ) : null}
      </div>
    </Modal>
  )
}
