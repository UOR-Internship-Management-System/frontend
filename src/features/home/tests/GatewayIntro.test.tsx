import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GatewayIntro, gatewayIntroTiming } from '../components/GatewayIntro'
import { gatewayCaptions } from '../data/gatewayCaptions'

describe('GatewayIntro', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('runs the logo, slide, and exit phases in sequence', () => {
    const onComplete = vi.fn()
    const { container } = render(
      <GatewayIntro captions={gatewayCaptions} onComplete={onComplete} />,
    )
    const intro = container.querySelector('.gateway-v2-intro')

    expect(intro).toHaveAttribute('data-phase', 'logo')
    expect(container.querySelector('.logo-draw-reveal--once')).toBeInTheDocument()
    expect(container.querySelectorAll('.logo-draw-reveal__mark-stroke')).toHaveLength(1)
    expect(container.querySelector('.logo-draw-reveal__trace')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(gatewayIntroTiming.logoRevealMs)
    })

    expect(intro).toHaveAttribute('data-phase', 'slides')
    expect(intro).toHaveAttribute('data-active-slide', '0')

    act(() => {
      vi.advanceTimersByTime(gatewayIntroTiming.slideHoldMs)
    })

    expect(intro).toHaveAttribute('data-active-slide', '1')

    act(() => {
      vi.advanceTimersByTime(gatewayIntroTiming.slideHoldMs)
    })

    expect(intro).toHaveAttribute('data-active-slide', '2')

    act(() => {
      vi.advanceTimersByTime(gatewayIntroTiming.slideHoldMs)
    })

    expect(intro).toHaveAttribute('data-phase', 'exit')
    expect(onComplete).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(gatewayIntroTiming.exitMs)
    })

    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('allows the sequence to be skipped', () => {
    const onComplete = vi.fn()
    const { container } = render(
      <GatewayIntro captions={gatewayCaptions} onComplete={onComplete} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Skip intro' }))

    expect(container.querySelector('.gateway-v2-intro')).toHaveAttribute('data-phase', 'exit')

    act(() => {
      vi.advanceTimersByTime(gatewayIntroTiming.exitMs)
    })

    expect(onComplete).toHaveBeenCalledOnce()
  })
})
