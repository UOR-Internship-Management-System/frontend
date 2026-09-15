import { Chip } from '../../../shared/components/ui/Chip'
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
    <aside
      className="card m3-card m3-card--outlined profile-identity-card"
      aria-labelledby="profile-identity-title"
    >
      <AvatarUpload
        fullName={profile.fullName}
        photoUrl={profile.profilePhoto?.url ?? null}
        policy={photoPolicy}
        version={profile.version}
      />
      <div className="profile-identity-heading">
        <h2 id="profile-identity-title">Student identity</h2>
        <p className="profile-identity-fullname">{profile.fullName}</p>
        <Chip
          aria-label="Official Verified Student"
          leadingIcon={
            <span className="material-symbols-outlined" aria-hidden="true">
              verified
            </span>
          }
        >
          Verified Student
        </Chip>
      </div>
      <dl className="profile-identity-list">
        <div className="profile-identity-item">
          <span className="material-symbols-outlined profile-identity-item-icon" aria-hidden="true">
            badge
          </span>
          <div className="profile-identity-item-content">
            <dt>Index number</dt>
            <dd>{profile.indexNumber}</dd>
          </div>
        </div>
        <div className="profile-identity-item">
          <span className="material-symbols-outlined profile-identity-item-icon" aria-hidden="true">
            alternate_email
          </span>
          <div className="profile-identity-item-content">
            <dt>University email</dt>
            <dd>{profile.universityEmail}</dd>
          </div>
        </div>
        <div className="profile-identity-item">
          <span className="material-symbols-outlined profile-identity-item-icon" aria-hidden="true">
            school
          </span>
          <div className="profile-identity-item-content">
            <dt>Degree programme</dt>
            <dd>{profile.degreeProgramme}</dd>
          </div>
        </div>
        <div className="profile-identity-item">
          <span className="material-symbols-outlined profile-identity-item-icon" aria-hidden="true">
            workspace_premium
          </span>
          <div className="profile-identity-item-content">
            <dt>Current level</dt>
            <dd>Level {profile.studentLevel}</dd>
          </div>
        </div>
        <div className="profile-identity-item">
          <span className="material-symbols-outlined profile-identity-item-icon" aria-hidden="true">
            event_note
          </span>
          <div className="profile-identity-item-content">
            <dt>Batch</dt>
            <dd>{profile.cohortYear ?? 'Not available'}</dd>
          </div>
        </div>
      </dl>
      <p className="profile-identity-note">
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{ fontSize: '16px', verticalAlign: 'text-bottom' }}
        >
          lock
        </span>{' '}
        Official identity and academic values are read-only.
      </p>
    </aside>
  )
}
