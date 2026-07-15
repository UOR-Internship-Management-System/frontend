import type { RefObject } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '../../../shared/components/ui/Button'
import type { StudentNavigationItem } from './studentNavigation'

export type StudentSidebarProps = {
  studentName?: string | null
  isCollapsed: boolean
  isMobileViewport: boolean
  isMobileOpen: boolean
  navigationItems: readonly StudentNavigationItem[]
  sidebarRef: RefObject<HTMLElement | null>
  firstNavigationItemRef: RefObject<HTMLAnchorElement | null>
  onToggleCollapsed: () => void
  onCloseMobile: (restoreFocus?: boolean) => void
  onLogout: () => void
}

function displayNameFor(studentName?: string | null) {
  return studentName?.trim() || 'Student'
}

function initialsFor(studentName: string) {
  const initials = studentName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'ST'
}

export function StudentSidebar({
  firstNavigationItemRef,
  isCollapsed,
  isMobileOpen,
  isMobileViewport,
  navigationItems,
  onCloseMobile,
  onLogout,
  onToggleCollapsed,
  sidebarRef,
  studentName,
}: StudentSidebarProps) {
  const displayName = displayNameFor(studentName)
  const isModal = isMobileViewport && isMobileOpen
  const isInactiveMobileDrawer = isMobileViewport && !isMobileOpen

  return (
    <aside
      aria-hidden={isInactiveMobileDrawer || undefined}
      aria-label="Student workspace"
      aria-modal={isModal || undefined}
      className={`student-sidebar ${isCollapsed ? 'student-sidebar-collapsed' : ''} ${isMobileOpen ? 'student-sidebar-mobile-open' : ''}`.trim()}
      id="student-navigation-panel"
      inert={isInactiveMobileDrawer || undefined}
      ref={sidebarRef}
      role={isModal ? 'dialog' : undefined}
    >
      <div className="student-sidebar-header">
        <div className="student-sidebar-brand">
          <span aria-hidden="true" className="student-sidebar-brand-mark">
            CV
          </span>
          <span className="student-sidebar-collapsible-label">CV Management</span>
        </div>

        <button
          aria-controls="student-navigation-panel"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand student sidebar' : 'Collapse student sidebar'}
          className="student-sidebar-icon-button student-sidebar-toggle"
          onClick={onToggleCollapsed}
          title={isCollapsed ? 'Expand student sidebar' : 'Collapse student sidebar'}
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        <button
          aria-label="Close student navigation"
          className="student-sidebar-icon-button student-sidebar-mobile-close"
          data-student-mobile-focus
          onClick={() => onCloseMobile(true)}
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined">
            close
          </span>
        </button>
      </div>

      <div className="student-sidebar-identity">
        <span aria-hidden="true" className="student-sidebar-avatar">
          {initialsFor(displayName)}
        </span>
        <div className="student-sidebar-collapsible-label student-sidebar-identity-copy">
          <span>Student workspace</span>
          <strong>{displayName}</strong>
        </div>
      </div>

      <nav aria-label="Student navigation" className="student-sidebar-nav">
        <ul className="student-sidebar-list">
          {navigationItems.map((item, index) => (
            <li key={item.route}>
              <NavLink
                aria-label={item.label}
                className={({ isActive }) =>
                  `student-sidebar-item ${isActive ? 'student-sidebar-item-selected' : ''}`.trim()
                }
                data-student-navigation-link
                data-tooltip={item.label}
                onClick={() => onCloseMobile(false)}
                ref={index === 0 ? firstNavigationItemRef : undefined}
                title={isCollapsed ? item.label : undefined}
                to={item.route}
              >
                <span aria-hidden="true" className="material-symbols-outlined student-sidebar-icon">
                  {item.icon}
                </span>
                <span className="student-sidebar-collapsible-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Button
        aria-label="Log Out"
        className="student-sidebar-logout"
        data-tooltip="Log Out"
        data-student-logout
        icon={
          <span aria-hidden="true" className="material-symbols-outlined student-sidebar-icon">
            logout
          </span>
        }
        onClick={onLogout}
        title={isCollapsed ? 'Log Out' : undefined}
        variant="secondary"
      >
        <span className="student-sidebar-collapsible-label">Log Out</span>
      </Button>
    </aside>
  )
}
