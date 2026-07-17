import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { academicRecordsApi } from '../api/academicRecordsApi'
import { academicRecordKeys } from '../hooks/academicRecordKeys'
import { shouldRetryAcademicRecordsQuery, useAcademicRecords } from '../hooks/useAcademicRecords'
import { useGpaSummary } from '../hooks/useGpaSummary'
import { academicRecordSchema, gpaSummarySchema } from '../schemas/academicRecordSchemas'

const query = { page: 0, size: 10, sort: 'academicYear,desc', search: 'CS' }
const record = academicRecordSchema.parse({
  academicRecordId: '10000000-0000-4000-8000-000000000001',
  subjectId: '20000000-0000-4000-8000-000000000001',
  courseCode: 'CS4010',
  courseTitle: 'Distributed Systems',
  credits: 3,
  letterGrade: 'A',
  gradePoint: 4,
  semester: 'Semester 1',
  academicYear: '2025/26',
  attemptNumber: 1,
  resultStatus: 'PASSED',
  committedAt: '2026-07-14T08:30:00Z',
})
const gpa = gpaSummarySchema.parse({
  studentId: '30000000-0000-4000-8000-000000000001',
  status: 'AVAILABLE',
  computerScienceGpa: 3.75,
  totalCredits: 96,
  calculatedAt: '2026-07-14T08:31:00Z',
  source: {
    sourceUploadId: '40000000-0000-4000-8000-000000000001',
    committedAt: '2026-07-14T08:30:00Z',
  },
})

describe('Academic Records hooks', () => {
  afterEach(() => vi.restoreAllMocks())

  it('loads and maps GPA through its independent query key', async () => {
    vi.spyOn(academicRecordsApi, 'getGpa').mockResolvedValue(gpa)
    const { queryClient, wrapper } = createWrapper()
    const { result } = renderHook(() => useGpaSummary(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.gpaLabel).toBe('3.75')
    expect(queryClient.getQueryData(academicRecordKeys.gpa())).toEqual(gpa)
  })

  it('loads and maps a paged records response without changing its query input', async () => {
    const list = vi.spyOn(academicRecordsApi, 'list').mockResolvedValue({
      items: [record],
      page: { page: 0, size: 10, totalElements: 1, totalPages: 1, sort: query.sort },
    })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAcademicRecords(query), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(list).toHaveBeenCalledWith(query, expect.any(AbortSignal))
    expect(result.current.data?.items[0]?.periodLabel).toContain('2025/26')
  })

  it('allows one retry only for network and server failures', () => {
    expect(shouldRetryAcademicRecordsQuery(0, new TypeError('offline'))).toBe(true)
    expect(shouldRetryAcademicRecordsQuery(1, new TypeError('offline'))).toBe(false)
    expect(shouldRetryAcademicRecordsQuery(0, { status: 503 })).toBe(true)
    expect(shouldRetryAcademicRecordsQuery(1, { status: 503 })).toBe(false)
  })

  it.each([400, 401, 403, 404, 409, 415, 422, 429])('does not retry a %s response', (status) => {
    expect(shouldRetryAcademicRecordsQuery(0, { status })).toBe(false)
  })

  it('does not retry contract validation failures', () => {
    const contractError = z.object({ required: z.string() }).safeParse({}).error
    expect(shouldRetryAcademicRecordsQuery(0, contractError)).toBe(false)
  })
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}
