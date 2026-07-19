import type {
  ApiAcademicRecordResponse,
  ApiStudentSummaryResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import type {
  AdminAcademicRecordView,
  RegisteredStudentView,
} from '../types/studentManagementTypes'

export function mapRegisteredStudent(student: ApiStudentSummaryResponse): RegisteredStudentView {
  return {
    ...student,
    levelLabel: `Level ${student.currentLevel}`,
    officialGpaLabel:
      student.officialGpa === null ? 'Not available' : student.officialGpa.toFixed(2),
  }
}

export function mapAdminAcademicRecord(record: ApiAcademicRecordResponse): AdminAcademicRecordView {
  return {
    ...record,
    creditsLabel: record.credits.toFixed(1),
    gradePointLabel: record.gradePoint.toFixed(2),
    periodLabel: `${record.academicYear} · ${record.semester}`,
  }
}
