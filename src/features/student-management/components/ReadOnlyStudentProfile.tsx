import type { ApiStudentProfileResponse } from '../../../shared/api/generated/cvManagementApi.types'
import { SectionCard } from '../../../shared/components/layout/SectionCard'

export function ReadOnlyStudentProfile({ profile }: { profile: ApiStudentProfileResponse }) {
  return (
    <SectionCard aria-labelledby="student-profile-summary-title" className="sdd-section-card">
      <header className="sdd-section-heading">
        <h2 id="student-profile-summary-title">Profile summary</h2>
        <span className="sdd-read-only">Read only</span>
      </header>
      <dl className="sdd-detail-grid">
        <Detail label="Professional Headline" value={profile.headline} />
        <Detail label="University Email Address" value={profile.universityEmail} />
        <Detail label="Personal Email Address" value={profile.personalEmail} />
        <Detail label="Phone Number" value={profile.phone} />
        <Detail className="sdd-detail-wide" label="City and State" value={profile.location} />
        <Detail
          className="sdd-detail-wide"
          label="Profile Summary / Objective Brief"
          value={profile.summary}
        />
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
    <div className={`sdd-detail ${className}`.trim()}>
      <dt>{label}</dt>
      <dd>{value?.trim() || 'Not provided'}</dd>
    </div>
  )
}
