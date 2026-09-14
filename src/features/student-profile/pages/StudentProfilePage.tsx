import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { Button } from '../../../shared/components/ui/Button'
import {
  SkeletonCard,
  SkeletonFormFields,
  SkeletonPageHeader,
  SkeletonStatusRegion,
} from '../../../shared/skeletons'
import { ProfileForm } from '../components/ProfileForm'
import { ProfileIdentityCard } from '../components/ProfileIdentityCard'
import {
  ActivitiesSection,
  AwardsSection,
  CertificatesSection,
  EducationSection,
  ExperienceSection,
  ProfessionalLinksSection,
} from '../components/ProfileSections'
import { useProfileUploadPolicy } from '../hooks/useProfileFiles'
import { useStudentProfile } from '../hooks/useStudentProfile'

export function StudentProfilePage() {
  const profileQuery = useStudentProfile()
  const uploadPolicyQuery = useProfileUploadPolicy()

  if (profileQuery.isPending) {
    return (
      <SkeletonStatusRegion className="content-stack profile-page" label="Loading form content">
        <SkeletonPageHeader />
        <div className="profile-layout">
          <SkeletonCard>
            <SkeletonFormFields count={4} />
          </SkeletonCard>
          <SkeletonCard title={false}>
            <SkeletonFormFields columns={2} count={8} />
          </SkeletonCard>
        </div>
      </SkeletonStatusRegion>
    )
  }

  if (profileQuery.isError || !profileQuery.data) {
    const error = mapApiError(profileQuery.error, 'protected')
    return (
      <article className="content-stack profile-page">
        <PageHeader
          description="Manage the profile details that you own."
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
              <Button onClick={() => void uploadPolicyQuery.refetch()} variant="text">
                Retry upload policy
              </Button>
            </div>
          ) : null}
          <ProfessionalLinksSection />
          <EducationSection />
          <CertificatesSection evidencePolicy={uploadPolicyQuery.data?.certificateEvidence} />
          <AwardsSection />
          <ActivitiesSection />
          <ExperienceSection />
        </div>
      </div>
    </article>
  )
}
