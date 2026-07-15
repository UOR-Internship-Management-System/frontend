import type { CSSProperties } from 'react'
import { SkeletonBlock } from '../components/feedback/SkeletonBlock'

export type FormSkeletonVariant = 'generic' | 'profile' | 'student-detail'

function Shape({
  height = 14,
  rounded = false,
  width = '100%',
}: {
  height?: CSSProperties['height']
  rounded?: boolean
  width?: CSSProperties['width']
}) {
  return (
    <SkeletonBlock
      decorative
      height={height}
      lines={0}
      rounded={rounded}
      variant="inline"
      width={width}
    />
  )
}

function FieldSkeleton() {
  return (
    <div className="form-skeleton-field" aria-hidden="true">
      <Shape height={10} width="32%" />
      <Shape height={48} rounded />
    </div>
  )
}

function PageHeaderSkeleton() {
  return (
    <header className="page-header skeleton-page-header" aria-hidden="true">
      <div>
        <Shape height={24} rounded width={150} />
        <Shape height={44} width="min(420px, 82vw)" />
        <SkeletonBlock
          decorative
          lineWidths={['min(620px, 90vw)', 'min(460px, 72vw)']}
          lines={2}
          variant="inline"
        />
      </div>
    </header>
  )
}

function GenericFormSkeleton() {
  return (
    <section className="section-card form-skeleton-card" aria-hidden="true">
      <Shape height={28} width={220} />
      <div className="form-skeleton-grid">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <Shape height={44} rounded width={150} />
    </section>
  )
}

function ProfileFormSkeleton() {
  return (
    <div className="profile-skeleton-layout" aria-hidden="true">
      <section className="section-card profile-skeleton-summary">
        <Shape height={96} rounded width={96} />
        <Shape height={26} width="70%" />
        <SkeletonBlock decorative lineWidths={['86%', '54%']} lines={2} variant="inline" />
      </section>
      <div className="profile-skeleton-main">
        <section className="section-card form-skeleton-card">
          <Shape height={28} width={260} />
          <div className="form-skeleton-grid two-column">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <FieldSkeleton />
          <Shape height={44} rounded width={160} />
        </section>
        {['Professional Links', 'Certificates', 'Awards', 'Activities', 'Experience'].map(
          (title) => (
            <section className="section-card profile-section-skeleton" key={title}>
              <Shape height={26} width="42%" />
              <Shape height={48} rounded />
              <SkeletonBlock decorative lines={3} />
            </section>
          ),
        )}
      </div>
    </div>
  )
}

function StudentDetailSkeleton() {
  return (
    <div className="student-detail-skeleton-layout" aria-hidden="true">
      <section className="section-card profile-skeleton-summary">
        <Shape height={88} rounded width={88} />
        <Shape height={28} width="68%" />
        <SkeletonBlock decorative lineWidths={['84%', '52%']} lines={2} variant="inline" />
      </section>
      <section className="section-card form-skeleton-card">
        <Shape height={28} width={240} />
        <div className="form-skeleton-grid two-column">
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
      </section>
    </div>
  )
}

export function FormSkeleton({ variant = 'generic' }: { variant?: FormSkeletonVariant }) {
  return (
    <section
      aria-busy="true"
      aria-label="Loading form content"
      className="content-stack"
      role="status"
    >
      <span className="visually-hidden">Loading form content</span>
      <PageHeaderSkeleton />
      {variant === 'profile' ? <ProfileFormSkeleton /> : null}
      {variant === 'student-detail' ? <StudentDetailSkeleton /> : null}
      {variant === 'generic' ? <GenericFormSkeleton /> : null}
    </section>
  )
}

export function StudentProfileSkeleton() {
  return <FormSkeleton variant="profile" />
}
