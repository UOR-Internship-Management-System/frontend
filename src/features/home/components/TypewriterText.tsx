import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type TypewriterPhase = 'typing' | 'deleting'

type TypewriterTextProps = {
  captions: readonly string[]
  className?: string
}

const fullCaptionHoldMs = 1500
const betweenCaptionPauseMs = 260
const reducedMotionCaptionHoldMs = 2800
const deletingDelayMs = 26

function getTypingDelay(character: string) {
  if (/[.!?]/.test(character)) return 180
  if (/[,;:]/.test(character)) return 110
  if (character === ' ') return 34
  return 58
}

export function TypewriterText({ captions, className = '' }: TypewriterTextProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [captionIndex, setCaptionIndex] = useState(0)
  const [characterCount, setCharacterCount] = useState(() => captions[0]?.length ?? 0)
  const [phase, setPhase] = useState<TypewriterPhase>('typing')

  const safeCaptionIndex = captions.length === 0 ? 0 : captionIndex % captions.length
  const currentCaption = captions[safeCaptionIndex] ?? ''
  const displayedCaption = prefersReducedMotion
    ? currentCaption
    : currentCaption.slice(0, characterCount)

  useEffect(() => {
    if (!prefersReducedMotion || captions.length < 2) return

    const timer = window.setTimeout(() => {
      setCaptionIndex((currentIndex) => (currentIndex + 1) % captions.length)
    }, reducedMotionCaptionHoldMs)

    return () => window.clearTimeout(timer)
  }, [captionIndex, captions.length, prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion || captions.length === 0) return

    if (phase === 'typing') {
      if (characterCount < currentCaption.length) {
        const nextCharacter = currentCaption.charAt(characterCount)
        const timer = window.setTimeout(() => {
          setCharacterCount((currentCount) => currentCount + 1)
        }, getTypingDelay(nextCharacter))

        return () => window.clearTimeout(timer)
      }

      const timer = window.setTimeout(() => {
        setPhase('deleting')
      }, fullCaptionHoldMs)

      return () => window.clearTimeout(timer)
    }

    if (phase === 'deleting') {
      if (characterCount > 0) {
        const timer = window.setTimeout(() => {
          setCharacterCount((currentCount) => Math.max(0, currentCount - 1))
        }, deletingDelayMs)

        return () => window.clearTimeout(timer)
      }

      const timer = window.setTimeout(() => {
        setCaptionIndex((currentIndex) => (currentIndex + 1) % captions.length)
        setPhase('typing')
      }, betweenCaptionPauseMs)

      return () => window.clearTimeout(timer)
    }

    return undefined
  }, [captions.length, characterCount, currentCaption, phase, prefersReducedMotion])

  return (
    <span className={`gateway-v2-typewriter ${className}`.trim()}>
      <span aria-hidden="true" className="gateway-v2-typewriter-copy">
        <span>{displayedCaption}</span>
        <span className="gateway-v2-typewriter-cursor">|</span>
      </span>
      <span aria-atomic="true" aria-live="polite" className="gateway-v2-visually-hidden">
        {currentCaption}
      </span>
    </span>
  )
}
