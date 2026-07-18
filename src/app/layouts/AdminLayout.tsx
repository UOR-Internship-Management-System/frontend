import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { ThemeToggle } from '../../shared/components/ui/ThemeToggle'
import { useAuth } from '../../shared/hooks/useAuth'
import { AdminSidebar } from './admin/AdminSidebar'
import { adminNavigation } from './admin/adminNavigation'

const mobileViewportQuery = '(max-width: 899px)'
const focusableSelector =
  '[data-admin-mobile-focus], [data-admin-navigation-link], [data-admin-logout]'

function isMobileViewportNow() {
  return typeof window !== 'undefined' && window.matchMedia?.(mobileViewportQuery).matches === true
}

export function AdminLayout() {
  const auth = useAuth()
  const location = useLocation()
  const outlet = useOutlet()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(isMobileViewportNow)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const sidebarRef = useRef<HTMLElement | null>(null)
  const firstNavigationItemRef = useRef<HTMLAnchorElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const previousPathRef = useRef(location.pathname)
  const adminName = auth.currentUser?.displayName?.trim() || 'Administrator'

  const closeMobileDrawer = useCallback((restoreFocus = true) => {
    setIsMobileDrawerOpen(false)
    if (restoreFocus) window.requestAnimationFrame(() => menuButtonRef.current?.focus())
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia?.(mobileViewportQuery)
    if (!mediaQuery) return undefined
    const updateViewport = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobileViewport(event.matches)
      if (!event.matches) setIsMobileDrawerOpen(false)
    }
    updateViewport(mediaQuery)
    mediaQuery.addEventListener('change', updateViewport)
    return () => mediaQuery.removeEventListener('change', updateViewport)
  }, [])

  useEffect(() => {
    if (previousPathRef.current === location.pathname) return
    previousPathRef.current = location.pathname
    setIsMobileDrawerOpen(false)
    window.requestAnimationFrame(() => contentRef.current?.focus({ preventScroll: true }))
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileDrawerOpen) return undefined
    const frame = window.requestAnimationFrame(() => firstNavigationItemRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [isMobileDrawerOpen])

  useEffect(() => {
    if (!isMobileViewport || !isMobileDrawerOpen) return undefined
    document.body.classList.add('admin-mobile-drawer-open')
    return () => document.body.classList.remove('admin-mobile-drawer-open')
  }, [isMobileDrawerOpen, isMobileViewport])

  useEffect(() => {
    if (!isMobileDrawerOpen) return undefined
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMobileDrawer(true)
        return
      }
      if (event.key !== 'Tab' || !sidebarRef.current) return
      const items = Array.from(
        sidebarRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((item) => !item.hasAttribute('disabled'))
      const first = items[0]
      const last = items.at(-1)
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      } else if (!sidebarRef.current.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [closeMobileDrawer, isMobileDrawerOpen])

  return (
    <section
      className={`student-shell admin-shell ${isSidebarCollapsed ? 'student-shell-collapsed' : ''}`.trim()}
    >
      <a className="student-skip-link" href="#admin-content">
        Skip to admin content
      </a>
      <AdminSidebar
        adminName={adminName}
        firstNavigationItemRef={firstNavigationItemRef}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileDrawerOpen}
        isMobileViewport={isMobileViewport}
        navigationItems={adminNavigation}
        onCloseMobile={closeMobileDrawer}
        onLogout={() => void auth.logout()}
        onToggleCollapsed={() => setIsSidebarCollapsed((current) => !current)}
        sidebarRef={sidebarRef}
      />
      {isMobileDrawerOpen ? (
        <div
          aria-hidden="true"
          className="student-sidebar-backdrop"
          data-testid="admin-sidebar-backdrop"
          onClick={() => closeMobileDrawer(true)}
        />
      ) : null}
      <div className="student-shell-main">
        <header className="student-workspace-toolbar">
          <div className="student-mobile-context">
            <span>Admin workspace</span>
            <strong>{adminName}</strong>
          </div>
          <div className="student-workspace-actions">
            <button
              aria-controls="admin-navigation-panel"
              aria-expanded={isMobileDrawerOpen}
              aria-label={isMobileDrawerOpen ? 'Close admin navigation' : 'Open admin navigation'}
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
        <div
          className="student-shell-content admin-shell-content"
          id="admin-content"
          ref={contentRef}
          tabIndex={-1}
        >
          <div className="page-transition" key={location.pathname}>
            {outlet}
          </div>
        </div>
      </div>
    </section>
  )
}
