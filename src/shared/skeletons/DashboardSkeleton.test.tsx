import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AdminDashboardSkeleton, StudentDashboardSkeleton } from './DashboardSkeleton'

describe('Dashboard skeletons', () => {
  it('reserves four Student metrics and the hero icon', () => {
    const { container } = render(<StudentDashboardSkeleton />)
    expect(container.querySelectorAll('[data-skeleton-metric]')).toHaveLength(4)
    expect(
      container.querySelector('.student-dashboard-welcome .skeleton-radius-circle'),
    ).toBeInTheDocument()
  })

  it('matches the Admin wireframe with three concise metric cards and no summary toolbar', () => {
    const { container } = render(<AdminDashboardSkeleton />)
    expect(container.querySelectorAll('[data-skeleton-admin-metric]')).toHaveLength(3)
    expect(container.querySelector('.admin-dashboard-summary-header')).not.toBeInTheDocument()
    expect(
      container.querySelector('.admin-dashboard-summary .skeleton-radius-circle'),
    ).not.toBeInTheDocument()
  })
})
