import { SkeletonBlock } from '../components/feedback/SkeletonBlock'
import { SkeletonPageHeader, SkeletonShape, SkeletonStatusRegion } from './SkeletonPrimitives'

export type FormSkeletonVariant = 'generic' | 'profile' | 'student-detail'

function FieldSkeleton() {
  return (
    <div aria-hidden="true" className="form-skeleton-field">
      <SkeletonShape height={10} radius="pill" width="32%" />
      <SkeletonShape height={48} radius="md" />
    </div>
  )
}

function GenericFormSkeleton() {
  return (
    <section aria-hidden="true" className="section-card form-skeleton-card skeleton-stack">
      <SkeletonShape height={28} width={220} />
      <div className="form-skeleton-grid">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <SkeletonShape height={44} radius="pill" width={150} />
    </section>
  )
}

function ProfileFormSkeleton() {
  return (
    <div aria-hidden="true" className="skeleton-profile-layout">
      <section className="section-card skeleton-profile-avatar-area">
        <SkeletonShape height={112} radius="circle" width={112} />
        <SkeletonShape height={42} radius="pill" width={180} />
        <SkeletonShape height={26} width="70%" />
        <SkeletonBlock decorative lineWidths={['86%', '72%', '60%']} lines={3} variant="inline" />
      </section>
      <div className="skeleton-supporting-grid">
        <section className="section-card skeleton-stack">
          <SkeletonShape height={28} width={260} />
          <div className="form-skeleton-grid two-column">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <FieldSkeleton />
          <SkeletonShape height={44} radius="pill" width={160} />
        </section>
        {['Professional Links', 'Certificates', 'Awards', 'Activities', 'Experience'].map(
          (title) => (
            <section className="section-card skeleton-profile-section" key={title}>
              <div className="skeleton-section-heading">
                <SkeletonShape height={26} width="42%" />
                <SkeletonShape height={40} radius="pill" width={120} />
              </div>
              <div className="skeleton-card skeleton-stack">
                <SkeletonShape height={18} width="48%" />
                <SkeletonBlock decorative lineWidths={['90%', '72%']} lines={2} variant="inline" />
              </div>
            </section>
          ),
        )}
      </div>
    </div>
  )
}

function StudentDetailSkeleton() {
  return (
    <div aria-hidden="true" className="skeleton-profile-layout">
      <section className="section-card skeleton-profile-avatar-area">
        <SkeletonShape height={88} radius="circle" width={88} />
        <SkeletonShape height={28} width="68%" />
        <SkeletonBlock decorative lineWidths={['84%', '52%']} lines={2} variant="inline" />
      </section>
      <section className="section-card skeleton-stack">
        <SkeletonShape height={28} width={240} />
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
    <SkeletonStatusRegion className="content-stack" label="Loading form content">
      <SkeletonPageHeader />
      {variant === 'profile' ? <ProfileFormSkeleton /> : null}
      {variant === 'student-detail' ? <StudentDetailSkeleton /> : null}
      {variant === 'generic' ? <GenericFormSkeleton /> : null}
    </SkeletonStatusRegion>
  )
}

export function StudentProfileSkeleton() {
  return <FormSkeleton variant="profile" />
}
