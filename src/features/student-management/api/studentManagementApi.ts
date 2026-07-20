import { httpClient } from '../../../shared/api/httpClient'
import { httpDownloadClient } from '../../../shared/api/httpDownloadClient'
import { buildQueryString } from '../../../shared/utils/buildQueryString'
import {
  adminLatestCvSchema,
  adminStudentDetailSchema,
  pagedAdminDeclaredSkillsSchema,
  pagedAdminAcademicRecordsSchema,
  pagedAdminStudentProjectsSchema,
  pagedRegisteredStudentsSchema,
} from '../schemas/studentManagementSchemas'
import type {
  AdminAcademicRecordsQuery,
  AdminStudentCollectionQuery,
  RegisteredStudentsQuery,
} from '../types/studentManagementTypes'

function adminStudentPath(studentId: string) {
  return `/admin/students/${encodeURIComponent(studentId)}`
}

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

  async getStudentDetail(studentId: string, signal?: AbortSignal) {
    const response = await httpClient<unknown>(adminStudentPath(studentId), { signal })
    return adminStudentDetailSchema.parse(response)
  },

  async listDeclaredSkills(
    studentId: string,
    query: AdminStudentCollectionQuery,
    signal?: AbortSignal,
  ) {
    const response = await httpClient<unknown>(
      `${adminStudentPath(studentId)}/declared-skills${buildQueryString(query)}`,
      { signal },
    )
    return pagedAdminDeclaredSkillsSchema.parse(response)
  },

  async listProjects(studentId: string, query: AdminStudentCollectionQuery, signal?: AbortSignal) {
    const response = await httpClient<unknown>(
      `${adminStudentPath(studentId)}/projects${buildQueryString(query)}`,
      { signal },
    )
    return pagedAdminStudentProjectsSchema.parse(response)
  },

  async listAcademicRecords(
    studentId: string,
    query: AdminAcademicRecordsQuery,
    signal?: AbortSignal,
  ) {
    const response = await httpClient<unknown>(
      `${adminStudentPath(studentId)}/academic-records${buildQueryString({
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

  async getLatestCv(studentId: string, signal?: AbortSignal) {
    const response = await httpClient<unknown>(`${adminStudentPath(studentId)}/latest-cv`, {
      signal,
    })
    return adminLatestCvSchema.parse(response)
  },

  async downloadLatestCv(studentId: string, signal?: AbortSignal) {
    return httpDownloadClient(`${adminStudentPath(studentId)}/latest-cv/download`, {
      signal,
      expectedContentType: 'application/pdf',
      fallbackFilename: 'student-latest-cv.pdf',
    })
  },
}
