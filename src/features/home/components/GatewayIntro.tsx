import { useCallback, useEffect, useRef, useState } from 'react'
import type { GatewayCaption } from '../data/gatewayCaptions'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type IntroPhase = 'playing' | 'exit'

export type GatewayIntroProps = {
  captions?: readonly GatewayCaption[]
  onComplete: () => void
  videoSrc?: string
}

export const gatewayIntroTiming = {
  exitMs: 500,
  reducedMotionMs: 150,
} as const

const DEFAULT_VIDEO_SRC = '/videos/Required%20Intro%20video.mp4'

export function GatewayIntro({ onComplete, videoSrc = DEFAULT_VIDEO_SRC }: GatewayIntroProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const skipButtonRef = useRef<HTMLButtonElement>(null)
  const hasCompletedRef = useRef(false)
  const [phase, setPhase] = useState<IntroPhase>('playing')

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
    const timer = window.setTimeout(completeIntro, gatewayIntroTiming.exitMs)
    return () => window.clearTimeout(timer)
  }, [completeIntro, prefersReducedMotion])

  // Focus skip button on mount for immediate keyboard accessibility
  useEffect(() => {
    skipButtonRef.current?.focus({ preventScroll: true })
  }, [])

  // Respect reduced motion: finish immediately
  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = window.setTimeout(completeIntro, gatewayIntroTiming.reducedMotionMs)
      return () => window.clearTimeout(timer)
    }
  }, [completeIntro, prefersReducedMotion])

  // Keyboard shortcut: Escape to skip
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        requestExit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [requestExit])

  // Initiate autoplay safely
  useEffect(() => {
    const video = videoRef.current
    if (!video || prefersReducedMotion) return

    try {
      const playPromise = video.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Autoplay blocked by browser policy; remains ready for user interaction/skip
        })
      }
    } catch {
      // Safe fallback
    }
  }, [prefersReducedMotion])

  return (
    <section
      aria-label="Gateway introduction"
      className={`gateway-v2-intro-cinema gateway-v2-intro-cinema--${phase}`}
      data-phase={phase}
    >
      <video
        aria-label="University of Ruhuna Internship Management System Introduction"
        autoPlay
        className="gateway-v2-intro-cinema-video"
        disablePictureInPicture
        disableRemotePlayback
        muted
        onEnded={requestExit}
        onError={requestExit}
        playsInline
        preload="auto"
        ref={videoRef}
        src={videoSrc}
      />

      <div className="gateway-v2-intro-cinema-scrim" aria-hidden="true" />

      <div className="gateway-v2-intro-cinema-overlay">
        <button
          aria-label="Skip intro (Press Escape)"
          className="gateway-v2-intro-cinema-skip"
          onClick={requestExit}
          ref={skipButtonRef}
          type="button"
        >
          <span>Skip Intro</span>
          <span className="gateway-v2-intro-cinema-skip-key" aria-hidden="true">
            ESC
          </span>
          <span
            className="material-symbols-outlined gateway-v2-intro-cinema-skip-icon"
            aria-hidden="true"
          >
            arrow_forward
          </span>
        </button>
      </div>
    </section>
  )
}
