import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  TopAppBar,
  BottomAppBar,
  NavigationBar,
  NavigationBarItem,
  NavigationRail,
  NavigationRailItem,
  NavigationDrawer,
  NavigationDrawerItem,
  NavigationDrawerSectionHeader,
  Tabs,
  Toolbar,
  ToolbarGroup,
  ToolbarDivider,
  ButtonShowcase,
} from './index'

describe('Tier 7: Navigation & App Framing', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.style.overflow = ''
  })

  describe('TopAppBar (M3 Expressive)', () => {
    it('renders small variant with title, leading action, and trailing actions', () => {
      render(
        <TopAppBar
          title="Student Dashboard"
          leading={<button type="button">Menu</button>}
          actions={<button type="button">Profile</button>}
          variant="small"
        />,
      )

      expect(screen.getByRole('heading', { name: 'Student Dashboard' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument()
      expect(screen.getByRole('banner')).toHaveClass('m3-top-app-bar--small')
    })

    it('supports center, medium, and large variants and scroll tint', () => {
      const { rerender } = render(
        <TopAppBar title="Centered Title" variant="center" isScrolled={true} />,
      )

      const header = screen.getByRole('banner')
      expect(header).toHaveClass('m3-top-app-bar--center', 'm3-top-app-bar--scrolled')

      rerender(<TopAppBar title="Large Headline" variant="large" isScrolled={false} />)
      expect(header).toHaveClass('m3-top-app-bar--large')
      expect(header).not.toHaveClass('m3-top-app-bar--scrolled')
    })
  })

  describe('BottomAppBar (M3 Expressive)', () => {
    it('renders action buttons and FAB slot', () => {
      render(
        <BottomAppBar fab={<button type="button">FAB Action</button>}>
          <button type="button">Action 1</button>
          <button type="button">Action 2</button>
        </BottomAppBar>,
      )

      expect(screen.getByRole('contentinfo')).toHaveClass('m3-bottom-app-bar')
      expect(screen.getByRole('button', { name: 'FAB Action' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument()
    })
  })

  describe('NavigationBar (Mobile Bottom Nav)', () => {
    it('renders navigation items with active pills, labels, and badges', async () => {
      const user = userEvent.setup()
      const onNavigate = vi.fn()

      render(
        <NavigationBar aria-label="Main Mobile Navigation">
          <NavigationBarItem
            icon={<span>home</span>}
            label="Home"
            active={true}
            onClick={() => onNavigate('home')}
          />
          <NavigationBarItem
            icon={<span>work</span>}
            label="Internships"
            badge={<span>3</span>}
            onClick={() => onNavigate('internships')}
          />
        </NavigationBar>,
      )

      const nav = screen.getByRole('navigation', { name: 'Main Mobile Navigation' })
      expect(nav).toHaveClass('m3-navigation-bar')

      const homeItem = screen.getByRole('button', { name: 'Home' })
      expect(homeItem).toHaveAttribute('aria-current', 'page')
      expect(homeItem).toHaveClass('m3-navigation-bar__item--active')

      const internshipsItem = screen.getByRole('button', { name: 'Internships' })
      expect(internshipsItem).not.toHaveAttribute('aria-current')
      expect(screen.getByText('3')).toBeInTheDocument()

      await user.click(internshipsItem)
      expect(onNavigate).toHaveBeenCalledWith('internships')
    })
  })

  describe('NavigationRail (Desktop Vertical Nav)', () => {
    it('renders compact and expanded vertical rail with active indicator', () => {
      const { rerender } = render(
        <NavigationRail
          header={<button type="button">Logo</button>}
          footer={<button type="button">Settings</button>}
          aria-label="Desktop Rail"
        >
          <NavigationRailItem icon={<span>dashboard</span>} label="Overview" active />
          <NavigationRailItem icon={<span>school</span>} label="Academics" />
        </NavigationRail>,
      )

      const rail = screen.getByRole('navigation', { name: 'Desktop Rail' })
      expect(rail).toHaveClass('m3-navigation-rail')
      expect(rail).not.toHaveClass('m3-navigation-rail--expanded')

      expect(screen.getByRole('button', { name: 'Overview' })).toHaveAttribute(
        'aria-current',
        'page',
      )

      rerender(
        <NavigationRail expanded aria-label="Desktop Rail">
          <NavigationRailItem icon={<span>dashboard</span>} label="Overview" active />
        </NavigationRail>,
      )
      expect(rail).toHaveClass('m3-navigation-rail--expanded')
    })
  })

  describe('NavigationDrawer (Standard & Modal)', () => {
    it('renders standard drawer with section headers and items', () => {
      render(
        <NavigationDrawer header={<h2>App Menu</h2>} aria-label="Main Menu">
          <NavigationDrawerSectionHeader>Records</NavigationDrawerSectionHeader>
          <NavigationDrawerItem
            icon={<span>description</span>}
            label="Official Transcripts"
            active
          />
          <NavigationDrawerItem
            icon={<span>badge</span>}
            label="Student IDs"
            badge={<span>New</span>}
          />
        </NavigationDrawer>,
      )

      const drawer = screen.getByRole('navigation', { name: 'Main Menu' })
      expect(drawer).toHaveClass('m3-navigation-drawer', 'm3-navigation-drawer--standard')
      expect(screen.getByText('Records')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Official Transcripts' })).toHaveAttribute(
        'aria-current',
        'page',
      )
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('renders modal drawer with scrim and closes on Escape', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(
        <NavigationDrawer modal isOpen onClose={onClose} aria-label="Modal Navigation">
          <NavigationDrawerItem icon={<span>close</span>} label="Close Drawer" />
        </NavigationDrawer>,
      )

      const drawer = screen.getByRole('dialog', { name: 'Modal Navigation' })
      expect(drawer).toHaveClass('m3-navigation-drawer--modal')

      await user.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Tabs (Primary and Secondary)', () => {
    function TabsHarness() {
      const [active, setActive] = useState('tab-1')
      return (
        <Tabs
          activeId={active}
          onChange={setActive}
          aria-label="Profile Tabs"
          tabs={[
            { id: 'tab-1', label: 'General Info' },
            { id: 'tab-2', label: 'Education' },
            { id: 'tab-3', label: 'Projects' },
          ]}
        />
      )
    }

    it('renders tabs with active indicators and navigates with arrow keys', async () => {
      const user = userEvent.setup()
      render(<TabsHarness />)

      const tab1 = screen.getByRole('tab', { name: 'General Info' })
      const tab2 = screen.getByRole('tab', { name: 'Education' })
      const tab3 = screen.getByRole('tab', { name: 'Projects' })

      expect(tab1).toHaveAttribute('aria-selected', 'true')
      expect(tab2).toHaveAttribute('aria-selected', 'false')

      tab1.focus()
      expect(tab1).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      expect(tab2).toHaveFocus()
      expect(tab2).toHaveAttribute('aria-selected', 'true')

      await user.keyboard('{ArrowRight}')
      expect(tab3).toHaveFocus()
      expect(tab3).toHaveAttribute('aria-selected', 'true')

      await user.keyboard('{Home}')
      expect(tab1).toHaveFocus()
      expect(tab1).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('Toolbar (M3 Expressive)', () => {
    it('renders toolbar with groups and dividers', () => {
      render(
        <Toolbar variant="floating" aria-label="Document Toolbar">
          <ToolbarGroup>
            <button type="button">Bold</button>
            <button type="button">Italic</button>
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <button type="button">Link</button>
          </ToolbarGroup>
        </Toolbar>,
      )

      const toolbar = screen.getByRole('toolbar', { name: 'Document Toolbar' })
      expect(toolbar).toHaveClass('m3-toolbar', 'm3-toolbar--floating')
      expect(screen.getByRole('separator')).toHaveClass('m3-toolbar__divider')
    })
  })

  describe('ButtonShowcase (37th Component: all-buttons)', () => {
    it('renders full interactive button testbed without runtime errors', () => {
      render(<ButtonShowcase />)

      expect(screen.getByTestId('m3-button-showcase')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Filled Button' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Danger Button' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Extra Large (xl)' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send Application' })).toBeInTheDocument()
    })
  })
})
