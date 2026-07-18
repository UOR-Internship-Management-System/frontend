import { z } from 'zod'
import type { ApiAdminDashboardMetricsResponse } from '../../../shared/api/generated/cvManagementApi.types'

export const adminDashboardMetricsSchema: z.ZodType<ApiAdminDashboardMetricsResponse> = z
  .object({
    totalStudents: z.number().int().nonnegative(),
    registeredStudents: z.number().int().nonnegative(),
    internshipRequestsCreated: z.number().int().nonnegative(),
    lastUpdatedAt: z.string().datetime({ offset: true }),
  })
  .strict()
