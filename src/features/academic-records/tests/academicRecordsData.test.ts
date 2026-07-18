import { afterEach, describe, expect, it, vi } from 'vitest'
import { academicRecordsApi } from '../api/academicRecordsApi'
import { academicRecordKeys } from '../hooks/academicRecordKeys'
import {
  academicSortOptions,
  mapAcademicRecord,
  mapGpaSummary,
} from '../mappers/academicRecordMapper'
import {
  academicRecordSchema,
  gpaSummarySchema,
  pagedAcademicRecordsSchema,
} from '../schemas/academicRecordSchemas'

const record = {
  academicRecordId: '10000000-0000-4000-8000-000000000001',
  subjectId: '20000000-0000-4000-8000-000000000001',
  courseCode: 'CSC3112',
  courseTitle: 'Web Technologies',
  credits: 4,
  letterGrade: 'A-',
  gradePoint: 3.7,
  semester: 'Semester 1',
  academicYear: '2025/2026',
  attemptNumber: 1,
  resultStatus: 'PASSED',
  committedAt: '2026-07-20T09:30:00Z',
}

const availableGpa = {
  studentId: '30000000-0000-4000-8000-000000000001',
  status: 'AVAILABLE' as const,
  computerScienceGpa: 3.75,
  totalCredits: 42,
  calculatedAt: '2026-07-20T09:35:00Z',
  source: {
    sourceUploadId: '40000000-0000-4000-8000-000000000001',
    committedAt: '2026-07-20T09:30:00Z',
  },
}

const unavailableGpa = {
  studentId: '30000000-0000-4000-8000-000000000002',
  status: 'NOT_AVAILABLE' as const,
  computerScienceGpa: null,
  totalCredits: null,
  calculatedAt: null,
  source: null,
}

describe('Academic Records transport validation', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('validates strict committed records and rejects missing or editable fields', () => {
    expect(academicRecordSchema.parse(record)).toEqual(record)
    const missingTitle = structuredClone(record)
    Reflect.deleteProperty(missingTitle, 'courseTitle')
    expect(() => academicRecordSchema.parse(missingTitle)).toThrow()
    expect(() => academicRecordSchema.parse({ ...record, editable: true })).toThrow()
  })

  it('enforces AVAILABLE and NOT_AVAILABLE GPA cross-field invariants', () => {
    expect(gpaSummarySchema.parse(availableGpa)).toEqual(availableGpa)
    expect(gpaSummarySchema.parse(unavailableGpa)).toEqual(unavailableGpa)
    expect(() => gpaSummarySchema.parse({ ...availableGpa, source: null })).toThrow()
    expect(() => gpaSummarySchema.parse({ ...unavailableGpa, computerScienceGpa: 3.2 })).toThrow()
    expect(() => gpaSummarySchema.parse({ ...unavailableGpa, status: 'PENDING' })).toThrow()
  })

  it('accepts an empty successful page and rejects invalid metadata', () => {
    const emptyPage = {
      items: [],
      page: { page: 0, size: 20, totalElements: 0, totalPages: 0, sort: 'academicYear,desc' },
    }
    expect(pagedAcademicRecordsSchema.parse(emptyPage)).toEqual(emptyPage)
    expect(() =>
      pagedAcademicRecordsSchema.parse({ ...emptyPage, page: { ...emptyPage.page, size: 0 } }),
    ).toThrow()
  })

  it('maps official display values without editable state or artificial precision', () => {
    expect(mapAcademicRecord(academicRecordSchema.parse(record))).toMatchObject({
      creditsLabel: '4',
      gradePointLabel: '3.7',
      periodLabel: '2025/2026 · Semester 1',
    })
    expect(mapGpaSummary(gpaSummarySchema.parse(availableGpa))).toMatchObject({
      status: 'AVAILABLE',
      gpaLabel: '3.75',
      creditsLabel: '42',
    })
    expect(mapGpaSummary(gpaSummarySchema.parse(unavailableGpa)).gpaLabel).toBeNull()
  })

  it('exposes only contract-authorized sort values and stable record/GPA keys', () => {
    expect(academicSortOptions).toHaveLength(14)
    expect(academicSortOptions.every((option) => /^[a-zA-Z]+,(asc|desc)$/.test(option.value))).toBe(
      true,
    )
    const query = { page: 1, size: 10, sort: 'courseCode,asc', search: 'CSC' }
    expect(academicRecordKeys.recordList(query)).toEqual([
      'protected',
      'academic-records',
      'records',
      'list',
      query,
    ])
    expect(academicRecordKeys.gpa()).toEqual(['protected', 'academic-records', 'gpa'])
  })

  it('uses exact read-only paths and search/sort/page query parameters', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(availableGpa))
      .mockResolvedValueOnce(
        Response.json({
          items: [record],
          page: { page: 1, size: 10, totalElements: 11, totalPages: 2, sort: 'courseCode,asc' },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await academicRecordsApi.getGpa()
    await academicRecordsApi.list({ page: 1, size: 10, sort: 'courseCode,asc', search: 'web' })

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/v1/me/academic-records/gpa',
      '/api/v1/me/academic-records?page=1&size=10&sort=courseCode%2Casc&search=web',
    ])
    expect(fetchMock.mock.calls.every(([, init]) => (init as RequestInit).method === 'GET')).toBe(
      true,
    )
  })
})
