import { httpClient } from '../../../shared/api/httpClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import {
  pagedAdminAcademicRecordsSchema,
  pagedRegisteredStudentsSchema,
} from '../schemas/studentManagementSchemas'
import type {
  AdminAcademicRecordsQuery,
  RegisteredStudentsQuery,
} from '../types/studentManagementTypes'

export const studentManagementApi = {
  async listStudents(query: RegisteredStudentsQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `/admin/students${buildQueryString({
        page: query.page,
        size: query.size,
        sort: query.sort,
        search: query.search,
        level: query.level,
      })}`,
      { signal },
    )
    return pagedRegisteredStudentsSchema.parse(response)
  },

  async listAcademicRecords(
    studentId: string,
    query: AdminAcademicRecordsQuery,
    signal?: AbortSignal,
  ) {
    const response = await httpClient<unknown>(
      `/admin/students/${encodeURIComponent(studentId)}/academic-records${buildQueryString({
        page: query.page,
        size: query.size,
        sort: query.sort,
        search: query.search,
        courseCode: query.courseCode,
      })}`,
      { signal },
    )
    return pagedAdminAcademicRecordsSchema.parse(response)
  },
}
