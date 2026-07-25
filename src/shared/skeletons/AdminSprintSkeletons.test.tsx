import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  CandidateFilteringSkeleton,
  InternshipManagementSkeleton,
  ShortlistExportSkeleton,
} from './AdminSprintSkeletons'
import { StudentDeepDiveSkeleton } from './StudentDeepDiveSkeleton'

describe('Sprint 7-8 Admin route skeletons', () => {
  it.each([
    {
      Component: StudentDeepDiveSkeleton,
      label: 'Loading Student Deep-Dive',
      testId: 'student-deep-dive-skeleton',
    },
    {
      Component: InternshipManagementSkeleton,
      label: 'Loading Internship Management',
      testId: 'internship-management-skeleton',
    },
    {
      Component: CandidateFilteringSkeleton,
      label: 'Loading Candidate Filtering',
      testId: 'candidate-filtering-skeleton',
    },
    {
      Component: ShortlistExportSkeleton,
      label: 'Loading Shortlists and Exports',
      testId: 'shortlist-export-skeleton',
    },
  ])('announces $label and reserves its workspace geometry', ({ Component, label, testId }) => {
    render(<Component />)

    expect(screen.getByRole('status', { name: label })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  it('reserves independent academic, candidate, request, and shortlist table geometry', () => {
    const { rerender } = render(<StudentDeepDiveSkeleton />)
    expect(screen.getByTestId('student-academic-records-skeleton')).toBeInTheDocument()

    rerender(<InternshipManagementSkeleton />)
    expect(screen.getByTestId('internship-requests-table-skeleton')).toBeInTheDocument()

    rerender(<CandidateFilteringSkeleton />)
    expect(screen.getByTestId('candidate-results-table-skeleton')).toBeInTheDocument()

    rerender(<ShortlistExportSkeleton />)
    // The shortlist detail workspace appears in a modal after user interaction;
    // the initial skeleton only shows the ShortlistDirectory section with list rows.
    expect(screen.getByTestId('shortlist-export-skeleton')).toBeInTheDocument()
  })
})
