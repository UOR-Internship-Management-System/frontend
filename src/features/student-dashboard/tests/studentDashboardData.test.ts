import { describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import { studentDashboardFixture } from '../../../mocks/fixtures/studentDashboard.fixture'
import { httpClient } from '../../../shared/api/httpClient'
import { studentDashboardApi } from '../api/studentDashboardApi'
import { shouldRetryStudentDashboardQuery } from '../hooks/useStudentDashboard'
import { studentDashboardMetricsSchema } from '../schemas/studentDashboardSchemas'

vi.mock('../../../shared/api/httpClient', () => ({
  httpClient: vi.fn(),
}))

describe('Student Dashboard data contract', () => {
  it('accepts the OpenAPI-aligned dashboard response', () => {
    expect(studentDashboardMetricsSchema.parse(studentDashboardFixture)).toEqual(
      studentDashboardFixture,
    )
  })

  it('accepts a null official GPA and rejects unknown response properties', () => {
    expect(
      studentDashboardMetricsSchema.parse({
        ...studentDashboardFixture,
        officialCumulativeGpa: null,
      }).officialCumulativeGpa,
    ).toBeNull()

    expect(() =>
      studentDashboardMetricsSchema.parse({
        ...studentDashboardFixture,
        unexpectedScore: 92,
      }),
    ).toThrow(ZodError)
  })

  it('does not retry invalid contracts or client errors and retries one server failure', () => {
    let schemaError: unknown

    try {
      studentDashboardMetricsSchema.parse({})
    } catch (error) {
      schemaError = error
    }

    expect(shouldRetryStudentDashboardQuery(0, schemaError)).toBe(false)

    expect(
      shouldRetryStudentDashboardQuery(0, {
        title: 'Not found',
        status: 404,
      }),
    ).toBe(false)

    expect(
      shouldRetryStudentDashboardQuery(0, {
        title: 'Service unavailable',
        status: 503,
      }),
    ).toBe(true)

    expect(
      shouldRetryStudentDashboardQuery(1, {
        title: 'Service unavailable',
        status: 503,
      }),
    ).toBe(false)
  })

  it('forwards an AbortSignal to the httpClient when requesting metrics', async () => {
    const mockHttpClient = vi.mocked(httpClient)
    mockHttpClient.mockResolvedValueOnce(studentDashboardFixture)

    const controller = new AbortController()
    await studentDashboardApi.getMetrics(controller.signal)

    expect(mockHttpClient).toHaveBeenCalledWith('/me/dashboard/metrics', {
      signal: controller.signal,
    })
  })
})
