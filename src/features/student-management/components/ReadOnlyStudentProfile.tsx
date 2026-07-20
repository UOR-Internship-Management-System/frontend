import type { ApiStudentProfileResponse } from '../../../shared/api/generated/cvManagementApi.types'
import { SectionCard } from '../../../shared/components/layout/SectionCard'

export function ReadOnlyStudentProfile({ profile }: { profile: ApiStudentProfileResponse }) {
  return (
    <SectionCard aria-labelledby="student-profile-summary-title" className="deep-dive-section">
      <header className="deep-dive-section-heading">
        <div>
          <p className="section-eyebrow">Student-owned information</p>
          <h2 id="student-profile-summary-title">Profile summary</h2>
        </div>
        <span className="read-only-indicator">Read only</span>
      </header>
      <dl className="deep-dive-detail-grid">
        <Detail label="Professional headline" value={profile.headline} />
        <Detail label="Personal email" value={profile.personalEmail} />
        <Detail label="Phone number" value={profile.phone} />
        <Detail label="Location" value={profile.location} />
        <Detail className="deep-dive-detail-wide" label="Summary" value={profile.summary} />
      </dl>
    </SectionCard>
  )
}

function Detail({
  className = '',
  label,
  value,
}: {
  className?: string
  label: string
  value: string | null
}) {
  return (
    <div className={`deep-dive-detail ${className}`.trim()}>
      <dt>{label}</dt>
      <dd>{value?.trim() || 'Not provided'}</dd>
    </div>
  )
}
