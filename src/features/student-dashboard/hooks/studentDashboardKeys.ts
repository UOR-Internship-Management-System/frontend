import { queryKeys } from '../../../shared/api/queryKeys'

export const studentDashboardKeys = {
  all: [...queryKeys.protected, 'student-dashboard'] as const,
  metrics: () => [...studentDashboardKeys.all, 'metrics'] as const,
}
