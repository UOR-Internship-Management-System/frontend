import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { studentManagementApi } from '../api/studentManagementApi'
import { mapAdminAcademicRecord, mapRegisteredStudent } from '../mappers/studentManagementMappers'
import type {
  AdminAcademicRecordsQuery,
  RegisteredStudentsQuery,
} from '../types/studentManagementTypes'
import { studentManagementKeys } from './studentManagementQueryKeys'

export function shouldRetryStudentManagement(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false
  const status = mapApiError(error, 'protected').status
  if (status && status < 500) return false
  return failureCount < 1
}

export function useRegisteredStudents(query: RegisteredStudentsQuery) {
  return useQuery({
    queryKey: studentManagementKeys.studentList(query),
    queryFn: ({ signal }) => studentManagementApi.listStudents(query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryStudentManagement,
    select: (response) => ({
      ...response,
      items: response.items.map(mapRegisteredStudent),
    }),
  })
}

export function useAdminStudentAcademicRecords(
  studentId: string | null,
  query: AdminAcademicRecordsQuery,
) {
  return useQuery({
    enabled: Boolean(studentId),
    queryKey: studentManagementKeys.studentAcademicRecords(studentId ?? '', query),
    queryFn: ({ signal }) =>
      studentManagementApi.listAcademicRecords(studentId ?? '', query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryStudentManagement,
    select: (response) => ({
      ...response,
      items: response.items.map(mapAdminAcademicRecord),
    }),
  })
}
