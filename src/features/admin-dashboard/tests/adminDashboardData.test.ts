import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import { adminDashboardMetricsSchema } from '../schemas/adminDashboardSchemas'
import { mapAdminDashboard } from '../mappers/adminDashboardMapper'
import { adminDashboardKeys } from '../hooks/adminDashboardQueryKeys'
import { shouldRetryAdminDashboard } from '../hooks/useAdminDashboard'

const metrics = {
  totalStudents: 142,
  registeredStudents: 134,
  internshipRequestsCreated: 12,
  lastUpdatedAt: '2026-07-19T03:30:00Z',
}

describe('Admin dashboard data layer', () => {
  it('strictly validates all contracted metrics', () => {
    expect(adminDashboardMetricsSchema.parse(metrics)).toEqual(metrics)
    expect(() => adminDashboardMetricsSchema.parse({ ...metrics, extra: true })).toThrow(ZodError)
    expect(() => adminDashboardMetricsSchema.parse({ ...metrics, totalStudents: -1 })).toThrow(
      ZodError,
    )
  })

  it('maps the three metrics and backend freshness timestamp deterministically', () => {
    const view = mapAdminDashboard(metrics)
    expect(view.metrics.map((item) => item.label)).toEqual([
      'Total Students',
      'Registered Students',
      'Internship Requests Created',
    ])
    expect(view.metrics.map((item) => item.value)).toEqual(['142', '134', '12'])
    expect(view.lastUpdatedLabel).not.toBe('Invalid Date')
  })

  it('uses a stable protected query key and safe retry policy', () => {
    expect(adminDashboardKeys.metrics()).toEqual(['protected', 'admin-dashboard', 'metrics'])
    expect(shouldRetryAdminDashboard(0, { title: 'Unavailable', status: 503 })).toBe(true)
    expect(shouldRetryAdminDashboard(1, { title: 'Unavailable', status: 503 })).toBe(false)
    expect(shouldRetryAdminDashboard(0, { title: 'Forbidden', status: 403 })).toBe(false)
  })
})
