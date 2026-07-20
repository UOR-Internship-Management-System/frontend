import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from '../../../mocks/server'
import { studentManagementApi } from '../api/studentManagementApi'
import {
  adminLatestCvSchema,
  adminStudentDetailSchema,
  pagedAdminAcademicRecordsSchema,
  pagedAdminDeclaredSkillsSchema,
  pagedAdminStudentProjectsSchema,
} from '../schemas/studentManagementSchemas'
import { useStudentDeepDive } from '../hooks/useStudentDeepDive'
import { studentManagementKeys } from '../hooks/studentManagementQueryKeys'

const studentId = '11111111-1111-4111-8111-111111111111'
const now = '2026-07-20T09:30:00Z'
const emptyPage = { page: 0, size: 20, totalElements: 0, totalPages: 0, sort: 'createdAt,desc' }
const detail = adminStudentDetailSchema.parse({
  student: {
    studentId,
    indexNumber: 'SC/2022/12345',
    fullName: 'Asha Silva',
    universityEmail: 'asha@dcs.ruh.ac.lk',
    degreeProgram: 'B.Sc. in Computer Science',
    academicBatch: '2022',
    currentLevel: 3,
    officialGpa: null,
  },
  profile: {
    studentId,
    fullName: 'Asha Silva',
    indexNumber: 'SC/2022/12345',
    universityEmail: 'asha@dcs.ruh.ac.lk',
    degreeProgramme: 'B.Sc. in Computer Science',
    studentLevel: 3,
    cohortYear: 2022,
    personalEmail: null,
    headline: null,
    summary: null,
    phone: null,
    location: null,
    profilePhoto: null,
    version: 0,
    updatedAt: now,
    cvSourceUpdatedAt: now,
  },
  cvSupportingData: { experiences: [], certificates: [], awards: [], activities: [] },
  latestCv: {
    availability: 'NOT_SAVED',
    cvId: null,
    revision: null,
    generatedAt: null,
    savedAt: null,
    freshnessStatus: null,
    fileName: null,
    fileSizeBytes: null,
    downloadUrl: null,
  },
})
const latestCv = adminLatestCvSchema.parse(detail.latestCv)
const declaredSkills = pagedAdminDeclaredSkillsSchema.parse({ items: [], page: emptyPage })
const projects = pagedAdminStudentProjectsSchema.parse({ items: [], page: emptyPage })
const academics = pagedAdminAcademicRecordsSchema.parse({
  items: [],
  page: { ...emptyPage, sort: 'academicYear,desc' },
})

