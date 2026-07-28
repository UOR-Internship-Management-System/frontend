# Gateway Intro and Landing Page Rebuild

> **Implementation status:** Completed. This document retains the original rebuild proposal and
> timing rationale. The delivered logo treatment was refined after the proposal: both the intro and
> final gateway now use `LogoDrawReveal`, which draws one continuous rounded white SVG path with a
> `220`-unit stroke. It has no scale expansion, highlight sweep, secondary guide stroke, or break
> between the C and V. The source files listed below are authoritative when an embedded proposal
> snippet differs from the final implementation.

## Scope

This implementation is based on the supplied `Frontend.zip` snapshot.

The current gateway is a fixed, two-column page:

- The left hero uses the existing dark gateway palette and a photographic background.
- The left-side copy is static in `src/features/home/pages/HomePage.tsx`, original lines 11–16.
- The right side contains the existing Student and Admin access cards.
- The route is lazy-loaded and currently uses `GatewaySkeleton`, so the fallback also needs to match the first intro frame to prevent a skeleton flash before the animation starts.
- Existing design tokens already define the institutional navy/slate palette, Google Sans typography, radii, shadows, and motion curves. This solution consumes those variables rather than introducing a second design system.

## Resulting page flow

| Phase              |     Timing | Behaviour                                                                                                   |
| ------------------ | ---------: | ----------------------------------------------------------------------------------------------------------- |
| Logo reveal        |   2,000 ms | A single continuous white SVG path draws the complete C/V mark without scaling or a secondary guide stroke. |
| Caption 1          |   1,250 ms | “Build your academic profile.”                                                                              |
| Caption 2          |   1,250 ms | Smooth vertical scroll to “Showcase skills and experience.”                                                 |
| Caption 3          |   1,250 ms | Smooth vertical scroll to “Connect with the right opportunities.”                                           |
| Landing transition |     420 ms | The intro overlay fades and scales away, revealing the final gateway.                                       |
| Final gateway      | Continuous | The same three captions loop through a natural typewriter/delete sequence on the left side.                 |

The intro’s slide viewport and final gateway page both hide scrollbars. The slide movement is transform-based, so it does not alter the document scroll position.

## Design and integration decisions

- All new selectors use the `gateway-v2-` namespace, preventing collisions with the existing gateway rules in `src/index.css`.
- Existing global tokens and shared `.button` variants are reused.
- The existing `/logo (2).png` asset remains the preload fallback; the animated runtime mark uses an inline SVG path, so no binary asset changes are required.
- The CSS is loaded from `src/main.tsx`, so the Suspense fallback and lazy-loaded page share the same first-paint styling.
- The gateway content is marked inert and hidden from assistive technology until the intro completes.
- The Skip button traps keyboard focus during the overlay and Escape also skips.
- After completion, focus moves to the gateway heading.
- `prefers-reduced-motion` bypasses the long sequence and avoids the typewriter character animation.
- No new npm dependencies are introduced.

## File map

### Existing files changed

1. `src/main.tsx`
2. `src/shared/skeletons/GatewaySkeleton.tsx`
3. `src/features/home/pages/HomePage.tsx`

### New files

1. `src/features/home/data/gatewayCaptions.ts`
2. `src/features/home/hooks/usePrefersReducedMotion.ts`
3. `src/features/home/components/TypewriterText.tsx`
4. `src/features/home/components/GatewayIntro.tsx`
5. `src/features/home/components/LogoDrawReveal.tsx`
6. `src/features/home/styles/gateway.css`
7. `src/features/home/tests/GatewayIntro.test.tsx`
8. `src/features/home/tests/HomePage.test.tsx`

---

# Existing file modifications

Line numbers below refer to the unmodified files in the supplied `Frontend.zip`.

## `src/main.tsx`

**Change location:** Insert the CSS import immediately after original line 5 (`import './index.css'`). No other original lines change.

