import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkeletonBlock } from './SkeletonBlock'

describe('SkeletonBlock', () => {
  it('uses explicit circle and medium radius classes', () => {
    const { rerender } = render(<SkeletonBlock label="Avatar" lines={0} radius="circle" />)
    expect(screen.getByRole('status', { name: 'Avatar' })).toHaveClass('skeleton-radius-circle')

    rerender(<SkeletonBlock label="Field" lines={0} radius="md" />)
    const field = screen.getByRole('status', { name: 'Field' })
    expect(field).toHaveClass('skeleton-radius-md', 'skeleton-shimmer-surface')
    expect(field).not.toHaveClass('skeleton-radius-pill', 'skeleton-radius-circle')
  })

  it('attaches shimmer surfaces to empty shapes and every text line', () => {
    const { container, rerender } = render(<SkeletonBlock label="Shape" lines={0} />)
    expect(container.querySelector('.skeleton-empty')).toHaveClass('skeleton-shimmer-surface')

    rerender(<SkeletonBlock label="Text" lines={3} />)
    expect(container.querySelectorAll('.skeleton-line.skeleton-shimmer-surface')).toHaveLength(3)
  })

  it('keeps decorative placeholders out of the accessibility tree', () => {
    const { container } = render(<SkeletonBlock decorative label="Hidden" lines={2} />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('creates one named status region for non-decorative blocks', () => {
    render(<SkeletonBlock label="Loading profile" lines={2} />)
    expect(screen.getAllByRole('status', { name: 'Loading profile' })).toHaveLength(1)
  })
})
