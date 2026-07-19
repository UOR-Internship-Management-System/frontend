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

  it('reserves three Admin metrics', () => {
    const { container } = render(<AdminDashboardSkeleton />)
    expect(container.querySelectorAll('[data-skeleton-metric]')).toHaveLength(3)
  })
})