**Final file contents:**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { env } from './app/config/env'
import './index.css'
import './features/home/styles/gateway.css'
import './styles/skeleton-system.css'
import './styles/sprint78-wireframe-alignment.css'
import './styles/internship-management-complete.css'
import './styles/shortlisted-page.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Application root element was not found.')
}

async function enableDevelopmentMocks() {
  if (!env.enableApiMocks || env.isProduction) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

void enableDevelopmentMocks().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
```

## `src/shared/skeletons/GatewaySkeleton.tsx`

**Change location:** Replace original lines 1–38 in full.

**Final file contents:**

```tsx
import { SkeletonStatusRegion } from './SkeletonPrimitives'

export function GatewaySkeleton() {
  return (
    <SkeletonStatusRegion className="gateway-v2-preload" label="Loading access gateway">
      <div aria-hidden="true" className="gateway-v2-preload-decoration" />
      <div aria-hidden="true" className="gateway-v2-preload-logo-stage">
        <img alt="" className="gateway-v2-preload-logo" src="/logo (2).png" />
      </div>
    </SkeletonStatusRegion>
  )
}
```

## `src/features/home/pages/HomePage.tsx`

**Change location:** Replace original lines 1–63 in full.

**Final file contents:**

```tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { GatewayIntro } from '../components/GatewayIntro'
import { TypewriterText } from '../components/TypewriterText'
import { gatewayCaptions, gatewayCaptionTexts } from '../data/gatewayCaptions'

export function HomePage() {
  const gatewayPageRef = useRef<HTMLElement>(null)
  const gatewayTitleRef = useRef<HTMLHeadingElement>(null)
  const [introComplete, setIntroComplete] = useState(false)

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  useEffect(() => {
    if (!gatewayPageRef.current) return

    gatewayPageRef.current.inert = !introComplete

    if (introComplete) {
      gatewayTitleRef.current?.focus({ preventScroll: true })
    }
  }, [introComplete])

  return (
    <>
      {!introComplete ? (
        <GatewayIntro captions={gatewayCaptions} onComplete={handleIntroComplete} />
      ) : null}

      <article
        aria-hidden={!introComplete}
        aria-labelledby="gateway-title"
        className="gateway-v2-page"
        ref={gatewayPageRef}
      >
        <section className="gateway-v2-hero">
          <div aria-hidden="true" className="gateway-v2-hero-bg" />

          <div className="gateway-v2-hero-content">
            <div className="gateway-v2-brand-lockup">
              <img alt="University logo" className="gateway-v2-logo" src="/logo (2).png" />
            </div>

            <p className="gateway-v2-eyebrow">CV Management System</p>
            <h1 id="gateway-title" ref={gatewayTitleRef} tabIndex={-1}>
              Department Access Gateway
            </h1>

            {introComplete ? (
              <TypewriterText captions={gatewayCaptionTexts} />
            ) : (
              <p aria-hidden="true" className="gateway-v2-typewriter-placeholder">
                {gatewayCaptionTexts[0]}
              </p>
            )}
          </div>
        </section>

        <section className="gateway-v2-access" aria-labelledby="gateway-access-title">
          <div className="gateway-v2-access-header">
            <p className="gateway-v2-access-kicker">Secure role-based access</p>
            <h2 id="gateway-access-title">Select your role</h2>
            <p>Choose the workspace assigned to your university account.</p>
          </div>

          <div className="gateway-v2-split-panel">
            <article className="gateway-v2-card gateway-v2-card-student">
              <span className="material-symbols-outlined" aria-hidden="true">
                school
              </span>
              <div>
                <h3>Student</h3>
                <p>Register or sign in with your university account.</p>
              </div>
              <div className="gateway-v2-actions">
                <Link className="button button-primary" to={routePaths.studentLogin}>
                  Login
                </Link>
                <Link className="button button-secondary" to={routePaths.studentSignUp}>
                  Register
                </Link>
              </div>
            </article>

            <article className="gateway-v2-card gateway-v2-card-admin">
              <span className="material-symbols-outlined" aria-hidden="true">
                admin_panel_settings
              </span>
              <div>
                <h3>Admin</h3>
                <p>Use your predefined administrator credentials to continue.</p>
              </div>
              <div className="gateway-v2-actions">
                <Link className="button button-primary" to={routePaths.adminLogin}>
                  Login
                </Link>
              </div>
            </article>
          </div>
        </section>
      </article>
    </>
  )
}
```

---

# New files

Create each file at the exact path shown.

## `src/features/home/data/gatewayCaptions.ts`

```ts
export const gatewayCaptions = [
  {
    id: 'profile',
    text: 'Build your academic profile.',
  },
  {
    id: 'skills',
    text: 'Showcase skills and experience.',
  },
  {
    id: 'opportunities',
    text: 'Connect with the right opportunities.',
  },
] as const

export const gatewayCaptionTexts = gatewayCaptions.map((caption) => caption.text)

export type GatewayCaption = (typeof gatewayCaptions)[number]
```

## `src/features/home/hooks/usePrefersReducedMotion.ts`

```ts
import { useEffect, useState } from 'react'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function getInitialPreference() {
  return typeof window !== 'undefined' && window.matchMedia?.(reducedMotionQuery).matches === true
}

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialPreference)

  useEffect(() => {
    const mediaQuery = window.matchMedia?.(reducedMotionQuery)

    if (!mediaQuery) return

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener?.('change', handleChange)

    return () => {
      mediaQuery.removeEventListener?.('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}
```

## `src/features/home/components/TypewriterText.tsx`

```tsx
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
  const [characterCount, setCharacterCount] = useState(0)
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
    <div className={`gateway-v2-typewriter ${className}`.trim()}>
      <p aria-hidden="true" className="gateway-v2-typewriter-copy">
        <span>{displayedCaption}</span>
        <span className="gateway-v2-typewriter-cursor">|</span>
      </p>
      <p aria-atomic="true" aria-live="polite" className="gateway-v2-visually-hidden">
        {currentCaption}
      </p>
    </div>
  )
}
```

## `src/features/home/components/GatewayIntro.tsx`

```tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import type { GatewayCaption } from '../data/gatewayCaptions'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

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
        <div className="gateway-v2-intro-logo-window">
          <img alt="" className="gateway-v2-intro-logo" src="/logo (2).png" />
        </div>
        <span className="gateway-v2-intro-logo-line" />
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
```

## `src/features/home/styles/gateway.css`

```css
/* Suspense fallback: keep the first paint visually aligned with the intro. */
.gateway-v2-preload {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  min-height: 100dvh;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 18%, rgb(29 78 216 / 24%), transparent 34%),
    radial-gradient(circle at 82% 78%, rgb(30 64 175 / 20%), transparent 38%), var(--gateway-bg);
}

.gateway-v2-preload-decoration {
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background-image:
    linear-gradient(rgb(148 163 184 / 12%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(148 163 184 / 12%) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, transparent, black 18%, black 75%, transparent);
}

.gateway-v2-preload-logo-stage {
  position: relative;
  z-index: 1;
  width: min(560px, 72vw);
  aspect-ratio: 16 / 9;
  display: grid;
  place-items: center;
}

.gateway-v2-preload-logo {
  display: block;
  width: 100%;
  height: auto;
  filter: invert(1);
  mix-blend-mode: screen;
}

.gateway-v2-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.gateway-v2-page,
.gateway-v2-intro {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.gateway-v2-page::-webkit-scrollbar,
.gateway-v2-intro::-webkit-scrollbar {
  display: none;
}

/* Intro sequence */
.gateway-v2-intro {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  min-height: 100dvh;
  overflow: hidden;
  padding: clamp(24px, 5vw, 72px);
  background:
    radial-gradient(circle at 18% 18%, rgb(29 78 216 / 24%), transparent 34%),
    radial-gradient(circle at 82% 78%, rgb(30 64 175 / 20%), transparent 38%), var(--gateway-bg);
  color: var(--sidebar-text);
}

.gateway-v2-intro::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, transparent 68%, rgb(2 6 23 / 46%) 100%);
}

.gateway-v2-intro-decoration {
  position: absolute;
  inset: 0;
  opacity: 0.2;
  pointer-events: none;
  background-image:
    linear-gradient(rgb(148 163 184 / 12%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(148 163 184 / 12%) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, transparent, black 18%, black 75%, transparent);
}

.gateway-v2-intro-skip {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 4;
  min-height: 42px;
  color: var(--sidebar-text);
  background: rgb(15 23 42 / 76%);
  border-color: var(--sidebar-border);
  backdrop-filter: blur(12px);
}

.gateway-v2-intro-logo-stage {
  position: relative;
  z-index: 2;
  width: min(560px, 72vw);
  aspect-ratio: 16 / 9;
  display: grid;
  place-items: center;
  transition:
    opacity 420ms var(--motion-standard),
    transform 520ms var(--motion-standard),
    filter 520ms var(--motion-standard);
}

.gateway-v2-intro-logo-window {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  overflow: hidden;
  clip-path: inset(0 100% 0 0 round var(--radius-lg));
  animation: gatewayV2LogoWindow 2000ms var(--motion-standard) both;
}

.gateway-v2-intro-logo {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  pointer-events: none;
  filter: invert(1);
  mix-blend-mode: screen;
  transform: scale(0.86);
  opacity: 0;
  animation: gatewayV2LogoImage 2000ms var(--motion-emphasized) both;
}

.gateway-v2-intro-logo-line {
  position: absolute;
  top: 18%;
  bottom: 18%;
  left: 0;
  width: 2px;
  opacity: 0;
  background: linear-gradient(to bottom, transparent, var(--sidebar-accent), transparent);
  box-shadow: 0 0 28px var(--sidebar-accent);
  animation: gatewayV2LogoSweep 2000ms var(--motion-standard) both;
}

.gateway-v2-intro--slides .gateway-v2-intro-logo-stage {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(-18vh) scale(0.72);
  pointer-events: none;
}

.gateway-v2-intro-slides {
  position: absolute;
  z-index: 3;
  width: min(920px, calc(100% - 48px));
  display: grid;
  justify-items: center;
  gap: 18px;
  opacity: 0;
  transform: translateY(48px);
  pointer-events: none;
  transition:
    opacity 420ms var(--motion-standard),
    transform 520ms var(--motion-standard);
}

.gateway-v2-intro--slides .gateway-v2-intro-slides {
  opacity: 1;
  transform: translateY(0);
}

.gateway-v2-intro-kicker {
  margin: 0;
  color: var(--sidebar-accent);
  font-size: var(--font-size-sm);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.gateway-v2-intro-slide-viewport {
  position: relative;
  width: 100%;
  height: clamp(120px, 20vw, 220px);
  overflow: hidden;
}

.gateway-v2-intro-slide {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0 24px;
  color: var(--sidebar-text);
  font-size: clamp(2rem, 6vw, 5.4rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.035em;
  text-align: center;
  transition:
    transform 540ms var(--motion-standard),
    opacity 300ms var(--motion-standard);
  will-change: transform, opacity;
}

.gateway-v2-intro-progress {
  display: flex;
  align-items: center;
  gap: 9px;
}

.gateway-v2-intro-progress span {
  width: 9px;
  height: 9px;
  border-radius: var(--radius-pill);
  background: var(--sidebar-border);
  transition:
    width var(--motion-duration-medium) var(--motion-standard),
    background-color var(--motion-duration-medium) var(--motion-standard);
}

.gateway-v2-intro-progress span.is-active {
  width: 34px;
  background: var(--sidebar-accent);
}

.gateway-v2-intro--exit {
  opacity: 0;
  transform: scale(1.015);
  pointer-events: none;
  transition:
    opacity 420ms var(--motion-standard),
    transform 420ms var(--motion-standard);
}

/* Final gateway landing */
.gateway-v2-page {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 0.9fr);
  min-height: 100dvh;
  overflow-y: auto;
  background: var(--gateway-bg);
  color: var(--sidebar-text);
}

.gateway-v2-hero {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: clamp(56px, 7vw, 112px);
}

.gateway-v2-hero-bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(145deg, rgb(2 6 23 / 36%) 0%, rgb(2 6 23 / 88%) 82%),
    url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=3174&auto=format&fit=crop')
      center / cover no-repeat;
}

.gateway-v2-hero::before,
.gateway-v2-hero::after {
  content: '';
  position: absolute;
  z-index: 1;
  border-radius: var(--radius-pill);
  pointer-events: none;
  background: color-mix(in srgb, var(--sidebar-active) 28%, transparent);
  filter: blur(2px);
}

.gateway-v2-hero::before {
  width: 240px;
  height: 240px;
  top: 88px;
  right: -72px;
}

.gateway-v2-hero::after {
  width: 180px;
  height: 180px;
  bottom: 96px;
  left: -64px;
}

.gateway-v2-hero-content {
  position: relative;
  z-index: 2;
  width: min(760px, 100%);
}

.gateway-v2-brand-lockup {
  width: min(196px, 46vw);
  aspect-ratio: 16 / 9;
  display: grid;
  place-items: center;
  margin-bottom: 24px;
  overflow: hidden;
}

.gateway-v2-logo {
  display: block;
  width: 100%;
  height: auto;
  filter: invert(1);
  mix-blend-mode: screen;
}

.gateway-v2-eyebrow,
.gateway-v2-access-kicker {
  margin: 0 0 12px;
  color: var(--sidebar-accent);
  font-size: var(--font-size-sm);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.gateway-v2-hero h1 {
  max-width: 840px;
  margin: 0;
  color: var(--sidebar-text);
  font-size: clamp(2.6rem, 7vw, 5.9rem);
  font-weight: 700;
  line-height: 0.96;
  letter-spacing: -0.045em;
}

.gateway-v2-typewriter,
.gateway-v2-typewriter-placeholder {
  min-height: 2.2em;
  max-width: 680px;
  margin: 28px 0 0;
  color: var(--sidebar-muted);
  font-size: clamp(1.08rem, 1.7vw, 1.34rem);
  font-weight: 500;
  line-height: 1.55;
}

.gateway-v2-typewriter-copy {
  margin: 0;
}

.gateway-v2-typewriter-cursor {
  display: inline-block;
  margin-left: 3px;
  color: var(--sidebar-accent);
  font-weight: 400;
  animation: gatewayV2CursorBlink 820ms steps(1, end) infinite;
}

.gateway-v2-access {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(24px, 4vw, 40px);
  padding: clamp(48px, 6vw, 88px);
  background: linear-gradient(180deg, var(--gateway-surface) 0%, var(--gateway-bg) 100%);
}

.gateway-v2-access-header {
  display: grid;
  justify-items: start;
  gap: 14px;
}

.gateway-v2-access-header h2 {
  margin: 0;
  color: var(--sidebar-text);
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 900;
  line-height: 1.05;
  text-transform: uppercase;
}

.gateway-v2-access-header > p:last-child {
  max-width: 560px;
  margin: 0;
  color: var(--sidebar-muted);
  font-size: 1.1rem;
  line-height: 1.6;
}

.gateway-v2-split-panel {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--sidebar-border);
  border-radius: var(--radius-xl);
  background: var(--sidebar-border);
  box-shadow: 0 32px 64px rgb(2 6 23 / 62%);
}

.gateway-v2-card {
  min-height: 210px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 14px;
  padding: clamp(24px, 3vw, 34px);
  background: var(--gateway-surface);
  text-align: left;
  transition:
    transform var(--motion-duration-medium) var(--motion-standard),
    background-color var(--motion-duration-medium) var(--motion-standard);
}

.gateway-v2-card + .gateway-v2-card {
  border-top: 1px solid var(--sidebar-border);
}

.gateway-v2-card:hover {
  background: var(--gateway-surface-hover);
  transform: translateY(-8px);
}

.gateway-v2-card .material-symbols-outlined {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  margin-bottom: 2px;
  border-radius: 50%;
  background: var(--sidebar-surface);
  color: var(--sidebar-accent);
  font-size: 31px;
}

.gateway-v2-card h3 {
  margin: 0;
  color: var(--sidebar-text);
  font-size: clamp(1.55rem, 2.6vw, 2.1rem);
  font-weight: 800;
  line-height: 1.05;
  text-transform: uppercase;
}

.gateway-v2-card p {
  max-width: 380px;
  margin: 0;
  color: var(--sidebar-muted);
  font-size: 1rem;
  line-height: 1.65;
}

.gateway-v2-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 16px;
  margin-top: 4px;
}

@keyframes gatewayV2LogoWindow {
  0% {
    clip-path: inset(0 100% 0 0 round var(--radius-lg));
  }

  54%,
  100% {
    clip-path: inset(0 0 0 0 round var(--radius-lg));
  }
}

@keyframes gatewayV2LogoImage {
  0% {
    opacity: 0;
    filter: invert(1) blur(12px);
    transform: scale(0.86);
  }

  48% {
    opacity: 1;
    filter: invert(1) blur(0);
    transform: scale(1.035);
  }

  72%,
  100% {
    opacity: 1;
    filter: invert(1) blur(0);
    transform: scale(1);
  }
}

@keyframes gatewayV2LogoSweep {
  0% {
    left: 0;
    opacity: 0;
  }

  12% {
    opacity: 1;
  }

  56% {
    left: 100%;
    opacity: 1;
  }

  62%,
  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes gatewayV2CursorBlink {
  0%,
  48% {
    opacity: 1;
  }

  49%,
  100% {
    opacity: 0;
  }
}

@media (max-width: 900px) {
  .gateway-v2-page {
    grid-template-columns: 1fr;
  }

  .gateway-v2-hero {
    min-height: 52dvh;
    padding: 88px 24px 48px;
  }

  .gateway-v2-hero h1 {
    font-size: clamp(2.35rem, 12vw, 3.6rem);
  }

  .gateway-v2-access {
    min-height: auto;
    gap: 24px;
    padding: 40px 24px 64px;
  }

  .gateway-v2-card {
    min-height: auto;
    gap: 16px;
    padding: 24px;
  }

  .gateway-v2-card .material-symbols-outlined {
    width: 48px;
    height: 48px;
    margin-bottom: 0;
    font-size: 28px;
  }

  .gateway-v2-actions,
  .gateway-v2-actions a {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .gateway-v2-intro {
    padding: 20px;
  }

  .gateway-v2-intro-skip {
    top: 14px;
    right: 14px;
  }

  .gateway-v2-intro-logo-stage {
    width: min(88vw, 420px);
  }

  .gateway-v2-intro-slides {
    width: calc(100% - 32px);
  }

  .gateway-v2-intro-slide {
    padding: 0 8px;
    font-size: clamp(1.8rem, 10vw, 3.2rem);
  }

  .gateway-v2-brand-lockup {
    margin-bottom: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gateway-v2-intro-logo-window {
    clip-path: none;
  }

  .gateway-v2-intro-logo {
    opacity: 1;
    filter: invert(1);
    transform: none;
  }

  .gateway-v2-intro-logo-line,
  .gateway-v2-typewriter-cursor {
    display: none;
  }
}
```

## `src/features/home/tests/GatewayIntro.test.tsx`

```tsx
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
```

## `src/features/home/tests/HomePage.test.tsx`

```tsx
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { gatewayIntroTiming } from '../components/GatewayIntro'
import { HomePage } from '../pages/HomePage'

describe('HomePage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
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

    fireEvent.click(screen.getByRole('button', { name: 'Skip intro' }))

    act(() => {
      vi.advanceTimersByTime(gatewayIntroTiming.exitMs)
    })

    expect(screen.queryByRole('region', { name: 'Gateway introduction' })).not.toBeInTheDocument()
    expect(gateway).toHaveAttribute('aria-hidden', 'false')
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Login' })).toHaveLength(2)
  })
})
```

---

# Implementation notes

## 1. Caption source of truth

`gatewayCaptions.ts` is the only place where intro and typewriter captions are defined. Both experiences consume this data, so text cannot drift between the two sequences.

To change a caption later, edit only the `text` value in that file. Keep each caption short enough to fit on one or two mobile lines.

## 2. Intro timing

Timing constants are exported from `GatewayIntro.tsx`:

```ts
export const gatewayIntroTiming = {
  logoRevealMs: 2000,
  slideHoldMs: 1250,
  exitMs: 420,
  reducedMotionMs: 180,
} as const
```

The CSS logo animations also use `2000ms`; keep that duration synchronized with `logoRevealMs`.

## 3. Hidden-scroll behaviour

No native scrolling is used for the captions. Each caption is absolutely positioned inside an overflow-hidden viewport and translated vertically. The following rules also suppress any page scrollbar:

```css
.gateway-v2-page,
.gateway-v2-intro {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.gateway-v2-page::-webkit-scrollbar,
.gateway-v2-intro::-webkit-scrollbar {
  display: none;
}
```

The final gateway remains vertically scrollable on small screens even though the scrollbar itself is hidden.

## 4. Existing gateway CSS

The old `.gateway-*` rules in `src/index.css` are intentionally left untouched. The new page uses the `gateway-v2-*` namespace, so the old selectors cannot override the rebuilt page. Keeping them avoids a large unrelated edit to the global stylesheet and minimizes merge risk.

They can be removed in a separate cleanup after confirming no older gateway markup is retained in another branch.

## 5. Logo treatment

The supplied logo is a black mark on an opaque white background. The following treatment allows it to sit on the existing dark gateway background without adding a new image asset:

```css
filter: invert(1);
mix-blend-mode: screen;
```

A transparent SVG remains the preferred future asset because it would permit true path drawing and remove blend-mode dependence.

## 6. Accessibility

- The intro has a named region and a visible Skip control.
- Keyboard focus is constrained to Skip while the overlay is active.
- Escape triggers the same exit path.
- The landing page uses `inert` plus `aria-hidden` until the overlay is removed.
- The visual typewriter string is `aria-hidden`; assistive technology receives only complete captions through a polite live region.
- Reduced-motion users see a brief static brand frame and then the landing page.
- The final heading receives focus when the intro completes.

## 7. Responsive behaviour

At widths below 900 px:

- The gateway changes from two columns to one.
- The hero becomes a shorter top section.
- Access cards and actions become full-width.
- The final page remains scrollable with its scrollbar hidden.

At widths below 560 px:

- Intro typography and logo dimensions reduce.
- The skip control maintains a safe edge offset.
- Caption slides remain centered without horizontal overflow.

---

# Validation

Run the following from the repository root after applying the files:

```bash
npm ci
npm run typecheck
npm run lint
npm test -- src/features/home/tests/GatewayIntro.test.tsx src/features/home/tests/HomePage.test.tsx
npm run build
```

## Acceptance checks

1. A cold visit to `/` shows the branded preload rather than the old gateway skeleton.
2. The animated logo reveal lasts exactly two seconds.
3. All three captions advance automatically with a smooth vertical movement.
4. No scrollbar appears during the intro or while the mobile gateway page scrolls.
5. The final landing appears automatically without a click.
6. The left hero types, pauses, deletes, and loops through the same three captions.
7. Student Login, Student Register, and Admin Login retain their existing route destinations.
8. The theme toggle remains covered during the intro and becomes available on the landing.
9. Escape and Skip both complete the intro.
10. Reduced-motion mode bypasses the long animation.
11. No console warnings occur under React Strict Mode.
12. The new tests pass.

## Validation performed while preparing this document

- The new stylesheet passed a PostCSS syntax parse.
- All new and modified TypeScript/TSX files passed TypeScript `transpileModule` syntax validation.
- A full dependency install and application build could not be completed in the preparation environment because the configured npm registry returned HTTP 503 while fetching `zod`. The implementation therefore still needs the repository commands above to confirm full project-level type resolution, linting, tests, and production bundling in your normal development environment.
