import type { RefObject } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  NavigationBar,
  NavigationBarItem,
} from '../../../shared/components/navigation/NavigationBar'
import {
  NavigationDrawer,
  NavigationDrawerItem,
} from '../../../shared/components/navigation/NavigationDrawer'
import {
  NavigationRail,
  NavigationRailItem,
} from '../../../shared/components/navigation/NavigationRail'
import type { AdminNavigationItem } from './adminNavigation'

export type AdminSidebarProps = {
  adminName: string
  isExpanded: boolean
  isMobileOpen: boolean
  viewport: 'mobile' | 'tablet' | 'desktop'
  navigationItems: readonly AdminNavigationItem[]
  sidebarRef: RefObject<HTMLElement | null>
  firstNavigationItemRef: RefObject<HTMLAnchorElement | null>
  onToggleExpanded: () => void
  onCloseMobile: (restoreFocus?: boolean) => void
  onLogout: () => void
}

function initialsFor(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'AD'
  )
}

function NavIcon({ icon }: { icon: string }) {
  return (
    <span aria-hidden="true" className="material-symbols-outlined">
      {icon}
    </span>
  )
}

function DrawerHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="m3-app-drawer-header">
      <div className="m3-app-drawer-brand">
        <span className="m3-app-rail-brand-mark" aria-hidden="true">
          CV
        </span>
        <span className="m3-app-rail-brand-name">CV Management</span>
      </div>
      <button
        aria-label="Close navigation"
        className="m3-app-drawer-close"
        data-admin-mobile-focus
        onClick={onClose}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          close
        </span>
      </button>
    </div>
  )
}

export function AdminSidebar({
  adminName,
  firstNavigationItemRef,
  isExpanded,
  isMobileOpen,
  viewport,
  navigationItems,
  onCloseMobile,
  onLogout,
  onToggleExpanded,
  sidebarRef,
}: AdminSidebarProps) {
  const location = useLocation()
  const initials = initialsFor(adminName)

  // ── MOBILE: Bottom Navigation Bar ────────────────────────────────────────
  if (viewport === 'mobile') {
    return (
      <NavigationBar aria-label="Admin navigation">
        {navigationItems.slice(0, 5).map((item, index) => {
          const isActive = location.pathname.startsWith(item.route)
          return (
            <NavigationBarItem
              key={item.route}
              as={NavLink}
              to={item.route}
              active={isActive}
              icon={<NavIcon icon={item.icon} />}
              label={item.label}
              ref={index === 0 ? firstNavigationItemRef : undefined}
              data-admin-navigation-link
            />
          )
        })}
      </NavigationBar>
    )
  }

  // ── TABLET: Navigation Rail (compact 80px) ────────────────────────────────
  if (viewport === 'tablet') {
    return (
      <NavigationRail
        aria-label="Admin navigation"
        expanded={false}
        header={
          <div className="m3-app-rail-header">
            <span className="m3-app-rail-brand-mark" aria-hidden="true">
              CV
            </span>
            <button
              aria-label="Open full navigation"
              className="m3-app-rail-toggle"
              onClick={onToggleExpanded}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                menu
              </span>
            </button>
          </div>
        }
        footer={
          <div className="m3-app-rail-footer">
            <span className="m3-app-rail-avatar" aria-hidden="true" title={adminName}>
              {initials}
            </span>
            <button
              aria-label="Log Out"
              className="m3-app-rail-logout"
              data-admin-logout
              onClick={onLogout}
              title="Log Out"
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                logout
              </span>
            </button>
          </div>
        }
        ref={sidebarRef}
      >
        {navigationItems.map((item, index) => {
          const isActive = location.pathname.startsWith(item.route)
          return (
            <NavigationRailItem
              key={item.route}
              as={NavLink}
              to={item.route}
              active={isActive}
              icon={<NavIcon icon={item.icon} />}
              label={item.label}
              ref={index === 0 ? firstNavigationItemRef : undefined}
              data-admin-navigation-link
            />
          )
        })}
      </NavigationRail>
    )
  }

  // ── DESKTOP: Standard Navigation Drawer ──────────────────────────────────
  return (
    <>
      <NavigationDrawer
        aria-label="Admin navigation"
        modal={false}
        header={
          <div className="m3-app-drawer-header-desktop">
            <div className="m3-app-drawer-brand">
              <span className="m3-app-rail-brand-mark" aria-hidden="true">
                CV
              </span>
              <span className="m3-app-rail-brand-name">CV Management</span>
            </div>
            <button
              aria-label={isExpanded ? 'Collapse navigation' : 'Expand navigation'}
              className="m3-app-rail-toggle"
              onClick={onToggleExpanded}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                {isExpanded ? 'menu_open' : 'menu'}
              </span>
            </button>
          </div>
        }
        footer={
          <div className="m3-app-drawer-footer">
            <div className="m3-app-drawer-identity">
              <span className="m3-app-rail-avatar" aria-hidden="true">
                {initials}
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
              onClick={onLogout}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                logout
              </span>
              <span>Log Out</span>
            </button>
          </div>
        }
        className={isExpanded ? '' : 'm3-navigation-drawer--compact'}
        ref={sidebarRef}
        id="admin-navigation-panel"
      >
        {navigationItems.map((item, index) => {
          const isActive = location.pathname.startsWith(item.route)
          return (
            <NavigationDrawerItem
              key={item.route}
              as={NavLink}
              to={item.route}
              active={isActive}
              icon={<NavIcon icon={item.icon} />}
              label={item.label}
              ref={index === 0 ? firstNavigationItemRef : undefined}
              data-admin-navigation-link
            />
          )
        })}
      </NavigationDrawer>

      {isMobileOpen && (
        <NavigationDrawer
          aria-label="Admin navigation"
          modal
          isOpen={isMobileOpen}
          onClose={() => onCloseMobile(true)}
          header={<DrawerHeader onClose={() => onCloseMobile(true)} />}
          footer={
            <div className="m3-app-drawer-footer">
              <div className="m3-app-drawer-identity">
                <span className="m3-app-rail-avatar" aria-hidden="true">
                  {initials}
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
                onClick={onLogout}
                type="button"
              >
                <span aria-hidden="true" className="material-symbols-outlined">
                  logout
                </span>
                <span>Log Out</span>
              </button>
            </div>
          }
          scrimTestId="admin-sidebar-backdrop"
          ref={sidebarRef}
          id="admin-navigation-panel"
        >
          {navigationItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.route)
            return (
              <NavigationDrawerItem
                key={item.route}
                as={NavLink}
                to={item.route}
                active={isActive}
                icon={<NavIcon icon={item.icon} />}
                label={item.label}
                onClick={() => onCloseMobile(false)}
                ref={index === 0 ? firstNavigationItemRef : undefined}
                data-admin-navigation-link
              />
            )
          })}
        </NavigationDrawer>
      )}
    </>
  )
}
