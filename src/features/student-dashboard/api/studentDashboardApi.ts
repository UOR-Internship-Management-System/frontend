import { httpClient } from '../../../shared/api/httpClient'
import { studentDashboardMetricsSchema } from '../schemas/studentDashboardSchemas'
import type { StudentDashboardMetrics } from '../types/studentDashboardTypes'
export const studentDashboardApi = {
  async getMetrics(signal?: AbortSignal): Promise<StudentDashboardMetrics> {
    const response = await httpClient<unknown>('/me/dashboard/metrics', { signal })
    return studentDashboardMetricsSchema.parse(response)
  },
}
