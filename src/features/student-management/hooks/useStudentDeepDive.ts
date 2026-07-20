import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { z } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { studentManagementApi } from '../api/studentManagementApi'
import { mapAdminAcademicRecord } from '../mappers/studentManagementMappers'
import type {
  AdminAcademicRecordsQuery,
  AdminStudentCollectionQuery,
} from '../types/studentManagementTypes'
import { studentManagementKeys } from './studentManagementQueryKeys'
import { shouldRetryStudentManagement } from './useRegisteredStudents'

export const defaultDeepDiveCollectionQuery: AdminStudentCollectionQuery = {
  page: 0,
  size: 20,
  search: '',
}

export const defaultDeepDiveAcademicQuery: AdminAcademicRecordsQuery = {
  page: 0,
  size: 20,
  sort: 'academicYear,desc',
  search: '',
  courseCode: '',
}

function useIndependentPageState<TQuery extends { page: number }>(initialQuery: TQuery) {
  const [query, setQuery] = useState(initialQuery)
  const updateQuery = useCallback((patch: Partial<TQuery>) => {
    setQuery((current) => {
      const resetsPage = Object.keys(patch).some((key) => key !== 'page')
      return {
        ...current,
        ...patch,
        page: resetsPage ? 0 : (patch.page ?? current.page),
      }
    })
  }, [])
  return { query, updateQuery }
}

export function useStudentDeepDive(studentId: string | null | undefined) {
  const normalizedStudentId = studentId?.trim() ?? ''
  const hasValidStudentId = z.string().uuid().safeParse(normalizedStudentId).success
  const skillsState = useIndependentPageState(defaultDeepDiveCollectionQuery)
  const projectsState = useIndependentPageState(defaultDeepDiveCollectionQuery)
  const academicsState = useIndependentPageState(defaultDeepDiveAcademicQuery)

  const detail = useQuery({
    enabled: hasValidStudentId,
    queryKey: studentManagementKeys.studentDetail(normalizedStudentId),
    queryFn: ({ signal }) => studentManagementApi.getStudentDetail(normalizedStudentId, signal),
    retry: shouldRetryStudentManagement,
  })

  const declaredSkills = useQuery({
    enabled: hasValidStudentId,
    queryKey: studentManagementKeys.studentDeclaredSkills(normalizedStudentId, skillsState.query),
    queryFn: ({ signal }) =>
      studentManagementApi.listDeclaredSkills(normalizedStudentId, skillsState.query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryStudentManagement,
  })

  const projects = useQuery({
    enabled: hasValidStudentId,
    queryKey: studentManagementKeys.studentProjects(normalizedStudentId, projectsState.query),
    queryFn: ({ signal }) =>
      studentManagementApi.listProjects(normalizedStudentId, projectsState.query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryStudentManagement,
  })

  const academicRecords = useQuery({
    enabled: hasValidStudentId,
    queryKey: studentManagementKeys.studentAcademicRecords(
      normalizedStudentId,
      academicsState.query,
    ),
    queryFn: ({ signal }) =>
      studentManagementApi.listAcademicRecords(normalizedStudentId, academicsState.query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryStudentManagement,
    select: (response) => ({
      ...response,
      items: response.items.map(mapAdminAcademicRecord),
    }),
  })

  const latestCv = useQuery({
    enabled: hasValidStudentId,
    queryKey: studentManagementKeys.studentLatestCv(normalizedStudentId),
    queryFn: ({ signal }) => studentManagementApi.getLatestCv(normalizedStudentId, signal),
    retry: shouldRetryStudentManagement,
  })

  const detailStatus = detail.error ? mapApiError(detail.error, 'protected').status : null

  return {
    studentId: normalizedStudentId,
    isInvalidStudentId: !hasValidStudentId,
    isNotFound: !hasValidStudentId || detailStatus === 404,
    detail,
    declaredSkills: { result: declaredSkills, ...skillsState },
    projects: { result: projects, ...projectsState },
    academicRecords: { result: academicRecords, ...academicsState },
    latestCv,
  }
}
