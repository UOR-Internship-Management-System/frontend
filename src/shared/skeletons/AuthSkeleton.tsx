import type { CSSProperties } from 'react'
import { SkeletonBlock, type SkeletonRadius } from '../components/feedback/SkeletonBlock'

export type AuthSkeletonVariant =
  | 'student-login'
  | 'student-sign-up'
  | 'otp'
  | 'create-password'
  | 'admin-login'
  | 'forgot-password'
  | 'session'

type ShapeProps = {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  radius?: SkeletonRadius
  className?: string
}

function Shape({ className, height = 14, radius = 'md', width = '100%' }: ShapeProps) {
  return (
    <SkeletonBlock
      className={className}
      decorative
      height={height}
      lines={0}
      radius={radius}
      variant="inline"
      width={width}
    />
  )
}

function TextGroup({ lines = 2 }: { lines?: number }) {
  return (
    <SkeletonBlock
      decorative
      lineWidths={Array.from({ length: lines }, (_, index) =>
        index === lines - 1 ? '72%' : '100%',
      )}
      lines={lines}
      variant="inline"
      width="100%"
    />
  )
}

function FormFieldSkeleton() {
  return (
    <div aria-hidden="true" className="auth-skeleton-field">
      <Shape height={10} radius="pill" width="34%" />
      <Shape height={48} radius="md" />
    </div>
  )
}

function SplitAuthSkeletonLayout({ fieldCount, label }: { fieldCount: number; label: string }) {
  return (
    <section aria-busy="true" aria-label={label} className="auth-split-shell" role="status">
      <span className="visually-hidden">{label}</span>
      <aside aria-hidden="true" className="auth-welcome-panel">
        <div className="auth-skeleton-welcome">
          <Shape height={44} width="88%" />
          <Shape height={44} width="64%" />
          <SkeletonBlock
            decorative
            lineWidths={['82%', '92%', '58%']}
            lines={3}
            variant="inline"
            width="100%"
          />
        </div>
      </aside>
      <div className="auth-form-panel">
        <section aria-hidden="true" className="auth-form-card auth-skeleton-card">
          <div className="auth-skeleton-heading">
            <Shape height={28} width="68%" />
            <TextGroup lines={2} />
          </div>
          <div className="auth-skeleton-fields">
            {Array.from({ length: fieldCount }, (_, index) => (
              <FormFieldSkeleton key={index} />
            ))}
          </div>
          <Shape className="auth-skeleton-submit" height={44} radius="pill" width="48%" />
          <Shape height={10} radius="pill" width="56%" />
        </section>
      </div>
    </section>
  )
}

function AuthCardSkeletonLayout({
  fieldCount,
  iconSize = 56,
  label,
  otp = false,
}: {
  fieldCount: number
  iconSize?: number
  label: string
  otp?: boolean
}) {
  return (
    <section
      aria-busy="true"
      aria-label={label}
      className="auth-centered-card auth-skeleton-card-shell"
      role="status"
    >
      <span className="visually-hidden">{label}</span>
      <SkeletonBlock
        decorative
        height={iconSize}
        lines={0}
        radius="circle"
        variant="circle"
        width={iconSize}
      />
      <div aria-hidden="true" className="auth-skeleton-centered">
        <Shape height={28} width="72%" />
        <TextGroup lines={2} />
        {otp ? (
          <div className="auth-skeleton-otp-grid">
            {Array.from({ length: 6 }, (_, index) => (
              <Shape height={52} key={index} radius="md" />
            ))}
          </div>
        ) : (
          <div className="auth-skeleton-fields">
            {Array.from({ length: fieldCount }, (_, index) => (
              <FormFieldSkeleton key={index} />
            ))}
          </div>
        )}
        <Shape height={44} radius="pill" width="100%" />
        <Shape height={10} radius="pill" width="52%" />
      </div>
    </section>
  )
}

export function AuthSkeleton({ variant }: { variant: AuthSkeletonVariant }) {
  if (variant === 'session') {
    return (
      <section
        aria-busy="true"
        aria-label="Loading account session"
        className="route-skeleton route-skeleton-session"
        role="status"
      >
        <span className="visually-hidden">Loading account session</span>
        <div aria-hidden="true" className="section-card session-skeleton-card">
          <SkeletonBlock
            decorative
            height={48}
            lines={0}
            radius="circle"
            variant="circle"
            width={48}
          />
          <SkeletonBlock
            decorative
            lineWidths={['72%', '48%']}
            lines={2}
            variant="inline"
            width={220}
          />
        </div>
      </section>
    )
  }

  if (variant === 'student-sign-up')
    return <SplitAuthSkeletonLayout fieldCount={3} label="Loading student registration page" />
  if (variant === 'student-login')
    return <SplitAuthSkeletonLayout fieldCount={2} label="Loading student login page" />
  if (variant === 'admin-login')
    return <SplitAuthSkeletonLayout fieldCount={2} label="Loading admin login page" />
  if (variant === 'otp')
    return <AuthCardSkeletonLayout fieldCount={0} label="Loading OTP verification page" otp />
  if (variant === 'create-password')
    return <AuthCardSkeletonLayout fieldCount={2} label="Loading password creation page" />
  return <AuthCardSkeletonLayout fieldCount={1} label="Loading password recovery page" />
}
