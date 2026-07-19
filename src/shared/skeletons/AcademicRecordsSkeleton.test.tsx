import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AcademicRecordsSkeleton } from './AcademicRecordsSkeleton'

describe('AcademicRecordsSkeleton', () => {
  it('matches the three-card GPA and nine-column table geometry', () => {
    const { container } = render(<AcademicRecordsSkeleton />)
    expect(container.querySelectorAll('[data-skeleton-gpa-card]')).toHaveLength(3)
    expect(container.querySelectorAll('.skeleton-table-head')).toHaveLength(9)
    expect(
      container.querySelectorAll('.skeleton-table-cell:not(.skeleton-table-head)'),
    ).toHaveLength(45)
  })
})
