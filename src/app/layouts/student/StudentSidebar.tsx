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
import type { StudentNavigationItem } from './studentNavigation'

export type StudentSidebarProps = {
  studentName?: string | null
  isExpanded: boolean
  isMobileOpen: boolean
  viewport: 'mobile' | 'tablet' | 'desktop'
  navigationItems: readonly StudentNavigationItem[]
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
      .join('') || 'ST'
  )
}

function displayNameFor(studentName?: string | null) {
  return studentName?.trim() || 'Student'
}

/** Icon element for a nav item */
function NavIcon({ icon }: { icon: string }) {
  return (
    <span aria-hidden="true" className="material-symbols-outlined">
      {icon}
    </span>
  )
}

/** Rail header: brand + toggle button */
function RailHeader({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="m3-app-rail-header">
      {isExpanded ? (
        <div className="m3-app-rail-brand">
          <span className="m3-app-rail-brand-mark" aria-hidden="true">
            CV
          </span>
          <span className="m3-app-rail-brand-name">CV Management</span>
        </div>
      ) : (
        <span className="m3-app-rail-brand-mark" aria-hidden="true">
          CV
        </span>
      )}
      <button
        aria-label={isExpanded ? 'Collapse navigation' : 'Expand navigation'}
        className="m3-app-rail-toggle"
        onClick={onToggle}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          {isExpanded ? 'menu_open' : 'menu'}
        </span>
      </button>
    </div>
  )
}

/** Rail footer: user avatar + logout */
function RailFooter({
  studentName,
  isExpanded,
  onLogout,
}: {
  studentName: string
  isExpanded: boolean
  onLogout: () => void
}) {
  const initials = initialsFor(studentName)
  return (
    <div className="m3-app-rail-footer">
      {isExpanded && (
        <div className="m3-app-rail-identity">
          <span className="m3-app-rail-avatar" aria-hidden="true">
            {initials}
          </span>
          <div className="m3-app-rail-identity-copy">
            <span>Student workspace</span>
            <strong>{studentName}</strong>
          </div>
        </div>
      )}
      {!isExpanded && (
        <span className="m3-app-rail-avatar" aria-hidden="true" title={studentName}>
          {initials}
        </span>
      )}
      <button
        aria-label="Log Out"
        className="m3-app-rail-logout"
        data-student-logout
        onClick={onLogout}
        title="Log Out"
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          logout
        </span>
        {isExpanded && <span className="m3-app-rail-logout-label">Log Out</span>}
      </button>
    </div>
  )
}

/** Drawer header: brand + close button */
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
        data-student-mobile-focus
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

/** Drawer footer: user info + logout */
function DrawerFooter({ studentName, onLogout }: { studentName: string; onLogout: () => void }) {
  const initials = initialsFor(studentName)
  return (
    <div className="m3-app-drawer-footer">
      <div className="m3-app-drawer-identity">
        <span className="m3-app-rail-avatar" aria-hidden="true">
          {initials}
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
        onClick={onLogout}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          logout
        </span>
        <span>Log Out</span>
      </button>
    </div>
  )
}

export function StudentSidebar({
  firstNavigationItemRef,
  isExpanded,
  isMobileOpen,
  viewport,
  navigationItems,
  onCloseMobile,
  onLogout,
  onToggleExpanded,
  sidebarRef,
  studentName,
}: StudentSidebarProps) {
  const location = useLocation()
  const displayName = displayNameFor(studentName)

  // ── MOBILE: Bottom Navigation Bar ────────────────────────────────────────
  if (viewport === 'mobile') {
    return (
      <NavigationBar aria-label="Student navigation">
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
              data-student-navigation-link
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
        aria-label="Student navigation"
        expanded={false}
        header={<RailHeader isExpanded={false} onToggle={onToggleExpanded} />}
        footer={<RailFooter studentName={displayName} isExpanded={false} onLogout={onLogout} />}
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
              data-student-navigation-link
            />
          )
        })}
      </NavigationRail>
    )
  }

  // ── DESKTOP: Standard Navigation Drawer (docked, expanded or compact) ────
  return (
    <>
      <NavigationDrawer
        aria-label="Student navigation"
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
                {initialsFor(displayName)}
              </span>
              <div className="m3-app-rail-identity-copy">
                <span>Student workspace</span>
                <strong>{displayName}</strong>
              </div>
            </div>
            <button
              aria-label="Log Out"
              className="m3-app-drawer-logout"
              data-student-logout
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
        id="student-navigation-panel"
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
              data-student-navigation-link
            />
          )
        })}
      </NavigationDrawer>

      {/* Modal drawer overlay for mobile (triggered by top bar menu button) */}
      {isMobileOpen && (
        <NavigationDrawer
          aria-label="Student navigation"
          modal
          isOpen={isMobileOpen}
          onClose={() => onCloseMobile(true)}
          header={<DrawerHeader onClose={() => onCloseMobile(true)} />}
          footer={<DrawerFooter studentName={displayName} onLogout={onLogout} />}
          scrimTestId="student-sidebar-backdrop"
          ref={sidebarRef}
          id="student-navigation-panel"
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
                data-student-navigation-link
              />
            )
          })}
        </NavigationDrawer>
      )}
    </>
  )
}
