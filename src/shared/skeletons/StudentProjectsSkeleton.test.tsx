import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectModalSkeleton, StudentProjectsSkeleton } from './StudentProjectsSkeleton'

describe('StudentProjectsSkeleton', () => {
  it('uses a five-column repository with five rows', () => {
    const { container } = render(<StudentProjectsSkeleton />)
    expect(container.querySelectorAll('.skeleton-table-head')).toHaveLength(5)
    expect(
      container.querySelectorAll('.skeleton-table-cell:not(.skeleton-table-head)'),
    ).toHaveLength(25)
  })

  it('reserves the full project modal body', () => {
    const { container } = render(<ProjectModalSkeleton />)
    expect(container.querySelector('.skeleton-modal-footer')).toBeInTheDocument()
    expect(container.querySelectorAll('.skeleton-chip-row .skeleton-empty')).toHaveLength(3)
  })
})
