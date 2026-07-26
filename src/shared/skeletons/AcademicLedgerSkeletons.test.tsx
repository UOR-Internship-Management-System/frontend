import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  AcademicLedgerRouteSkeleton,
  LedgerInspectionTableSkeleton,
  LedgerRecordsModalSkeleton,
  LedgerUploadsTableSkeleton,
} from './AcademicLedgerSkeletons'

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

  it('reserves the wireframe header, upload, Student details, and history regions', () => {
    const { container } = render(<AcademicLedgerRouteSkeleton />)
    expect(container.querySelectorAll('.skeleton-page-header, header.page-header')).toHaveLength(1)
    expect(container.querySelectorAll('.section-card')).toHaveLength(3)
    expect(container.querySelectorAll('.ledger-upload-panel')).toHaveLength(1)
    expect(container.querySelectorAll('.ledger-inspection-panel')).toHaveLength(1)
    expect(container.querySelectorAll('.ledger-batches-panel')).toHaveLength(1)
  })

  it('matches the four-column Student table and five-column detail modal', () => {
    const inspection = render(<LedgerInspectionTableSkeleton />)
    expect(inspection.container.querySelectorAll('.skeleton-table-head')).toHaveLength(4)
    inspection.unmount()

    const modal = render(<LedgerRecordsModalSkeleton />)
    expect(modal.container.querySelectorAll('.skeleton-table-head')).toHaveLength(5)
  })
})
