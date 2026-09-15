import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { StatusBadgeTone } from '../../../shared/components/ui/StatusBadge'
import type { RegisteredStudentView } from '../../student-management/types/studentManagementTypes'

function getGpaTone(gpa: number | null): StatusBadgeTone {
  if (gpa === null) return 'neutral'
  if (gpa >= 3.7) return 'success'
  if (gpa >= 3.0) return 'info'
  if (gpa >= 2.0) return 'warning'
  return 'danger'
}

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

export function LedgerAcademicInspectionCardList({
  students,
  onSelect,
}: {
  students: RegisteredStudentView[]
  onSelect: (student: RegisteredStudentView) => void
}) {
  return (
    <ul className="rsp-card-list" aria-label="Student academic records" role="list">
      {students.map((student) => (
        <li key={student.studentId} className="rsp-card-list__item">
          <article className="rsp-student-card" aria-label={`Student: ${student.fullName}`}>
            {/* Avatar */}
            <div className="rsp-student-card__avatar" aria-hidden="true">
              {getInitials(student.fullName)}
            </div>

            {/* Body */}
            <div className="rsp-student-card__body">
              <div className="rsp-student-card__header">
                <span className="rsp-student-card__name">{student.fullName}</span>
                <span className="rsp-student-card__index">{student.indexNumber}</span>
              </div>

              <div className="rsp-student-card__chips">
                <StatusBadge tone={getGpaTone(student.officialGpa)}>
                  GPA {student.officialGpaLabel}
                </StatusBadge>
              </div>
            </div>

            {/* Trailing action */}
            <div className="rsp-student-card__action">
              <Button onClick={() => onSelect(student)} size="sm" variant="outlined">
                View More
              </Button>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}
