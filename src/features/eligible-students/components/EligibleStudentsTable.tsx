import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import { Button } from '../../../shared/components/ui/Button'
import type { EligibleStudent } from '../types/eligibleStudentTypes'

export function EligibleStudentsTable({
  disabled,
  items,
  onDelete,
  onEdit,
}: {
  disabled: boolean
  items: EligibleStudent[]
  onDelete: (student: EligibleStudent) => void
  onEdit: (student: EligibleStudent) => void
}) {
  return (
    <div className="table-responsive">
      <table>
        <caption className="visually-hidden">Eligible student roster</caption>
        <thead>
          <tr>
            <th scope="col">Index Number</th>
            <th scope="col">Full Name</th>
            <th scope="col">University Email</th>
            <th scope="col">Level</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((student) => (
            <tr key={student.id}>
              <td data-label="Index Number">{student.indexNumber}</td>
              <td data-label="Full Name">{student.fullName}</td>
              <td data-label="University Email">{student.universityEmail}</td>
              <td data-label="Level">{student.academicLevel}</td>
              <td data-label="Status">
                <StatusBadge tone={student.registered ? 'success' : 'neutral'}>
                  {student.registered ? 'Registered' : 'Not registered'}
                </StatusBadge>
              </td>
              <td className="eligible-students-actions" data-label="Actions">
                <Button disabled={disabled} onClick={() => onEdit(student)} variant="secondary">
                  Edit
                </Button>
                <Button
                  disabled={disabled || student.registered}
                  onClick={() => onDelete(student)}
                  title={student.registered ? 'Registered students cannot be removed.' : undefined}
                  variant="secondary"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
