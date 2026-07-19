import { queryKeys } from '../../../shared/api/queryKeys'

export const adminDashboardKeys = {
  all: [...queryKeys.protected, 'admin-dashboard'] as const,
  metrics: () => [...adminDashboardKeys.all, 'metrics'] as const,
}
