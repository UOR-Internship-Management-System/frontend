import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GatewayIntro, gatewayIntroTiming } from '../components/GatewayIntro'

describe('GatewayIntro', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
    window.HTMLMediaElement.prototype.pause = vi.fn()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders the full-screen cinematic video and minimalist skip control', () => {
    const onComplete = vi.fn()
    const { container } = render(<GatewayIntro onComplete={onComplete} />)

    const intro = container.querySelector('.gateway-v2-intro-cinema')
    expect(intro).toHaveAttribute('data-phase', 'playing')

    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('src', '/videos/Required%20Intro%20video.mp4')
    expect(video).toHaveProperty('muted', true)
    expect(video).toHaveProperty('autoplay', true)
    expect(video).toHaveProperty('playsInline', true)

    expect(screen.getByRole('button', { name: /skip intro/i })).toBeInTheDocument()
  })

  it('automatically finishes when the video ends', () => {
    const onComplete = vi.fn()
    const { container } = render(<GatewayIntro onComplete={onComplete} />)

    const video = container.querySelector('video') as HTMLVideoElement
    fireEvent.ended(video)

    expect(container.querySelector('.gateway-v2-intro-cinema')).toHaveAttribute(
      'data-phase',
      'exit',
    )
    expect(onComplete).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(gatewayIntroTiming.exitMs)
    })

    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('allows the sequence to be skipped via skip button', () => {
    const onComplete = vi.fn()
    const { container } = render(<GatewayIntro onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: /skip intro/i }))

    expect(container.querySelector('.gateway-v2-intro-cinema')).toHaveAttribute(
      'data-phase',
      'exit',
    )

    act(() => {
      vi.advanceTimersByTime(gatewayIntroTiming.exitMs)
    })

    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('allows the sequence to be skipped via Escape key', () => {
    const onComplete = vi.fn()
    const { container } = render(<GatewayIntro onComplete={onComplete} />)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(container.querySelector('.gateway-v2-intro-cinema')).toHaveAttribute(
      'data-phase',
      'exit',
    )

    act(() => {
      vi.advanceTimersByTime(gatewayIntroTiming.exitMs)
    })

    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('gracefully exits if the video encounters an error', () => {
    const onComplete = vi.fn()
    const { container } = render(<GatewayIntro onComplete={onComplete} />)

    const video = container.querySelector('video') as HTMLVideoElement
    fireEvent.error(video)

    expect(container.querySelector('.gateway-v2-intro-cinema')).toHaveAttribute(
      'data-phase',
      'exit',
    )

    act(() => {
      vi.advanceTimersByTime(gatewayIntroTiming.exitMs)
    })

    expect(onComplete).toHaveBeenCalledOnce()
  })
})
