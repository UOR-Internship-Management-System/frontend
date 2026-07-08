import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthContext, AuthState, AuthContextValue } from '../../providers/AuthProvider'
import { RequireAdmin, RequireStudent } from '../routeGuards'

const MockAuthContext = ({ value, children }: { value: AuthState; children: React.ReactNode }) => {
  const contextValue: AuthContextValue = {
    ...value,
    setFoundationRole: () => {},
    clearFoundationAuth: () => {},
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
        { status: 'anonymous', role: null, userId: null },
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
        { status: 'authenticated', role: 'STUDENT', userId: 'user-1' },
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
        { status: 'authenticated', role: 'ADMIN', userId: 'user-1' },
        '/student/dashboard',
        <RequireStudent>
          <ProtectedStudent />
        </RequireStudent>,
        '/student/dashboard',
      )
      expect(screen.getByText('Unauthorized')).toBeInTheDocument()
      expect(screen.queryByText('Student Dashboard')).not.toBeInTheDocument()
    })
  })

  describe('RequireAdmin', () => {
    it('redirects anonymous user to admin login', () => {
      renderWithRouterAndAuth(
        { status: 'anonymous', role: null, userId: null },
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
        { status: 'authenticated', role: 'ADMIN', userId: 'user-1' },
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
        { status: 'authenticated', role: 'STUDENT', userId: 'user-1' },
        '/admin/dashboard',
        <RequireAdmin>
          <ProtectedAdmin />
        </RequireAdmin>,
        '/admin/dashboard',
      )
      expect(screen.getByText('Unauthorized')).toBeInTheDocument()
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument()
    })
  })
})
