import { Link } from 'react-router-dom'
import { buildAdminStudentDetailPath } from '../../../app/config/routePaths'
import { Chip } from '../../../shared/components/ui/Chip'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { StatusBadgeTone } from '../../../shared/components/ui/StatusBadge'
import type { RegisteredStudentView } from '../types/studentManagementTypes'

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

type RegisteredStudentsCardListProps = {
  students: RegisteredStudentView[]
}

export function RegisteredStudentsCardList({ students }: RegisteredStudentsCardListProps) {
  return (
    <ul className="rsp-card-list" aria-label="Registered students" role="list">
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

              <p className="rsp-student-card__degree">{student.degreeProgram}</p>

              <div className="rsp-student-card__chips">
                <Chip
                  className={`rst-level-chip rst-level-chip--l${student.currentLevel}`}
                  leadingIcon={
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }} aria-hidden="true">
                      school
                    </span>
                  }
                  variant="filter"
                >
                  Level {student.currentLevel}
                </Chip>

                <StatusBadge tone={getGpaTone(student.officialGpa)}>
                  GPA {student.officialGpaLabel}
                </StatusBadge>
              </div>
            </div>

            {/* Trailing action */}
            <div className="rsp-student-card__action">
              <Link
                aria-label={`View details for ${student.fullName}`}
                className="m3-icon-button m3-icon-button--standard m3-icon-button--size-md"
                to={buildAdminStudentDetailPath(student.studentId)}
              >
                <span className="m3-icon-button-content" aria-hidden="true">
                  <span className="material-symbols-outlined">chevron_right</span>
                </span>
              </Link>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}
