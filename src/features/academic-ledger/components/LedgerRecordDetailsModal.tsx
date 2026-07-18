import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { Modal } from '../../../shared/components/overlays/Modal'
import { TableSkeleton } from '../../../shared/skeletons'
import { useAdminStudentAcademicRecords } from '../../student-management/hooks/useRegisteredStudents'
import type {
  AdminAcademicRecordsQuery,
  RegisteredStudentView,
} from '../../student-management/types/studentManagementTypes'

const defaultQuery: AdminAcademicRecordsQuery = {
  page: 0,
  size: 20,
  sort: 'academicYear,desc',
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
  const records = useAdminStudentAcademicRecords(student.studentId, query)
  const updateQuery = (patch: Partial<AdminAcademicRecordsQuery>) =>
    setQuery((current) => ({ ...current, ...patch, page: 'page' in patch ? (patch.page ?? 0) : 0 }))

  return (
    <Modal
      description={`${student.indexNumber} · ${student.degreeProgram}`}
      onClose={onClose}
      title={`${student.fullName}'s academic records`}
    >
      <div className="ledger-record-modal-content">
        <div className="ledger-stat-grid">
          <div>
            <dt>Current level</dt>
            <dd>{student.currentLevel}</dd>
          </div>
          <div>
            <dt>Official GPA</dt>
            <dd>{student.officialGpaLabel}</dd>
          </div>
        </div>
        <div className="ledger-toolbar">
          <label>
            Search records
            <input
              aria-label="Search academic records"
              className="input"
              onChange={(event) => updateQuery({ search: event.target.value.slice(0, 120) })}
              placeholder="Title, period, or grade"
              value={query.search}
            />
          </label>
          <label>
            Course code
            <input
              aria-label="Filter by course code"
              className="input"
              onChange={(event) =>
                updateQuery({ courseCode: event.target.value.trim().slice(0, 30) })
              }
              placeholder="CS4010"
              value={query.courseCode}
            />
          </label>
          <label>
            Sort records
            <select
              className="select"
              value={query.sort}
              onChange={(event) =>
                updateQuery({ sort: event.target.value as AdminAcademicRecordsQuery['sort'] })
              }
            >
              <option value="academicYear,desc">Newest academic year</option>
              <option value="courseCode,asc">Course code</option>
              <option value="committedAt,desc">Recently committed</option>
            </select>
          </label>
        </div>
        {records.isPending ? <TableSkeleton variant="academic-records" /> : null}
        {records.isError ? (
          <ErrorState
            title="Unable to load academic records"
            message={mapApiError(records.error, 'protected').message}
            onAction={() => void records.refetch()}
          />
        ) : null}
        {records.data?.items.length ? (
          <div className="table-responsive ledger-table-wrap">
            <table className="ledger-table ledger-records-table">
              <caption>Official academic records for {student.fullName}</caption>
              <thead>
                <tr>
                  <th scope="col">Course</th>
                  <th scope="col">Period</th>
                  <th scope="col">Credits</th>
                  <th scope="col">Grade</th>
                  <th scope="col">Attempt</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {records.data.items.map((record) => (
                  <tr key={record.academicRecordId}>
                    <td data-label="Course">
                      <strong>{record.courseCode}</strong>
                      <span className="ledger-secondary">{record.courseTitle}</span>
                    </td>
                    <td data-label="Period">{record.periodLabel}</td>
                    <td data-label="Credits">{record.creditsLabel}</td>
                    <td data-label="Grade">
                      {record.letterGrade}
                      <span className="ledger-secondary">{record.gradePointLabel} points</span>
                    </td>
                    <td data-label="Attempt">{record.attemptNumber}</td>
                    <td data-label="Result">{record.resultStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {records.data && !records.data.items.length ? (
          <EmptyState
            title="No academic records"
            message="No official academic records match the current controls."
          />
        ) : null}
        {records.data ? (
          <PaginationBar
            label={`${student.fullName} academic record pages`}
            page={records.data.page.page}
            size={records.data.page.size}
            totalElements={records.data.page.totalElements}
            totalPages={records.data.page.totalPages}
            pageSizeOptions={[20, 50, 100]}
            onPageChange={(page) => updateQuery({ page })}
            onPageSizeChange={(size) => updateQuery({ size: size as 20 | 50 | 100 })}
          />
        ) : null}
      </div>
    </Modal>
  )
}
