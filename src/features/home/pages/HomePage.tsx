import { Link } from 'react-router-dom'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { routePaths } from '../../../app/config/routePaths'

const SLIDES = ['HERO', 'UPDATES', 'ABOUT', 'ACCESS'] as const;
type Slide = typeof SLIDES[number];

export function HomePage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)

  const handleScroll = useCallback((direction: 1 | -1) => {
    if (isScrolling) return;

    const nextIndex = currentSlideIndex + direction;
    if (nextIndex >= 0 && nextIndex < SLIDES.length) {
      setIsScrolling(true);
      setCurrentSlideIndex(nextIndex);
      setTimeout(() => setIsScrolling(false), 1200); // Prevent rapid scrolling
    }
  }, [currentSlideIndex, isScrolling])

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // Small threshold to ignore trackpad noise
      if (Math.abs(e.deltaY) > 20) {
        handleScroll(e.deltaY > 0 ? 1 : -1)
      }
    }

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    }
    const onTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const delta = touchStartY - touchEndY;
      if (Math.abs(delta) > 40) {
        handleScroll(delta > 0 ? 1 : -1)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') handleScroll(1)
      if (e.key === 'ArrowUp' || e.key === 'PageUp') handleScroll(-1)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: false })
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [handleScroll])

  const slideVariants: Variants = {
    initial: { opacity: 0, scale: 1.1, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } },
    exit: { opacity: 0, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } }
  }

  const currentSlide = SLIDES[currentSlideIndex];

  return (
    <article className="gateway-page" aria-labelledby="gateway-title">
      
      {/* Global Navigation Overlay */}
      <motion.nav 
        className="gateway-global-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, 
          display: 'flex', justifyContent: 'space-between', padding: '32px 5vw', pointerEvents: 'none'
        }}
      >
        <span className="small-label" style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>CV Management</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{ 
              width: '40px', height: '4px', background: i === currentSlideIndex ? '#fff' : 'rgba(255,255,255,0.2)',
              borderRadius: '2px', transition: 'background 0.4s'
            }} />
          ))}
        </div>
      </motion.nav>

      <AnimatePresence mode="wait">
        
        {currentSlide === 'HERO' && (
          <motion.section 
            key="hero"
            className="gateway-hero gateway-scroll-section" 
            variants={slideVariants} initial="initial" animate="animate" exit="exit"
          >
            <div className="gateway-hero-bg" />
            
            <motion.div className="gateway-hero-content">
              <motion.h1 
                id="gateway-title"
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(4rem, 10vw, 8rem)', lineHeight: 0.9, letterSpacing: '-0.04em',
                  fontWeight: 900, textTransform: 'uppercase', color: '#fff', textAlign: 'center',
                  textShadow: '0 12px 24px rgba(0,0,0,0.5)'
                }}
              >
                CV Management<br/>System
              </motion.h1>
            </motion.div>

            <motion.div 
              className="gateway-scroll-cue" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              style={{ position: 'absolute', bottom: '48px', color: '#fff' }}
            >
              <span className="material-symbols-outlined">keyboard_arrow_down</span>
            </motion.div>
          </motion.section>
        )}

        {currentSlide === 'UPDATES' && (
          <motion.section 
            key="updates"
            className="gateway-scroll-section" 
            variants={slideVariants} initial="initial" animate="animate" exit="exit"
            style={{ background: '#0a0a0a' }}
          >
            <div style={{ maxWidth: '800px', textAlign: 'center', padding: '0 24px' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#fff', textTransform: 'uppercase', fontWeight: 900 }}>Latest System Updates</h2>
              <p style={{ color: '#aaa', fontSize: '1.2rem', marginTop: '24px', lineHeight: 1.6 }}>
                Version 2.0 is live. Students can now seamlessly build profiles, generating resumes that match the 
                precise demands of modern industry recruiters. Department Admins have full oversight capabilities.
              </p>
            </div>
          </motion.section>
        )}

        {currentSlide === 'ABOUT' && (
          <motion.section 
            key="about"
            className="gateway-scroll-section" 
            variants={slideVariants} initial="initial" animate="animate" exit="exit"
            style={{ background: '#050505' }}
          >
            <div style={{ maxWidth: '800px', textAlign: 'center', padding: '0 24px' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#fff', textTransform: 'uppercase', fontWeight: 900 }}>Bridging the Gap</h2>
              <p style={{ color: '#aaa', fontSize: '1.2rem', marginTop: '24px', lineHeight: 1.6 }}>
                Connecting top-tier computer science talent directly with the opportunities they deserve. 
                A streamlined, powerful portal designed for speed, accuracy, and impact.
              </p>
            </div>
          </motion.section>
        )}

        {currentSlide === 'ACCESS' && (
          <motion.section 
            key="access"
            className="gateway-access gateway-scroll-section"
            variants={slideVariants} initial="initial" animate="animate" exit="exit"
          >
            <div className="gateway-access-header">
              <h2>Select your role</h2>
              <p>Enter the portal through your designated authorization path.</p>
            </div>

            <div className="gateway-split-panel" style={{ pointerEvents: 'auto' }}>
              <div className="gateway-card gateway-card-student">
                <span className="material-symbols-outlined" aria-hidden="true">school</span>
                <div>
                  <h3>Student</h3>
                  <p>Register or sign in with your university account.</p>
                </div>
                <div className="gateway-actions">
                  <Link className="button button-primary" to={routePaths.studentLogin}>Login</Link>
                  <Link className="button button-secondary" to={routePaths.studentSignUp}>Register</Link>
                </div>
              </div>

              <div className="gateway-card gateway-card-admin">
                <span className="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>
                <div>
                  <h3>Admin</h3>
                  <p>Use administrator credentials to access the workspace.</p>
                </div>
                <div className="gateway-actions">
                  <Link className="button button-primary" to={routePaths.adminLogin}>Login</Link>
                </div>
              </div>
            </div>
          </motion.section>
        )}

      </AnimatePresence>
    </article>
  )
}
