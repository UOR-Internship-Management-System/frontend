import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { routePaths } from '../config/routePaths'
import { useAuth } from '../../shared/hooks/useAuth'

type RoleGuardProps = PropsWithChildren<{
  role: 'STUDENT' | 'ADMIN'
}>

export function RequireRole({ children, role }: RoleGuardProps) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'anonymous') {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to={role === 'STUDENT' ? routePaths.studentLogin : routePaths.adminLogin}
      />
    )
  }

  if (auth.role !== role) {
    return <Navigate replace to={routePaths.unauthorized} />
  }

  return children
}

export function RequireStudent({ children }: PropsWithChildren) {
  return <RequireRole role="STUDENT">{children}</RequireRole>
}

export function RequireAdmin({ children }: PropsWithChildren) {
  return <RequireRole role="ADMIN">{children}</RequireRole>
}
