import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import { adminDashboardKeys } from '../hooks/adminDashboardQueryKeys'
import { shouldRetryAdminDashboard } from '../hooks/useAdminDashboard'
import { mapAdminDashboard } from '../mappers/adminDashboardMapper'
import { adminDashboardMetricsSchema } from '../schemas/adminDashboardSchemas'

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

  it('maps the three API metrics to the exact wireframe labels and descriptions', () => {
    const view = mapAdminDashboard(metrics)

    expect(view.metrics).toEqual([
      {
        key: 'totalStudents',
        label: 'Total Students',
        value: '142',
        description: 'Total count of students currently in the database.',
      },
      {
        key: 'registeredStudents',
        label: 'Registered Students',
        value: '134',
        description: 'Current count of students registered in the system.',
      },
      {
        key: 'internshipRequestsCreated',
        label: 'Internship Requests Created',
        value: '12',
        description: 'Total number of internship requests that have been generated.',
      },
    ])
    expect(view).not.toHaveProperty('lastUpdatedLabel')
  })

  it('uses a stable protected query key and safe retry policy', () => {
    expect(adminDashboardKeys.metrics()).toEqual(['protected', 'admin-dashboard', 'metrics'])
    expect(shouldRetryAdminDashboard(0, { title: 'Unavailable', status: 503 })).toBe(true)
    expect(shouldRetryAdminDashboard(1, { title: 'Unavailable', status: 503 })).toBe(false)
    expect(shouldRetryAdminDashboard(0, { title: 'Forbidden', status: 403 })).toBe(false)
  })
})
