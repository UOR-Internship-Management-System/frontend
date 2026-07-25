import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AcademicRecordsSkeleton } from './AcademicRecordsSkeleton'

describe('AcademicRecordsSkeleton', () => {
  it('matches the single GPA card and five-column result-table geometry', () => {
    const { container } = render(<AcademicRecordsSkeleton />)
    expect(container.querySelectorAll('[data-skeleton-gpa-card]')).toHaveLength(1)
    expect(container.querySelectorAll('.skeleton-table-head')).toHaveLength(5)
    expect(
      container.querySelectorAll('.skeleton-table-cell:not(.skeleton-table-head)'),
    ).toHaveLength(25)
  })
})
