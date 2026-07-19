import { queryKeys } from '../../../shared/api/queryKeys'
import type {
  AdminAcademicRecordsQuery,
  RegisteredStudentsQuery,
} from '../types/studentManagementTypes'

export const studentManagementKeys = {
  all: [...queryKeys.protected, 'student-management'] as const,
  students: () => [...studentManagementKeys.all, 'students'] as const,
  studentList: (query: RegisteredStudentsQuery) =>
    [...studentManagementKeys.students(), 'list', query] as const,
  academicRecords: () => [...studentManagementKeys.students(), 'academic-records'] as const,
  studentAcademicRecords: (studentId: string, query: AdminAcademicRecordsQuery) =>
    [...studentManagementKeys.academicRecords(), studentId, query] as const,
}
