import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { AcademicRecordView } from '../types/academicRecordTypes'

export function AcademicRecordsTable({ records }: { records: AcademicRecordView[] }) {
  return (
    <div className="s5-records-table-wrap" tabIndex={0}>
      <table className="s5-records-table">
        <caption className="visually-hidden">
          Official committed academic records. This table is read-only.
        </caption>
        <thead>
          <tr>
            <th scope="col">Course</th>
            <th scope="col">Academic period</th>
            <th scope="col">Credits</th>
            <th scope="col">Grade</th>
            <th scope="col">Grade point</th>
            <th scope="col">Attempt</th>
            <th scope="col">Result</th>
            <th scope="col">Committed</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.academicRecordId}>
              <td>
                <strong>{record.courseCode}</strong>
                <span>{record.courseTitle}</span>
              </td>
              <td>{record.periodLabel}</td>
              <td>{record.creditsLabel}</td>
              <td>
                <span className="s5-records-grade">{record.letterGrade}</span>
              </td>
              <td>{record.gradePointLabel}</td>
              <td>{record.attemptNumber}</td>
              <td>
                <StatusBadge tone={record.resultStatus === 'PASSED' ? 'success' : 'neutral'}>
                  {formatStatus(record.resultStatus)}
                </StatusBadge>
              </td>
              <td>{record.committedAtLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, (letter) => letter.toUpperCase())
}
