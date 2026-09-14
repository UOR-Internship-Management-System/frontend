import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useOutlet } from 'react-router-dom'
import { LogoutConfirmDialog } from '../../shared/components/overlays/LogoutConfirmDialog'
import {
  NavigationDrawer,
  NavigationDrawerItem,
} from '../../shared/components/navigation/NavigationDrawer'
import { ThemeToggle } from '../../shared/components/ui/ThemeToggle'
import { useAuth } from '../../shared/hooks/useAuth'
import { AdminSidebar } from './admin/AdminSidebar'
import { adminNavigation } from './admin/adminNavigation'

type Viewport = 'mobile' | 'tablet' | 'desktop'

function getViewport(): Viewport {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  if (w < 600) return 'mobile'
  if (w < 1200) return 'tablet'
  return 'desktop'
}

export function AdminLayout() {
  const auth = useAuth()
  const location = useLocation()
  const outlet = useOutlet()

  const [viewport, setViewport] = useState<Viewport>(getViewport)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const sidebarRef = useRef<HTMLElement | null>(null)
  const firstNavigationItemRef = useRef<HTMLAnchorElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const previousPathRef = useRef(location.pathname)
  const adminName = auth.currentUser?.displayName?.trim() || 'Administrator'

  const closeMobileDrawer = useCallback((restoreFocus = true) => {
    setIsMobileDrawerOpen(false)
    if (restoreFocus) window.requestAnimationFrame(() => menuButtonRef.current?.focus())
  }, [])

  useEffect(() => {
    const update = () => setViewport(getViewport())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (previousPathRef.current === location.pathname) return
    previousPathRef.current = location.pathname
    setIsMobileDrawerOpen(false)
    window.requestAnimationFrame(() => contentRef.current?.focus({ preventScroll: true }))
  }, [location.pathname])

  useEffect(() => {
    if (viewport === 'mobile' && isMobileDrawerOpen) {
      document.body.classList.add('admin-mobile-drawer-open')
      return () => document.body.classList.remove('admin-mobile-drawer-open')
    }
    return undefined
  }, [isMobileDrawerOpen, viewport])

  useEffect(() => {
    if (!isMobileDrawerOpen) return undefined
    const frame = window.requestAnimationFrame(() => firstNavigationItemRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [isMobileDrawerOpen])

  const isMobile = viewport === 'mobile'
  const isTablet = viewport === 'tablet'
  const isDesktop = viewport === 'desktop'
  const drawerWidth = isDesktop ? (isExpanded ? 280 : 80) : isTablet ? 80 : 0

  return (
    <div
      className="m3-app-shell m3-app-shell--admin"
      data-viewport={viewport}
      data-drawer-expanded={isExpanded}
    >
      <a className="m3-skip-link" href="#admin-content">
        Skip to main content
      </a>

      {!isMobile && (
        <div className="m3-app-shell__nav" style={{ width: drawerWidth }}>
          <AdminSidebar
            adminName={adminName}
            firstNavigationItemRef={firstNavigationItemRef}
            isExpanded={isExpanded}
            isMobileOpen={false}
            viewport={viewport}
            navigationItems={adminNavigation}
            onCloseMobile={closeMobileDrawer}
            onLogout={() => setIsLogoutConfirmOpen(true)}
            onToggleExpanded={() => setIsExpanded((v) => !v)}
            sidebarRef={sidebarRef}
          />
        </div>
      )}

      <div className="m3-app-shell__main">
        {!isDesktop && (
          <header className="m3-top-app-bar">
            <div className="m3-top-app-bar__leading">
              {isMobile && (
                <button
                  aria-controls="admin-navigation-panel"
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
              <span className="m3-top-app-bar__title">CV Management – Admin</span>
            </div>
            <div className="m3-top-app-bar__trailing">
              <ThemeToggle />
            </div>
          </header>
        )}

        {isDesktop && (
          <header className="m3-top-app-bar m3-top-app-bar--desktop">
            <div className="m3-top-app-bar__leading" />
            <div className="m3-top-app-bar__trailing">
              <span className="m3-top-app-bar__user-chip">
                <span className="m3-top-app-bar__user-initials" aria-hidden="true">
                  {adminName.split(/\s+/).filter(Boolean).map((p) => p[0]?.toUpperCase()).join('').slice(0, 2) || 'AD'}
                </span>
                <span>{adminName}</span>
              </span>
              <ThemeToggle />
            </div>
          </header>
        )}

        <main
          className="m3-app-shell__content"
          id="admin-content"
          ref={contentRef}
          tabIndex={-1}
        >
          <div className="page-transition" key={location.pathname}>
            {outlet}
          </div>
        </main>

        {isMobile && (
          <div className="m3-app-shell__bottom-nav">
            <AdminSidebar
              adminName={adminName}
              firstNavigationItemRef={firstNavigationItemRef}
              isExpanded={false}
              isMobileOpen={isMobileDrawerOpen}
              viewport="mobile"
              navigationItems={adminNavigation}
              onCloseMobile={closeMobileDrawer}
              onLogout={() => setIsLogoutConfirmOpen(true)}
              onToggleExpanded={() => setIsExpanded((v) => !v)}
              sidebarRef={sidebarRef}
            />
          </div>
        )}
      </div>

      {isMobile && isMobileDrawerOpen && (
        <NavigationDrawer
          aria-label="Admin navigation"
          modal
          isOpen={isMobileDrawerOpen}
          onClose={() => closeMobileDrawer(true)}
          scrimTestId="admin-sidebar-backdrop"
          header={
            <div className="m3-app-drawer-header">
              <div className="m3-app-drawer-brand">
                <span className="m3-app-rail-brand-mark" aria-hidden="true">CV</span>
                <span className="m3-app-rail-brand-name">CV Management</span>
              </div>
              <button
                aria-label="Close navigation"
                className="m3-app-drawer-close"
                data-admin-mobile-focus
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
                  {adminName.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'AD'}
                </span>
                <div className="m3-app-rail-identity-copy">
                  <span>Admin workspace</span>
                  <strong>{adminName}</strong>
                </div>
              </div>
              <button
                aria-label="Log Out"
                className="m3-app-drawer-logout"
                data-admin-logout
                onClick={() => setIsLogoutConfirmOpen(true)}
                type="button"
              >
                <span aria-hidden="true" className="material-symbols-outlined">logout</span>
                <span>Log Out</span>
              </button>
            </div>
          }
          ref={sidebarRef}
          id="admin-navigation-panel"
        >
          {adminNavigation.map((item, index) => {
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
                data-admin-navigation-link
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
