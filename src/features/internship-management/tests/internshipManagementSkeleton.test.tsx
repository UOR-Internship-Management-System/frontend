import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  InternshipManagementDetailsSkeleton,
  InternshipManagementListSkeleton,
} from '../components/InternshipManagementListSkeleton'

describe('internship management skeleton geometry', () => {
  it('matches the three-row company list and its pagination structure', () => {
    render(<InternshipManagementListSkeleton rows={3} variant="companies" />)

    const skeleton = screen.getByTestId('companies-list-skeleton')
    expect(skeleton.querySelectorAll('.wireframe-management-row')).toHaveLength(3)
    expect(skeleton.querySelectorAll('.wireframe-row-actions')).toHaveLength(3)
    expect(skeleton.querySelectorAll('.wireframe-skeleton-meta .skeleton-empty')).toHaveLength(6)
    expect(skeleton.querySelector('.wireframe-pagination')).toBeInTheDocument()
  })

  it('matches the four-row request list and three-line row metadata', () => {
    render(<InternshipManagementListSkeleton rows={4} variant="requests" />)

    const skeleton = screen.getByTestId('requests-list-skeleton')
    expect(skeleton.querySelectorAll('.wireframe-management-row')).toHaveLength(4)
    expect(skeleton.querySelectorAll('.wireframe-row-actions')).toHaveLength(4)
    expect(skeleton.querySelectorAll('.wireframe-skeleton-meta .skeleton-empty')).toHaveLength(12)
    expect(skeleton.querySelector('.wireframe-pagination')).toBeInTheDocument()
  })

  it('uses the same details grid field counts as each loaded modal', () => {
    const { rerender } = render(<InternshipManagementDetailsSkeleton variant="company" />)
    expect(document.querySelectorAll('.wireframe-details-grid > div')).toHaveLength(5)

    rerender(<InternshipManagementDetailsSkeleton variant="request" />)
    expect(document.querySelectorAll('.wireframe-details-grid > div')).toHaveLength(3)
  })
})
