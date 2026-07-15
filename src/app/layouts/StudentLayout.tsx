import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { ThemeToggle } from '../../shared/components/ui/ThemeToggle'
import { useAuth } from '../../shared/hooks/useAuth'
import { StudentSidebar } from './student/StudentSidebar'
import { studentNavigation } from './student/studentNavigation'

const mobileViewportQuery = '(max-width: 899px)'
const mobileDrawerFocusableSelector = [
  '[data-student-mobile-focus]',
  '[data-student-navigation-link]',
  '[data-student-logout]',
].join(',')

function isMobileViewportNow() {
  return typeof window !== 'undefined' && window.matchMedia?.(mobileViewportQuery).matches === true
}

export function StudentLayout() {
  const auth = useAuth()
  const location = useLocation()
  const outlet = useOutlet()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(isMobileViewportNow)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const sidebarRef = useRef<HTMLElement | null>(null)
  const firstNavigationItemRef = useRef<HTMLAnchorElement | null>(null)
  const previousPathRef = useRef(location.pathname)
  const studentName = auth.currentUser?.displayName || 'Student'

  const closeMobileDrawer = useCallback((restoreFocus = true) => {
    setIsMobileDrawerOpen(false)
    if (restoreFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus())
    }
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia?.(mobileViewportQuery)
    if (!mediaQuery) {
      return undefined
    }

    const updateViewport = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobileViewport(event.matches)
      if (!event.matches) {
        setIsMobileDrawerOpen(false)
      }
    }

    updateViewport(mediaQuery)
    mediaQuery.addEventListener('change', updateViewport)
    return () => mediaQuery.removeEventListener('change', updateViewport)
  }, [])

  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname
      setIsMobileDrawerOpen(false)
    }
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileDrawerOpen) {
      return undefined
    }

    const frame = window.requestAnimationFrame(() => firstNavigationItemRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [isMobileDrawerOpen])

  useEffect(() => {
    if (!isMobileViewport || !isMobileDrawerOpen) {
      return undefined
    }

    document.body.classList.add('student-mobile-drawer-open')
    return () => document.body.classList.remove('student-mobile-drawer-open')
  }, [isMobileDrawerOpen, isMobileViewport])

  useEffect(() => {
    if (!isMobileDrawerOpen) {
      return undefined
    }

    const handleDrawerKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMobileDrawer(true)
        return
      }

      if (event.key !== 'Tab' || !sidebarRef.current) {
        return
      }

      const focusableItems = Array.from(
        sidebarRef.current.querySelectorAll<HTMLElement>(mobileDrawerFocusableSelector),
      ).filter((item) => !item.hasAttribute('disabled'))
      const firstItem = focusableItems[0]
      const lastItem = focusableItems.at(-1)

      if (!firstItem || !lastItem) {
        return
      }

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      } else if (!sidebarRef.current.contains(document.activeElement)) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', handleDrawerKeyboard)
    return () => document.removeEventListener('keydown', handleDrawerKeyboard)
  }, [closeMobileDrawer, isMobileDrawerOpen])

  return (
    <section
      className={`student-shell ${isSidebarCollapsed ? 'student-shell-collapsed' : ''}`.trim()}
    >
      <a className="student-skip-link" href="#student-content">
        Skip to student content
      </a>

      <StudentSidebar
        firstNavigationItemRef={firstNavigationItemRef}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileDrawerOpen}
        isMobileViewport={isMobileViewport}
        navigationItems={studentNavigation}
        onCloseMobile={closeMobileDrawer}
        onLogout={() => void auth.logout()}
        onToggleCollapsed={() => setIsSidebarCollapsed((current) => !current)}
        sidebarRef={sidebarRef}
        studentName={studentName}
      />

      {isMobileDrawerOpen ? (
        <div
          aria-hidden="true"
          className="student-sidebar-backdrop"
          data-testid="student-sidebar-backdrop"
          onClick={() => closeMobileDrawer(true)}
        />
      ) : null}

      <div className="student-shell-main">
        <header className="student-workspace-toolbar">
          <div className="student-mobile-context">
            <span>Student workspace</span>
            <strong>{studentName}</strong>
          </div>
          <div className="student-workspace-actions">
            <button
              aria-controls="student-navigation-panel"
              aria-expanded={isMobileDrawerOpen}
              aria-label={
                isMobileDrawerOpen ? 'Close student navigation' : 'Open student navigation'
              }
              className="student-sidebar-icon-button student-mobile-menu"
              onClick={() =>
                isMobileDrawerOpen ? closeMobileDrawer(true) : setIsMobileDrawerOpen(true)
              }
              ref={menuButtonRef}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                {isMobileDrawerOpen ? 'close' : 'menu'}
              </span>
            </button>
            <ThemeToggle className="student-workspace-theme-toggle" />
          </div>
        </header>

        <div className="student-shell-content" id="student-content" tabIndex={-1}>
          <div className="page-transition" key={location.pathname}>
            {outlet}
          </div>
        </div>
      </div>
    </section>
  )
}