describe('Student Deep-Dive data layer', () => {
  afterEach(() => vi.restoreAllMocks())

  it('calls every approved read endpoint with independent query parameters', async () => {
    const seen = new Map<string, string>()
    server.use(
      http.get('/api/v1/admin/students/:studentId', () => HttpResponse.json(detail)),
      http.get('/api/v1/admin/students/:studentId/declared-skills', ({ request }) => {
        seen.set('skills', new URL(request.url).search)
        return HttpResponse.json(declaredSkills)
      }),
      http.get('/api/v1/admin/students/:studentId/projects', ({ request }) => {
        seen.set('projects', new URL(request.url).search)
        return HttpResponse.json(projects)
      }),
      http.get('/api/v1/admin/students/:studentId/academic-records', ({ request }) => {
        seen.set('academics', new URL(request.url).search)
        return HttpResponse.json(academics)
      }),
      http.get('/api/v1/admin/students/:studentId/latest-cv', () => HttpResponse.json(latestCv)),
      http.get(
        '/api/v1/admin/students/:studentId/latest-cv/download',
        () =>
          new HttpResponse(new Uint8Array([37, 80, 68, 70]), {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="Asha_Silva_CV.pdf"',
            },
          }),
      ),
    )

    const signal = new AbortController().signal
    const collectionQuery = { page: 2, size: 50 as const, search: 'TypeScript' }
    const academicQuery = {
      page: 1,
      size: 20 as const,
      sort: 'academicYear,desc' as const,
      search: 'Software',
      courseCode: 'CSC3202',
    }

    await expect(studentManagementApi.getStudentDetail(studentId, signal)).resolves.toEqual(detail)
    await studentManagementApi.listDeclaredSkills(studentId, collectionQuery, signal)
    await studentManagementApi.listProjects(studentId, collectionQuery, signal)
    await studentManagementApi.listAcademicRecords(studentId, academicQuery, signal)
    await expect(studentManagementApi.getLatestCv(studentId, signal)).resolves.toEqual(latestCv)
    await expect(studentManagementApi.downloadLatestCv(studentId, signal)).resolves.toEqual(
      expect.objectContaining({ filename: 'Asha_Silva_CV.pdf', contentType: 'application/pdf' }),
    )

    expect(seen.get('skills')).toBe('?page=2&size=50&search=TypeScript')
    expect(seen.get('projects')).toBe('?page=2&size=50&search=TypeScript')
    expect(seen.get('academics')).toBe(
      '?page=1&size=20&sort=academicYear%2Cdesc&search=Software&courseCode=CSC3202',
    )
    expect(studentManagementKeys.studentAcademicRecords(studentId, academicQuery)).toEqual([
      'protected',
      'student-management',
      'students',
      studentId,
      'academic-records',
      academicQuery,
    ])
  })

  it('loads independent abortable queries and resets only the changed section page', async () => {
    const spies = mockSuccessfulApi()
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useStudentDeepDive(studentId), { wrapper })

    await waitFor(() => {
      expect(result.current.detail.isSuccess).toBe(true)
      expect(result.current.declaredSkills.result.isSuccess).toBe(true)
      expect(result.current.projects.result.isSuccess).toBe(true)
      expect(result.current.academicRecords.result.isSuccess).toBe(true)
      expect(result.current.latestCv.isSuccess).toBe(true)
    })
    expect(spies.detail).toHaveBeenCalledWith(studentId, expect.any(AbortSignal))

    act(() => result.current.declaredSkills.updateQuery({ page: 3 }))
    expect(result.current.declaredSkills.query.page).toBe(3)
    expect(result.current.projects.query.page).toBe(0)
    act(() => result.current.declaredSkills.updateQuery({ search: 'React' }))
    expect(result.current.declaredSkills.query).toEqual({ page: 0, size: 20, search: 'React' })
  })

  it('prevents invalid route identifiers and exposes detail 404 as route not found', async () => {
    const invalidSpy = vi.spyOn(studentManagementApi, 'getStudentDetail')
    const invalid = renderHook(() => useStudentDeepDive('not-a-uuid'), {
      wrapper: createWrapper().wrapper,
    })
    expect(invalid.result.current.isInvalidStudentId).toBe(true)
    expect(invalid.result.current.isNotFound).toBe(true)
    expect(invalidSpy).not.toHaveBeenCalled()
    invalid.unmount()

    mockSuccessfulApi()
    vi.spyOn(studentManagementApi, 'getStudentDetail').mockRejectedValueOnce({
      status: 404,
      title: 'Registered Student not found',
    })
    const missing = renderHook(() => useStudentDeepDive(studentId), {
      wrapper: createWrapper().wrapper,
    })
    await waitFor(() => expect(missing.result.current.isNotFound).toBe(true))
  })
})

function mockSuccessfulApi() {
  return {
    detail: vi.spyOn(studentManagementApi, 'getStudentDetail').mockResolvedValue(detail),
    skills: vi.spyOn(studentManagementApi, 'listDeclaredSkills').mockResolvedValue(declaredSkills),
    projects: vi.spyOn(studentManagementApi, 'listProjects').mockResolvedValue(projects),
    academics: vi.spyOn(studentManagementApi, 'listAcademicRecords').mockResolvedValue(academics),
    cv: vi.spyOn(studentManagementApi, 'getLatestCv').mockResolvedValue(latestCv),
  }
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}
