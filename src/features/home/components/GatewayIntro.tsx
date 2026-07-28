import { useCallback, useEffect, useRef, useState } from 'react'
import type { GatewayCaption } from '../data/gatewayCaptions'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { LogoDrawReveal } from './LogoDrawReveal'

type IntroPhase = 'logo' | 'slides' | 'exit'

type GatewayIntroProps = {
  captions: readonly GatewayCaption[]
  onComplete: () => void
}

export const gatewayIntroTiming = {
  logoRevealMs: 2000,
  slideHoldMs: 1250,
  exitMs: 420,
  reducedMotionMs: 180,
} as const

export function GatewayIntro({ captions, onComplete }: GatewayIntroProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const skipButtonRef = useRef<HTMLButtonElement>(null)
  const hasCompletedRef = useRef(false)
  const [phase, setPhase] = useState<IntroPhase>('logo')
  const [activeSlide, setActiveSlide] = useState(0)

  const completeIntro = useCallback(() => {
    if (hasCompletedRef.current) return

    hasCompletedRef.current = true
    onComplete()
  }, [onComplete])

  const requestExit = useCallback(() => {
    if (prefersReducedMotion) {
      completeIntro()
      return
    }

    setPhase('exit')
  }, [completeIntro, prefersReducedMotion])

  useEffect(() => {
    skipButtonRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        requestExit()
      }

      if (event.key === 'Tab') {
        event.preventDefault()
        skipButtonRef.current?.focus({ preventScroll: true })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [requestExit])

  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = window.setTimeout(completeIntro, gatewayIntroTiming.reducedMotionMs)
      return () => window.clearTimeout(timer)
    }

    if (phase === 'logo') {
      const timer = window.setTimeout(() => {
        if (captions.length === 0) {
          setPhase('exit')
          return
        }

        setPhase('slides')
      }, gatewayIntroTiming.logoRevealMs)

      return () => window.clearTimeout(timer)
    }

    if (phase === 'slides') {
      const timer = window.setTimeout(() => {
        if (activeSlide < captions.length - 1) {
          setActiveSlide((currentSlide) => currentSlide + 1)
          return
        }

        setPhase('exit')
      }, gatewayIntroTiming.slideHoldMs)

      return () => window.clearTimeout(timer)
    }

    const timer = window.setTimeout(completeIntro, gatewayIntroTiming.exitMs)
    return () => window.clearTimeout(timer)
  }, [activeSlide, captions.length, completeIntro, phase, prefersReducedMotion])

  return (
    <section
      aria-label="Gateway introduction"
      className={`gateway-v2-intro gateway-v2-intro--${phase}`}
      data-active-slide={activeSlide}
      data-phase={phase}
    >
      <button
        className="button button-secondary gateway-v2-intro-skip"
        onClick={requestExit}
        ref={skipButtonRef}
        type="button"
      >
        Skip intro
      </button>

      <div aria-hidden="true" className="gateway-v2-intro-decoration" />

      <div aria-hidden="true" className="gateway-v2-intro-logo-stage">
        <LogoDrawReveal alt="" className="gateway-v2-intro-logo" />
      </div>

      <div className="gateway-v2-intro-slides" role="status">
        <p className="gateway-v2-intro-kicker">CV Management System</p>
        <div className="gateway-v2-intro-slide-viewport">
          {captions.map((caption, index) => {
            const offset = (index - activeSlide) * 112
            const isActive = phase === 'slides' && index === activeSlide

            return (
              <p
                aria-hidden={!isActive}
                className="gateway-v2-intro-slide"
                key={caption.id}
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: `translate3d(0, ${offset}%, 0)`,
                }}
              >
                {caption.text}
              </p>
            )
          })}
        </div>

        <div aria-hidden="true" className="gateway-v2-intro-progress">
          {captions.map((caption, index) => (
            <span className={index === activeSlide ? 'is-active' : ''} key={caption.id} />
          ))}
        </div>
      </div>
    </section>
  )
}
