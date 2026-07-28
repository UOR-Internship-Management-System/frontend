import type { AcademicRecordView } from '../types/academicRecordTypes'

export function AcademicRecordsTable({ records }: { records: AcademicRecordView[] }) {
  return (
    <div className="s5-records-table-wrap" tabIndex={0}>
      <table className="s5-records-table">
        <caption className="visually-hidden">
          Official academic results. This table is read-only.
        </caption>
        <thead>
          <tr>
            <th scope="col">Subject Code</th>
            <th scope="col">Subject Name</th>
            <th scope="col">Credits</th>
            <th scope="col">Grade</th>
            <th scope="col">Grade Point</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.academicRecordId}>
              <td>{record.courseCode}</td>
              <td>{record.courseTitle}</td>
              <td>{record.creditsLabel}</td>
              <td>
                <span className="s5-records-grade">{record.letterGrade}</span>
              </td>
              <td>{record.gradePointLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
