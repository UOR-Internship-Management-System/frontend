import { createRef } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { routePaths } from '../../config/routePaths'
import { studentNavigation } from './studentNavigation'
import { StudentSidebar, type StudentSidebarProps } from './StudentSidebar'

function renderSidebar(overrides: Partial<StudentSidebarProps> = {}) {
  const props: StudentSidebarProps = {
    studentName: 'Test Student',
    isExpanded: true,
    viewport: 'desktop',
    isMobileOpen: false,
    navigationItems: studentNavigation,
    sidebarRef: createRef<HTMLElement>(),
    firstNavigationItemRef: createRef<HTMLAnchorElement>(),
    onToggleExpanded: vi.fn(),
    onCloseMobile: vi.fn(),
    onLogout: vi.fn(),
    ...overrides,
  }

  render(
    <MemoryRouter initialEntries={[routePaths.studentProfile]}>
      <StudentSidebar {...props} />
    </MemoryRouter>,
  )

  return props
}

describe('StudentSidebar', () => {
  it('renders all six approved Student destinations in desktop drawer', () => {
    renderSidebar({ viewport: 'desktop' })
    const navigation = screen.getByRole('navigation', { name: 'Student navigation' })

    expect(within(navigation).getAllByRole('link')).toHaveLength(6)
    expect(within(navigation).getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      routePaths.studentDashboard,
    )
    expect(within(navigation).getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(navigation).getByRole('link', { name: 'Skills' })).toHaveAttribute(
      'href',
      routePaths.studentSkills,
    )
    expect(within(navigation).getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      routePaths.studentProjects,
    )
    expect(within(navigation).getByRole('link', { name: 'CV Builder' })).toHaveAttribute(
      'href',
      routePaths.studentCvBuilder,
    )
    expect(within(navigation).getByRole('link', { name: 'Academic Records' })).toHaveAttribute(
      'href',
      routePaths.studentAcademicRecords,
    )
  })

  it('renders a NavigationRail on tablet viewport', () => {
    renderSidebar({ viewport: 'tablet' })
    const navigation = screen.getByRole('navigation', { name: 'Student navigation' })
    expect(navigation.classList.contains('m3-navigation-rail')).toBe(true)
    expect(within(navigation).getAllByRole('link')).toHaveLength(6)
  })

  it('renders a NavigationBar on mobile viewport', () => {
    renderSidebar({ viewport: 'mobile' })
    const navigation = screen.getByRole('navigation', { name: 'Student navigation' })
    expect(navigation.classList.contains('m3-navigation-bar')).toBe(true)
  })

  it('calls onToggleExpanded when the toggle button is clicked', async () => {
    const user = userEvent.setup()
    const props = renderSidebar({ viewport: 'desktop', isExpanded: true })

    const toggleBtn = screen.getByRole('button', { name: 'Collapse navigation' })
    await user.click(toggleBtn)
    expect(props.onToggleExpanded).toHaveBeenCalledOnce()
  })

  it('calls onLogout when the logout button is clicked', async () => {
    const user = userEvent.setup()
    const props = renderSidebar({ viewport: 'desktop' })

    await user.click(screen.getByRole('button', { name: 'Log Out' }))
    expect(props.onLogout).toHaveBeenCalledOnce()
  })

  it('shows modal NavigationDrawer when isMobileOpen is true', () => {
    renderSidebar({ viewport: 'desktop', isMobileOpen: true })
    const dialog = screen.getByRole('dialog', { name: 'Student navigation' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})
