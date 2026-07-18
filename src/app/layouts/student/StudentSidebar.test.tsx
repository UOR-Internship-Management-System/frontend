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
    isCollapsed: false,
    isMobileViewport: false,
    isMobileOpen: false,
    navigationItems: studentNavigation,
    sidebarRef: createRef<HTMLElement>(),
    firstNavigationItemRef: createRef<HTMLAnchorElement>(),
    onToggleCollapsed: vi.fn(),
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
  it('renders all six approved Student destinations', () => {
    renderSidebar()
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

  it('keeps icon controls accessible in the collapsed rail', async () => {
    const user = userEvent.setup()
    const props = renderSidebar({ isCollapsed: true })

    expect(screen.getByRole('button', { name: 'Expand student sidebar' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('title', 'Dashboard')
    expect(screen.getByRole('button', { name: 'Log Out' })).toHaveAttribute('title', 'Log Out')

    await user.click(screen.getByRole('button', { name: 'Expand student sidebar' }))
    await user.click(screen.getByRole('button', { name: 'Log Out' }))

    expect(props.onToggleCollapsed).toHaveBeenCalledOnce()
    expect(props.onLogout).toHaveBeenCalledOnce()
  })

  it('uses modal semantics only for an open mobile drawer', () => {
    const { rerender } = render(
      <MemoryRouter>
        <StudentSidebar
          firstNavigationItemRef={createRef<HTMLAnchorElement>()}
          isCollapsed={false}
          isMobileOpen={false}
          isMobileViewport
          navigationItems={studentNavigation}
          onCloseMobile={vi.fn()}
          onLogout={vi.fn()}
          onToggleCollapsed={vi.fn()}
          sidebarRef={createRef<HTMLElement>()}
          studentName={null}
        />
      </MemoryRouter>,
    )

    const sidebar = screen.getByLabelText('Student workspace', { selector: 'aside' })
    expect(sidebar).toHaveAttribute('aria-hidden', 'true')
    expect(sidebar).toHaveAttribute('inert')
    expect(screen.getByText('Student', { selector: 'strong' })).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <StudentSidebar
          firstNavigationItemRef={createRef<HTMLAnchorElement>()}
          isCollapsed={false}
          isMobileOpen
          isMobileViewport
          navigationItems={studentNavigation}
          onCloseMobile={vi.fn()}
          onLogout={vi.fn()}
          onToggleCollapsed={vi.fn()}
          sidebarRef={createRef<HTMLElement>()}
          studentName={null}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('dialog', { name: 'Student workspace' })).toHaveAttribute(
      'aria-modal',
      'true',
    )
  })
})
