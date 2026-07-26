import { queryKeys } from '../../../shared/api/queryKeys'
import type {
  AdminAcademicRecordsQuery,
  AdminStudentCollectionQuery,
  RegisteredStudentsQuery,
} from '../types/studentManagementTypes'

export const studentManagementKeys = {
  all: [...queryKeys.protected, 'student-management'] as const,
  students: () => [...studentManagementKeys.all, 'students'] as const,
  studentList: (query: RegisteredStudentsQuery) =>
    [...studentManagementKeys.students(), 'list', query] as const,
  student: (studentId: string) => [...studentManagementKeys.students(), studentId] as const,
  studentDetail: (studentId: string) =>
    [...studentManagementKeys.student(studentId), 'detail'] as const,
  studentDeclaredSkills: (studentId: string, query: AdminStudentCollectionQuery) =>
    [...studentManagementKeys.student(studentId), 'declared-skills', query] as const,
  studentProjects: (studentId: string, query: AdminStudentCollectionQuery) =>
    [...studentManagementKeys.student(studentId), 'projects', query] as const,
  studentLatestCv: (studentId: string) =>
    [...studentManagementKeys.student(studentId), 'latest-cv'] as const,
  academicRecords: () => [...studentManagementKeys.students(), 'academic-records'] as const,
  studentAcademicRecords: (studentId: string, query: AdminAcademicRecordsQuery) =>
    [...studentManagementKeys.student(studentId), 'academic-records', query] as const,
}
