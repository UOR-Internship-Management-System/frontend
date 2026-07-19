import type {
  ApiAcademicRecordResponse,
  ApiAcademicRecordSort,
  ApiRegisteredStudentLevel,
  ApiRegisteredStudentSort,
  ApiStudentSummaryResponse,
} from '../../../shared/api/generated/cvManagementApi.types'

export type RegisteredStudentsQuery = {
  page: number
  size: 20 | 50 | 100
  sort: ApiRegisteredStudentSort
  search: string
  level?: ApiRegisteredStudentLevel
}

export type AdminAcademicRecordsQuery = {
  page: number
  size: 20 | 50 | 100
  sort: ApiAcademicRecordSort
  search: string
  courseCode: string
}

export type RegisteredStudentView = ApiStudentSummaryResponse & {
  levelLabel: string
  officialGpaLabel: string
}

export type AdminAcademicRecordView = ApiAcademicRecordResponse & {
  creditsLabel: string
  gradePointLabel: string
  periodLabel: string
}
