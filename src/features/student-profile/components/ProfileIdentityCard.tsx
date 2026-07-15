import type { StudentProfile } from '../types/studentProfileTypes'
import type { FileUploadConstraint } from '../types/profileFileTypes'
import { AvatarUpload } from './AvatarUpload'

export function ProfileIdentityCard({
  photoPolicy,
  profile,
}: {
  profile: StudentProfile
  photoPolicy?: FileUploadConstraint
}) {
  return (
    <aside className="section-card profile-identity-card" aria-labelledby="profile-identity-title">
      <AvatarUpload
        fullName={profile.fullName}
        photoUrl={profile.profilePhoto?.url ?? null}
        policy={photoPolicy}
        version={profile.version}
      />
      <div className="profile-identity-heading">
        <h2 id="profile-identity-title">Student identity</h2>
        <p>{profile.fullName}</p>
      </div>
      <dl className="profile-identity-list">
        <div>
          <dt>Index Number</dt>
          <dd>{profile.indexNumber}</dd>
        </div>
        <div>
          <dt>University Email</dt>
          <dd>{profile.universityEmail}</dd>
        </div>
        <div>
          <dt>Degree Programme</dt>
          <dd>{profile.degreeProgramme}</dd>
        </div>
        <div>
          <dt>Current Level</dt>
          <dd>Level {profile.studentLevel}</dd>
        </div>
        <div>
          <dt>Cohort / Batch</dt>
          <dd>{profile.cohortYear ?? 'Not available'}</dd>
        </div>
      </dl>
      <p className="profile-identity-note">
        Verified identity and official academic values are read-only.
      </p>
    </aside>
  )
}
