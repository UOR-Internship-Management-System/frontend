import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoadingBoundary } from './LoadingBoundary'

describe('LoadingBoundary', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('cross-fades the skeleton and removes it after the exit duration', () => {
    const { rerender } = render(
      <LoadingBoundary isLoading skeleton={<div data-testid="skeleton">Skeleton</div>}>
        <div>Content</div>
      </LoadingBoundary>,
    )
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()

    rerender(
      <LoadingBoundary isLoading={false} skeleton={<div data-testid="skeleton">Skeleton</div>}>
        <div>Content</div>
      </LoadingBoundary>,
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByTestId('skeleton').parentElement).toHaveClass('is-exiting')

    act(() => vi.advanceTimersByTime(160))
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
  })

  it('restores the skeleton when loading starts again', () => {
    const { rerender } = render(
      <LoadingBoundary isLoading={false} skeleton={<div data-testid="skeleton">Skeleton</div>}>
        <div>Content</div>
      </LoadingBoundary>,
    )
    rerender(
      <LoadingBoundary isLoading skeleton={<div data-testid="skeleton">Skeleton</div>}>
        <div>Content</div>
      </LoadingBoundary>,
    )
    act(() => {})
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('cleans up the exit timer on unmount', () => {
    const clearSpy = vi.spyOn(window, 'clearTimeout')
    const { rerender, unmount } = render(
      <LoadingBoundary isLoading skeleton={<div>Skeleton</div>}>
        <div>Content</div>
      </LoadingBoundary>,
    )
    rerender(
      <LoadingBoundary isLoading={false} skeleton={<div>Skeleton</div>}>
        <div>Content</div>
      </LoadingBoundary>,
    )
    unmount()
    expect(clearSpy).toHaveBeenCalled()
  })
})
