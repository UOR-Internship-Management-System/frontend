import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RegisteredStudentsSkeleton } from './RegisteredStudentsSkeleton'

describe('RegisteredStudentsSkeleton', () => {
  it('matches quick filters, six columns, five rows and pagination', () => {
    const { container } = render(<RegisteredStudentsSkeleton />)
    expect(
      container.querySelectorAll('[data-testid="registered-level-chips"] .skeleton-empty'),
    ).toHaveLength(2)
    expect(container.querySelectorAll('.skeleton-table-head')).toHaveLength(6)
    expect(
      container.querySelectorAll('.skeleton-table-cell:not(.skeleton-table-head)'),
    ).toHaveLength(30)
    expect(container.querySelectorAll('.skeleton-mobile-roster-row')).toHaveLength(5)
    expect(container.querySelector('.skeleton-pagination')).toBeInTheDocument()
  })
})
