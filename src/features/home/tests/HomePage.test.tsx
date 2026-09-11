import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { gatewayIntroTiming } from '../components/GatewayIntro'
import { HomePage } from '../pages/HomePage'

describe('HomePage', () => {
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

  it('reveals the gateway after the intro finishes', () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    const gateway = container.querySelector('.gateway-v2-page')

    expect(screen.getByRole('region', { name: 'Gateway introduction' })).toBeInTheDocument()
    expect(gateway).toHaveAttribute('aria-hidden', 'true')

    fireEvent.click(screen.getByRole('button', { name: /skip intro/i }))

    act(() => {
      vi.advanceTimersByTime(gatewayIntroTiming.exitMs)
    })

    expect(screen.queryByRole('region', { name: 'Gateway introduction' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'University logo' })).toHaveAttribute(
      'src',
      '/assets/cv-logo.png',
    )
    expect(screen.getByRole('img', { name: 'University logo' })).toHaveClass(
      'gateway-v2-static-logo',
    )
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Login' })).toHaveLength(2)
  })
})
