import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectModalSkeleton, StudentProjectsSkeleton } from './StudentProjectsSkeleton'

describe('StudentProjectsSkeleton', () => {
  it('uses four project-specific repository rows instead of a generic table skeleton', () => {
    const { container } = render(<StudentProjectsSkeleton />)
    expect(container.querySelectorAll('.s4-projects-item')).toHaveLength(4)
    expect(container.querySelector('.s4-projects-toolbar')).toBeInTheDocument()
    expect(container.querySelector('.skeleton-table-head')).not.toBeInTheDocument()
  })

  it('reserves the full project modal body', () => {
    const { container } = render(<ProjectModalSkeleton />)
    const chipRow = container.querySelector('.skeleton-chip-row')

    expect(container.querySelector('.s4-projects-details-actions')).toBeInTheDocument()
    expect(chipRow).toBeInTheDocument()
    expect(chipRow?.childElementCount).toBe(3)
  })
})
