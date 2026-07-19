import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AcademicLedgerRouteSkeleton, LedgerUploadsTableSkeleton } from './AcademicLedgerSkeletons'

describe('Academic Ledger skeletons', () => {
  it('uses six columns and five upload rows', () => {
    const { container } = render(<LedgerUploadsTableSkeleton />)
    expect(
      screen.getByRole('status', { name: 'Loading recent ledger uploads' }),
    ).toBeInTheDocument()
    expect(container.querySelectorAll('.skeleton-table-head')).toHaveLength(6)
    expect(
      container.querySelectorAll('.skeleton-table-cell:not(.skeleton-table-head)'),
    ).toHaveLength(30)
  })

  it('reserves one route header and one upload panel', () => {
    const { container } = render(<AcademicLedgerRouteSkeleton />)
    expect(container.querySelectorAll('.skeleton-page-header, header.page-header')).toHaveLength(1)
    expect(container.querySelectorAll('.section-card')).toHaveLength(2)
  })
})
