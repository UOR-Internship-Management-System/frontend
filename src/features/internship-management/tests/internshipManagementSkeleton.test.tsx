import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  InternshipManagementDetailsSkeleton,
  InternshipManagementListSkeleton,
  InternshipRequestToolbarSkeleton,
} from '../components/InternshipManagementListSkeleton'

describe('internship management skeleton geometry', () => {
  it('matches company rows with separate title, status, metadata, and action geometry', () => {
    render(<InternshipManagementListSkeleton rows={3} variant="companies" />)

    const skeleton = screen.getByTestId('companies-list-skeleton')
    expect(skeleton.querySelectorAll('.wireframe-management-row')).toHaveLength(3)
    expect(skeleton.querySelectorAll('.wireframe-skeleton-title-row')).toHaveLength(3)
    expect(skeleton.querySelectorAll('.wireframe-skeleton-title')).toHaveLength(3)
    expect(skeleton.querySelectorAll('.wireframe-skeleton-status')).toHaveLength(3)
    expect(skeleton.querySelectorAll('.wireframe-row-actions')).toHaveLength(3)
    expect(skeleton.querySelectorAll('.wireframe-skeleton-action-view')).toHaveLength(3)
    expect(skeleton.querySelectorAll('.wireframe-skeleton-action-delete')).toHaveLength(3)
    expect(skeleton.querySelector('.internship-pagination-skeleton')).not.toBeInTheDocument()
  })

  it('matches request rows and reserves wrapped required-skills geometry', () => {
    render(<InternshipManagementListSkeleton rows={4} variant="requests" />)

    const skeleton = screen.getByTestId('requests-list-skeleton')
    expect(skeleton.querySelectorAll('.wireframe-management-row')).toHaveLength(4)
    expect(skeleton.querySelectorAll('.wireframe-skeleton-title-row')).toHaveLength(4)
    expect(skeleton.querySelectorAll('.wireframe-skeleton-status')).toHaveLength(4)
    expect(screen.getAllByTestId('request-skills-skeleton')).toHaveLength(4)
    expect(skeleton.querySelectorAll('.wireframe-skeleton-skills .skeleton-empty')).toHaveLength(8)
    expect(skeleton.querySelectorAll('.wireframe-row-actions')).toHaveLength(4)
  })

  it('renders a request toolbar skeleton with the same three control regions as the loaded toolbar', () => {
    render(<InternshipRequestToolbarSkeleton />)

    const toolbar = screen.getByTestId('requests-toolbar-skeleton')
    expect(toolbar).toHaveClass('internship-request-toolbar')
    expect(toolbar.querySelectorAll('.internship-toolbar-field-skeleton')).toHaveLength(2)
    expect(toolbar.querySelector('.internship-toolbar-search-skeleton')).toBeInTheDocument()
  })

  it('renders pagination only when the caller knows pagination will be present', () => {
    const { rerender } = render(<InternshipManagementListSkeleton rows={3} variant="companies" />)
    expect(document.querySelector('.internship-pagination-skeleton')).not.toBeInTheDocument()

    rerender(<InternshipManagementListSkeleton rows={3} showPagination variant="companies" />)
    expect(document.querySelector('.internship-pagination-summary-skeleton')).toBeInTheDocument()
    expect(
      document.querySelectorAll('.internship-pagination-actions-skeleton .skeleton-empty'),
    ).toHaveLength(2)
  })

  it('uses the pagination class shared with loaded lists', () => {
    render(<InternshipManagementListSkeleton rows={3} showPagination variant="companies" />)

    expect(document.querySelector('.pagination-bar')).toBeInTheDocument()
  })

  it('uses the same details-grid field counts as each loaded modal', () => {
    const { rerender } = render(<InternshipManagementDetailsSkeleton variant="company" />)
    expect(document.querySelectorAll('.wireframe-details-grid > div')).toHaveLength(7)

    rerender(<InternshipManagementDetailsSkeleton variant="request" />)
    expect(document.querySelectorAll('.wireframe-details-grid > div')).toHaveLength(6)
  })
})
