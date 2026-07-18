import { http, HttpResponse } from 'msw'
import { adminDashboardMetricsFixture } from '../fixtures/adminDashboard.fixture'

const apiBase = '/api/v1'

export const adminHandlers = [
  http.get(`${apiBase}/admin/dashboard/metrics`, () =>
    HttpResponse.json(adminDashboardMetricsFixture),
  ),
]
