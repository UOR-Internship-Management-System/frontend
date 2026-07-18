import { httpClient } from '../../../shared/api/httpClient'
import { adminDashboardMetricsSchema } from '../schemas/adminDashboardSchemas'

export const adminDashboardApi = {
  async getMetrics(signal?: AbortSignal) {
    const response = await httpClient<unknown>('/admin/dashboard/metrics', { signal })
    return adminDashboardMetricsSchema.parse(response)
  },
}
