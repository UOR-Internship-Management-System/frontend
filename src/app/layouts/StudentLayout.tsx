import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useOutlet } from 'react-router-dom'
import { LogoutConfirmDialog } from '../../shared/components/overlays/LogoutConfirmDialog'
import {
  NavigationDrawer,
  NavigationDrawerItem,
} from '../../shared/components/navigation/NavigationDrawer'
import { ThemeToggle } from '../../shared/components/ui/ThemeToggle'
import { useAuth } from '../../shared/hooks/useAuth'
import { StudentSidebar } from './student/StudentSidebar'
import { studentNavigation } from './student/studentNavigation'

// ── Breakpoints (M3 canonical) ────────────────────────────────────────────
// < 600px  → mobile  → NavigationBar (bottom)
// 600–1199 → tablet  → NavigationRail (80px, left)
// ≥ 1200px → desktop → NavigationDrawer (docked, left)

type Viewport = 'mobile' | 'tablet' | 'desktop'

function getViewport(): Viewport {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  if (w < 600) return 'mobile'
  if (w < 1200) return 'tablet'
  return 'desktop'
}

export function StudentLayout() {
  const auth = useAuth()
  const location = useLocation()
  const outlet = useOutlet()

  const [viewport, setViewport] = useState<Viewport>(getViewport)
  const [isExpanded, setIsExpanded] = useState(true) // desktop drawer expanded/compact toggle
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

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

  // Viewport resize listener
  useEffect(() => {
    const update = () => setViewport(getViewport())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname
      setIsMobileDrawerOpen(false)
    }
  }, [location.pathname])

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (viewport === 'mobile' && isMobileDrawerOpen) {
      document.body.classList.add('student-mobile-drawer-open')
      return () => document.body.classList.remove('student-mobile-drawer-open')
    }
    return undefined
  }, [isMobileDrawerOpen, viewport])

  // Focus first nav item when drawer opens
  useEffect(() => {
    if (!isMobileDrawerOpen) return undefined
    const frame = window.requestAnimationFrame(() => firstNavigationItemRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [isMobileDrawerOpen])

  const isMobile = viewport === 'mobile'
  const isTablet = viewport === 'tablet'
  const isDesktop = viewport === 'desktop'

  // Desktop drawer width: expanded = 280px (standard), compact = 80px (rail)
  const drawerWidth = isDesktop ? (isExpanded ? 280 : 80) : isTablet ? 80 : 0

  return (
    <div
      className="m3-app-shell"
      data-viewport={viewport}
      data-drawer-expanded={isExpanded}
    >
      <a className="m3-skip-link" href="#student-content">
        Skip to main content
      </a>

      {/* ── Side navigation (tablet: rail, desktop: drawer) ────────────── */}
      {!isMobile && (
        <div
          className="m3-app-shell__nav"
          style={{ width: drawerWidth }}
        >
          <StudentSidebar
            firstNavigationItemRef={firstNavigationItemRef}
            isExpanded={isExpanded}
            isMobileOpen={false}
            viewport={viewport}
            navigationItems={studentNavigation}
            onCloseMobile={closeMobileDrawer}
            onLogout={() => setIsLogoutConfirmOpen(true)}
            onToggleExpanded={() => setIsExpanded((v) => !v)}
            sidebarRef={sidebarRef}
            studentName={studentName}
          />
        </div>
      )}

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div className="m3-app-shell__main">

        {/* ── Top App Bar (mobile + tablet) ─────────────────────────── */}
        {!isDesktop && (
          <header className="m3-top-app-bar">
            <div className="m3-top-app-bar__leading">
              {/* Menu button – shows mobile modal drawer */}
              {isMobile && (
                <button
                  aria-controls="student-navigation-panel"
                  aria-expanded={isMobileDrawerOpen}
                  aria-label={isMobileDrawerOpen ? 'Close navigation' : 'Open navigation'}
                  className="m3-icon-button"
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
              )}
              <span className="m3-top-app-bar__title">CV Management</span>
            </div>
            <div className="m3-top-app-bar__trailing">
              <ThemeToggle />
            </div>
          </header>
        )}

        {/* ── Desktop top action bar ─────────────────────────────────── */}
        {isDesktop && (
          <header className="m3-top-app-bar m3-top-app-bar--desktop">
            <div className="m3-top-app-bar__leading" />
            <div className="m3-top-app-bar__trailing">
              <span className="m3-top-app-bar__user-chip">
                <span className="m3-top-app-bar__user-initials" aria-hidden="true">
                  {studentName.split(/\s+/).filter(Boolean).map((p) => p[0]?.toUpperCase()).join('').slice(0, 2) || 'ST'}
                </span>
                <span>{studentName}</span>
              </span>
              <ThemeToggle />
            </div>
          </header>
        )}

        {/* ── Page content ───────────────────────────────────────────── */}
        <main
          className="m3-app-shell__content"
          id="student-content"
          tabIndex={-1}
        >
          <div className="page-transition" key={location.pathname}>
            {outlet}
          </div>
        </main>

        {/* ── Bottom Navigation Bar (mobile only) ────────────────────── */}
        {isMobile && (
          <div className="m3-app-shell__bottom-nav">
            <StudentSidebar
              firstNavigationItemRef={firstNavigationItemRef}
              isExpanded={false}
              isMobileOpen={isMobileDrawerOpen}
              viewport="mobile"
              navigationItems={studentNavigation}
              onCloseMobile={closeMobileDrawer}
              onLogout={() => setIsLogoutConfirmOpen(true)}
              onToggleExpanded={() => setIsExpanded((v) => !v)}
              sidebarRef={sidebarRef}
              studentName={studentName}
            />
          </div>
        )}
      </div>

      {/* ── Mobile modal drawer ────────────────────────────────────────── */}
      {isMobile && isMobileDrawerOpen && (
        <NavigationDrawer
          aria-label="Student navigation"
          modal
          isOpen={isMobileDrawerOpen}
          onClose={() => closeMobileDrawer(true)}
          scrimTestId="student-sidebar-backdrop"
          header={
            <div className="m3-app-drawer-header">
              <div className="m3-app-drawer-brand">
                <span className="m3-app-rail-brand-mark" aria-hidden="true">CV</span>
                <span className="m3-app-rail-brand-name">CV Management</span>
              </div>
              <button
                aria-label="Close navigation"
                className="m3-app-drawer-close"
                data-student-mobile-focus
                onClick={() => closeMobileDrawer(true)}
                type="button"
              >
                <span aria-hidden="true" className="material-symbols-outlined">close</span>
              </button>
            </div>
          }
          footer={
            <div className="m3-app-drawer-footer">
              <div className="m3-app-drawer-identity">
                <span className="m3-app-rail-avatar" aria-hidden="true">
                  {studentName.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'ST'}
                </span>
                <div className="m3-app-rail-identity-copy">
                  <span>Student workspace</span>
                  <strong>{studentName}</strong>
                </div>
              </div>
              <button
                aria-label="Log Out"
                className="m3-app-drawer-logout"
                data-student-logout
                onClick={() => setIsLogoutConfirmOpen(true)}
                type="button"
              >
                <span aria-hidden="true" className="material-symbols-outlined">logout</span>
                <span>Log Out</span>
              </button>
            </div>
          }
          ref={sidebarRef}
          id="student-navigation-panel"
        >
          {studentNavigation.map((item, index) => {
            const isActive = location.pathname.startsWith(item.route)
            return (
              <NavigationDrawerItem
                key={item.route}
                as={NavLink}
                to={item.route}
                active={isActive}
                icon={
                  <span aria-hidden="true" className="material-symbols-outlined">
                    {item.icon}
                  </span>
                }
                label={item.label}
                onClick={() => closeMobileDrawer(false)}
                ref={index === 0 ? firstNavigationItemRef : undefined}
                data-student-navigation-link
              />
            )
          })}
        </NavigationDrawer>
      )}

      {isLogoutConfirmOpen ? (
        <LogoutConfirmDialog
          onClose={() => setIsLogoutConfirmOpen(false)}
          onConfirm={async () => {
            await auth.logout()
            setIsLogoutConfirmOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}
