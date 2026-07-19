import { Link } from 'react-router-dom'
import { buildAdminStudentDetailPath } from '../../../app/config/routePaths'
import type { RegisteredStudentView } from '../types/studentManagementTypes'

export function RegisteredStudentsTable({ students }: { students: RegisteredStudentView[] }) {
  return (
    <div className="table-responsive registered-students-table-wrapper">
      <table className="registered-students-table">
        <caption>Registered Student roster</caption>
        <thead>
          <tr>
            <th scope="col">Index Number</th>
            <th scope="col">Full Name</th>
            <th scope="col">Degree Program</th>
            <th scope="col">Current Level</th>
            <th scope="col">Official GPA</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.studentId}>
              <td data-label="Index Number">{student.indexNumber}</td>
              <td data-label="Full Name">
                <strong>{student.fullName}</strong>
                <span className="registered-student-secondary">{student.universityEmail}</span>
              </td>
              <td data-label="Degree Program">{student.degreeProgram}</td>
              <td data-label="Current Level">{student.levelLabel}</td>
              <td data-label="Official GPA">{student.officialGpaLabel}</td>
              <td data-label="Actions">
                <Link
                  className="button button-secondary roster-action-link"
                  to={buildAdminStudentDetailPath(student.studentId)}
                >
                  View Deep-Dive
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
