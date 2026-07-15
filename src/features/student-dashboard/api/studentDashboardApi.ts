import { httpClient } from '../../../shared/api/httpClient'
import { studentDashboardMetricsSchema } from '../schemas/studentDashboardSchemas'
import type { StudentDashboardMetrics } from '../types/studentDashboardTypes'
export const studentDashboardApi = {
  async getMetrics(): Promise<StudentDashboardMetrics> {
    // Note: intentionally omitting `signal` in `httpClient` below
    // to avoid JSDOM AbortSignal vs Undici AbortSignal TypeError in vitest.
    const response = await httpClient<unknown>('/me/dashboard/metrics')
    return studentDashboardMetricsSchema.parse(response)
  },
}
