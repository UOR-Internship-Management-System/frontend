import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { routePaths } from '../config/routePaths'
import { useAuth } from '../../shared/hooks/useAuth'
import { authStorage } from '../../shared/auth/authStorage'
import type { AuthRole } from '../../shared/auth/authTypes'
import { getDashboardPathForRole, getLoginPathForRole } from '../../shared/auth/redirects'
import { SkeletonShape, SkeletonStatusRegion } from '../../shared/skeletons'
import { ErrorState } from '../../shared/components/feedback/ErrorState'

function SessionCheckSkeleton() {
  return (
    <div className="route-skeleton route-skeleton-session">
      <SkeletonStatusRegion className="session-skeleton-card" label="Verifying your session">
        <SkeletonShape height={40} radius="circle" width={40} />
        <SkeletonShape height={16} width={160} />
      </SkeletonStatusRegion>
    </div>
  )
}

type RoleGuardProps = PropsWithChildren<{
  role: AuthRole
}>

type ResetContextGuardProps = PropsWithChildren<{
  accountType: AuthRole
  requireVerified?: boolean
  redirectTo: string
}>

export function PublicOnlyRoute({ children }: PropsWithChildren) {
  const auth = useAuth()

  if (auth.status === 'loading') {
    return <SessionCheckSkeleton />
  }

  if (auth.status === 'error' && !auth.currentUser) {
    return (
      <ErrorState
        correlationId={auth.sessionError?.correlationId}
        message={
          auth.sessionError?.message ??
          'We could not verify your session right now. Your session has been preserved.'
        }
        onAction={() => void auth.refreshCurrentUser()}
        title="Unable to verify your session"
      />
    )
  }

  if (auth.currentUser) {
    return <Navigate replace to={getDashboardPathForRole(auth.currentUser.primaryRole)} />
  }

  return children
}

export function RequireRole({ children, role }: RoleGuardProps) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'loading') {
    return <SessionCheckSkeleton />
  }

  if (auth.status === 'error' && !auth.currentUser) {
    return (
      <ErrorState
        correlationId={auth.sessionError?.correlationId}
        message={
          auth.sessionError?.message ??
          'We could not verify your session right now. Your session has been preserved.'
        }
        onAction={() => void auth.refreshCurrentUser()}
        title="Unable to verify your session"
      />
    )
  }

  if (auth.status === 'anonymous') {
    return <Navigate replace state={{ from: location.pathname }} to={getLoginPathForRole(role)} />
  }

  if (!auth.roles.includes(role)) {
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

export function RequireResetContextRoute({
  accountType,
  children,
  redirectTo,
  requireVerified = false,
}: ResetContextGuardProps) {
  const context = authStorage.getPasswordResetContext()

  if (!context || context.accountType !== accountType) {
    return <Navigate replace to={redirectTo} />
  }

  if (requireVerified && !context.otpVerified) {
    return (
      <Navigate
        replace
        to={
          accountType === 'ADMIN'
            ? routePaths.adminVerifyResetOtp
            : routePaths.studentResetVerifyOtp
        }
      />
    )
  }

  return children
}

export function RequireVerificationContextRoute({
  children,
  requireVerified = false,
}: PropsWithChildren<{ requireVerified?: boolean }>) {
  const context = authStorage.getVerificationContext()

  if (!context) {
    return <Navigate replace to={routePaths.studentSignUp} />
  }

  if (requireVerified && !context.verified) {
    return <Navigate replace to={routePaths.studentVerifyOtp} />
  }

  return children
}
