import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { StudentProfileSkeleton } from '../../../shared/skeletons'
import { ProfileForm } from '../components/ProfileForm'
import { ProfileIdentityCard } from '../components/ProfileIdentityCard'
import {
  ActivitiesSection,
  AwardsSection,
  CertificatesSection,
  ExperienceSection,
  ProfessionalLinksSection,
} from '../components/ProfileSections'
import { useProfileUploadPolicy } from '../hooks/useProfileFiles'
import { useStudentProfile } from '../hooks/useStudentProfile'

export function StudentProfilePage() {
  const profileQuery = useStudentProfile()
  const uploadPolicyQuery = useProfileUploadPolicy()

  if (profileQuery.isPending) {
    return <StudentProfileSkeleton />
  }

  if (profileQuery.isError || !profileQuery.data) {
    const error = mapApiError(profileQuery.error, 'protected')
    return (
      <article className="content-stack profile-page">
        <PageHeader
          description="Manage the profile details that you own."
          eyebrow="Student profile"
          title="Profile"
        />
        <ErrorState
          correlationId={error.correlationId}
          message={error.message}
          onAction={() => void profileQuery.refetch()}
          title="Profile unavailable"
        />
      </article>
    )
  }

  const profile = profileQuery.data

  return (
    <article className="content-stack profile-page">
      <PageHeader
        description="Keep your Student-owned professional details current. Verified identity values remain read-only."
        eyebrow="Student profile"
        title="Profile"
      />
      <div className="profile-layout">
        <ProfileIdentityCard photoPolicy={uploadPolicyQuery.data?.profilePhoto} profile={profile} />
        <div className="profile-main-column">
          <ProfileForm
            onReload={async () => (await profileQuery.refetch()).data}
            profile={profile}
          />
          {uploadPolicyQuery.isError ? (
            <div className="inline-alert profile-policy-alert" role="alert">
              <p>
                The upload policy is unavailable. Profile and supporting entries remain available,
                but file controls are disabled.
              </p>
              <button
                className="link-button"
                onClick={() => void uploadPolicyQuery.refetch()}
                type="button"
              >
                Retry upload policy
              </button>
            </div>
          ) : null}
          <ProfessionalLinksSection />
          <CertificatesSection evidencePolicy={uploadPolicyQuery.data?.certificateEvidence} />
          <AwardsSection />
          <ActivitiesSection />
          <ExperienceSection />
        </div>
      </div>
    </article>
  )
}
