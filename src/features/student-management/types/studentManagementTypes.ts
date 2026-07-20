import type {
  ApiAcademicRecordResponse,
  ApiAcademicRecordSort,
  ApiAdminLatestCvAvailabilityStatus,
  ApiAdminStudentDetailResponse,
  ApiDeclaredSkillResponse,
  ApiGpaAvailabilityStatus,
  ApiGpaSummaryResponse,
  ApiPagedResponse,
  ApiProjectResponse,
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

export type AdminStudentDetail = ApiAdminStudentDetailResponse
export type AdminLatestCvAvailability = ApiAdminLatestCvAvailabilityStatus
export type AdminGpaAvailability = ApiGpaAvailabilityStatus
export type AdminGpaSummary = ApiGpaSummaryResponse
export type PagedAdminDeclaredSkills = ApiPagedResponse<ApiDeclaredSkillResponse>
export type PagedAdminStudentProjects = ApiPagedResponse<ApiProjectResponse>
