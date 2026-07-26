import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectModalSkeleton, StudentProjectsSkeleton } from './StudentProjectsSkeleton'

describe('StudentProjectsSkeleton', () => {
  it('uses four project-specific repository rows instead of a generic table skeleton', () => {
    const { container } = render(<StudentProjectsSkeleton />)
    expect(container.querySelectorAll('.skeleton-project-row')).toHaveLength(4)
    expect(container.querySelector('.skeleton-project-toolbar')).toBeInTheDocument()
    expect(container.querySelector('.skeleton-table-head')).not.toBeInTheDocument()
  })

  it('reserves the full project modal body', () => {
    const { container } = render(<ProjectModalSkeleton />)
    expect(container.querySelector('.skeleton-modal-footer')).toBeInTheDocument()
    expect(container.querySelectorAll('.skeleton-chip-row .skeleton-empty')).toHaveLength(3)
  })
})
