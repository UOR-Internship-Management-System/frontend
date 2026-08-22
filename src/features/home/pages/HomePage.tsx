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

          <div className="gateway-v2-brand-lockup">
            <img
              alt="University logo"
              className="gateway-v2-static-logo"
              height={100}
              src="/assets/cv-logo.png"
              width={160}
            />
          </div>

          <div className="gateway-v2-hero-content">
            <h1
              id="gateway-title"
              ref={gatewayTitleRef}
              tabIndex={-1}
              className="gateway-v2-dynamic-title"
            >
              {introComplete ? (
                <TypewriterText captions={gatewayCaptionTexts} />
              ) : (
                <span aria-hidden="true" className="gateway-v2-typewriter-placeholder">
                  <span className="gateway-v2-typewriter-copy">
                    <span>{gatewayCaptionTexts[0]}</span>
                    <span className="gateway-v2-typewriter-cursor">|</span>
                  </span>
                </span>
              )}
            </h1>
          </div>
        </section>

        <section className="gateway-v2-access" aria-labelledby="gateway-access-title">
          <div className="gateway-v2-access-header">
            <p className="gateway-v2-access-kicker">Secure role-based access</p>
            <h2 id="gateway-access-title">Select your role</h2>
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
