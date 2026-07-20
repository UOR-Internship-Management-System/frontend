import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext, AuthContextValue, AuthState } from '../../providers/AuthProvider'
import type { CurrentUser } from '../../../shared/auth/authTypes'
import { RequireAdmin, RequireStudent } from '../routeGuards'

const studentUser: CurrentUser = {
  userId: 'student-user-1',
  accountId: 'student-account-1',
  email: 'student@dcs.ruh.ac.lk',
  displayName: 'Student User',
  roles: ['STUDENT'],
  primaryRole: 'STUDENT',
}

const adminUser: CurrentUser = {
  userId: 'admin-user-1',
  accountId: 'admin-account-1',
  email: 'admin@dcs.ruh.ac.lk',
  displayName: 'Admin User',
  roles: ['ADMIN'],
  primaryRole: 'ADMIN',
}

const MockAuthContext = ({ value, children }: { value: AuthState; children: React.ReactNode }) => {
  const roles = value.currentUser?.roles ?? []
  const primaryRole = value.currentUser?.primaryRole ?? null
  const contextValue: AuthContextValue = {
    ...value,
    isAuthenticated: value.status === 'authenticated',
    roles,
    primaryRole,
    role: primaryRole,
    userId: value.currentUser?.userId ?? null,
    signInWithToken: vi.fn(),
    refreshCurrentUser: vi.fn(),
    logout: vi.fn(),
  }
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

const ProtectedStudent = () => <div>Student Dashboard</div>
const ProtectedAdmin = () => <div>Admin Dashboard</div>
const LoginStudent = () => <div>Student Login</div>
const LoginAdmin = () => <div>Admin Login</div>
const Unauthorized = () => <div>Unauthorized</div>

const renderWithRouterAndAuth = (
  authValue: AuthState,
  initialRoute: string,
  element: React.ReactNode,
  path: string,
) => {
  return render(
    <MockAuthContext value={authValue}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path={path} element={element} />
          <Route path="/student/login" element={<LoginStudent />} />
          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </MemoryRouter>
    </MockAuthContext>,
  )
}

describe('Route Guards', () => {
  describe('RequireStudent', () => {
    it('redirects anonymous user to student login', () => {
      renderWithRouterAndAuth(
        { status: 'anonymous', currentUser: null },
        '/student/dashboard',
        <RequireStudent>
          <ProtectedStudent />
        </RequireStudent>,
        '/student/dashboard',
      )
      expect(screen.getByText('Student Login')).toBeInTheDocument()
      expect(screen.queryByText('Student Dashboard')).not.toBeInTheDocument()
    })

    it('renders protected content for student role', () => {
      renderWithRouterAndAuth(
        { status: 'authenticated', currentUser: studentUser },
        '/student/dashboard',
        <RequireStudent>
          <ProtectedStudent />
        </RequireStudent>,
        '/student/dashboard',
      )
      expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
    })

    it('redirects admin role to unauthorized page', () => {
      renderWithRouterAndAuth(
        { status: 'authenticated', currentUser: adminUser },
        '/student/dashboard',
        <RequireStudent>
          <ProtectedStudent />
        </RequireStudent>,
        '/student/dashboard',
      )
      expect(screen.getByText('Unauthorized')).toBeInTheDocument()
      expect(screen.queryByText('Student Dashboard')).not.toBeInTheDocument()
    })

    it.each(['/student/cv-builder', '/student/academic-records'])(
      'prevents an Admin from using the Student route %s',
      (path) => {
        renderWithRouterAndAuth(
          { status: 'authenticated', currentUser: adminUser },
          path,
          <RequireStudent>
            <ProtectedStudent />
          </RequireStudent>,
          path,
        )
        expect(screen.getByText('Unauthorized')).toBeInTheDocument()
        expect(screen.queryByText('Student Dashboard')).not.toBeInTheDocument()
      },
    )
  })

  describe('RequireAdmin', () => {
    it('redirects anonymous user to admin login', () => {
      renderWithRouterAndAuth(
        { status: 'anonymous', currentUser: null },
        '/admin/dashboard',
        <RequireAdmin>
          <ProtectedAdmin />
        </RequireAdmin>,
        '/admin/dashboard',
      )
      expect(screen.getByText('Admin Login')).toBeInTheDocument()
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument()
    })

    it('renders protected content for admin role', () => {
      renderWithRouterAndAuth(
        { status: 'authenticated', currentUser: adminUser },
        '/admin/dashboard',
        <RequireAdmin>
          <ProtectedAdmin />
        </RequireAdmin>,
        '/admin/dashboard',
      )
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })

    it('redirects student role to unauthorized page', () => {
      renderWithRouterAndAuth(
        { status: 'authenticated', currentUser: studentUser },
        '/admin/dashboard',
        <RequireAdmin>
          <ProtectedAdmin />
        </RequireAdmin>,
        '/admin/dashboard',
      )
      expect(screen.getByText('Unauthorized')).toBeInTheDocument()
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument()
    })

    it('denies the Student role access to an Admin Student Deep-Dive route', () => {
      const path = '/admin/students/11111111-1111-4111-8111-111111111111'
      renderWithRouterAndAuth(
        { status: 'authenticated', currentUser: studentUser },
        path,
        <RequireAdmin>
          <div>Student Deep-Dive</div>
        </RequireAdmin>,
        path,
      )
      expect(screen.getByText('Unauthorized')).toBeInTheDocument()
      expect(screen.queryByText('Student Deep-Dive')).not.toBeInTheDocument()
    })

    it('denies the Student role access to Internship Management', () => {
      const path = '/admin/internships'
      renderWithRouterAndAuth(
        { status: 'authenticated', currentUser: studentUser },
        path,
        <RequireAdmin>
          <div>Internship Management</div>
        </RequireAdmin>,
        path,
      )
      expect(screen.getByText('Unauthorized')).toBeInTheDocument()
      expect(screen.queryByText('Internship Management')).not.toBeInTheDocument()
    })

    it('shows a recoverable session verification state without redirecting', () => {
      renderWithRouterAndAuth(
        {
          status: 'error',
          currentUser: null,
          sessionError: { message: 'Session verification is temporarily unavailable.' },
        },
        '/admin/dashboard',
        <RequireAdmin>
          <ProtectedAdmin />
        </RequireAdmin>,
        '/admin/dashboard',
      )

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Session verification is temporarily unavailable.',
      )
      expect(screen.queryByText('Admin Login')).not.toBeInTheDocument()
    })
  })
})
