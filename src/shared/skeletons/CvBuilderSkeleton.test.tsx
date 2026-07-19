import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CvBuilderSkeleton } from './CvBuilderSkeleton'

describe('CvBuilderSkeleton', () => {
  it('uses five selection groups, a 680px preview and three actions', () => {
    const { container } = render(<CvBuilderSkeleton />)
    expect(container.querySelectorAll('[data-skeleton-selection-group]')).toHaveLength(5)
    expect(container.querySelector('[data-testid="cv-preview-paper-skeleton"]')).toHaveStyle({
      minHeight: '680px',
    })
    expect(
      container.querySelectorAll('[data-testid="cv-action-buttons"] .skeleton-empty'),
    ).toHaveLength(3)
  })
})
