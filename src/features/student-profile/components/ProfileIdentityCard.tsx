import type { StudentProfile } from '../types/studentProfileTypes'
import { AvatarUpload } from './AvatarUpload'

export function ProfileIdentityCard({ profile }: { profile: StudentProfile }) {
  return (
    <aside className="section-card profile-identity-card" aria-labelledby="profile-identity-title">
      <AvatarUpload fullName={profile.fullName} profilePhotoUrl={profile.profilePhotoUrl} />
      <div className="profile-identity-heading">
        <h2 id="profile-identity-title">Student identity</h2>
        <p>{profile.fullName || 'Student'}</p>
      </div>
      <dl className="profile-identity-list">
        <div>
          <dt>Index Number</dt>
          <dd>{profile.indexNumber || 'Not available'}</dd>
        </div>
        <div>
          <dt>University Email</dt>
          <dd>{profile.universityEmail || 'Not available'}</dd>
        </div>
      </dl>
      <p className="profile-identity-note">
        These verified identity values are read-only and cannot be changed from your profile.
      </p>
    </aside>
  )
}
