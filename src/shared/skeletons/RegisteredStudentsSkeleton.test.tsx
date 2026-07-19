import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RegisteredStudentsSkeleton } from './RegisteredStudentsSkeleton'

describe('RegisteredStudentsSkeleton', () => {
  it('matches filters, six columns, six rows and pagination', () => {
    const { container } = render(<RegisteredStudentsSkeleton />)
    expect(
      container.querySelectorAll('[data-testid="registered-level-chips"] .skeleton-empty'),
    ).toHaveLength(2)
    expect(container.querySelectorAll('.skeleton-table-head')).toHaveLength(6)
    expect(
      container.querySelectorAll('.skeleton-table-cell:not(.skeleton-table-head)'),
    ).toHaveLength(36)
    expect(container.querySelector('.skeleton-pagination')).toBeInTheDocument()
  })
})
