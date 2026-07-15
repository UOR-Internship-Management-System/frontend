import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useOutlet } from 'react-router-dom'
import { routePaths } from '../config/routePaths'
import { Button } from '../../shared/components/ui/Button'
import { useAuth } from '../../shared/hooks/useAuth'

const links = [
  ['Dashboard', routePaths.studentDashboard],
  ['Profile', routePaths.studentProfile],
] as const

export function StudentLayout() {
  const auth = useAuth()
  const location = useLocation()
  const outlet = useOutlet()
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    setIsNavigationOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (isNavigationOpen) {
      firstLinkRef.current?.focus()
    }
  }, [isNavigationOpen])

  const closeNavigation = (restoreFocus = false) => {
    setIsNavigationOpen(false)
    if (restoreFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus())
    }
  }

  const handleNavigationKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && isNavigationOpen) {
      event.preventDefault()
      closeNavigation(true)
    }
  }

  return (
    <section className="workspace-layout">
      <div className="student-mobile-toolbar">
        <div>
          <span className="student-mobile-label">Student workspace</span>
          <strong>{auth.currentUser?.displayName || 'Student'}</strong>
        </div>
        <button
          aria-controls="student-navigation-panel"
          aria-expanded={isNavigationOpen}
          aria-label={isNavigationOpen ? 'Close student navigation' : 'Open student navigation'}
          className="button button-secondary student-menu-button"
          onClick={() => setIsNavigationOpen((current) => !current)}
          ref={menuButtonRef}
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined">
            {isNavigationOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      <aside
        className={`sidebar student-sidebar section-card ${isNavigationOpen ? 'student-sidebar-open' : ''}`.trim()}
        id="student-navigation-panel"
        onKeyDown={handleNavigationKeyDown}
      >
        <div className="student-sidebar-heading">
          <span className="student-sidebar-eyebrow">Student workspace</span>
          <h2>Welcome</h2>
          <p>{auth.currentUser?.displayName || 'Student'}</p>
        </div>
        <nav aria-label="Student navigation">
          <ul className="nav-list">
            {links.map(([label, to], index) => (
              <li key={to}>
                <NavLink
                  className="nav-link student-nav-link"
                  onClick={() => closeNavigation()}
                  ref={index === 0 ? firstLinkRef : undefined}
                  to={to}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Button className="logout-button" onClick={() => void auth.logout()} variant="secondary">
          Log Out
        </Button>
      </aside>
      <div className="content-stack student-content" id="student-content">
        <div className="page-transition" key={location.pathname}>
          {outlet}
        </div>
      </div>
    </section>
  )
}
