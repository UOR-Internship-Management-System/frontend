import { SectionCard } from '../../../shared/components/layout/SectionCard'
import type { CvRecordSelections } from '../mappers/cvMapper'
import { CvRecordSelectionGroup, type CvSelectionGroupState } from './CvRecordSelectionGroup'

export type CvConfigurationPanelProps = {
  selections: CvRecordSelections
  experienceSources: CvSelectionGroupState
  projectSources: CvSelectionGroupState
  certificateSources: CvSelectionGroupState
  awardSources: CvSelectionGroupState
  activitySources: CvSelectionGroupState
  onToggleRecord: (selection: keyof CvRecordSelections, recordId: string) => void
}

export function CvConfigurationPanel({
  activitySources,
  awardSources,
  certificateSources,
  experienceSources,
  onToggleRecord,
  projectSources,
  selections,
}: CvConfigurationPanelProps) {
  return (
    <SectionCard aria-labelledby="cv-configuration-title" className="s5-cv-configuration">
      <div className="s5-section-heading">
        <div>
          <h2 id="cv-configuration-title">CV component inclusion</h2>
          <p>Select the individual records to include before generating a preview.</p>
        </div>
      </div>

      <div className="s5-cv-identity-note">
        <strong>Identity and contact details are always included.</strong>
        <span>The CV always uses the approved default section order.</span>
      </div>

      <div className="s5-cv-source-grid">
        <CvRecordSelectionGroup
          manageHref="/student/profile"
          manageLabel="Work Experience in Profile"
          onToggle={(id) => onToggleRecord('includedExperienceIds', id)}
          selectedIds={selections.includedExperienceIds}
          title="Work Experience"
          {...experienceSources}
        />
        <CvRecordSelectionGroup
          manageHref="/student/projects"
          manageLabel="Projects"
          onToggle={(id) => onToggleRecord('includedProjectIds', id)}
          selectedIds={selections.includedProjectIds}
          title="Projects"
          {...projectSources}
        />
        <CvRecordSelectionGroup
          manageHref="/student/profile"
          manageLabel="Certificates in Profile"
          onToggle={(id) => onToggleRecord('includedCertificateIds', id)}
          selectedIds={selections.includedCertificateIds}
          title="Certificates"
          {...certificateSources}
        />
        <CvRecordSelectionGroup
          manageHref="/student/profile"
          manageLabel="Awards and Honors in Profile"
          onToggle={(id) => onToggleRecord('includedAwardIds', id)}
          selectedIds={selections.includedAwardIds}
          title="Awards and Honors"
          {...awardSources}
        />
        <CvRecordSelectionGroup
          manageHref="/student/profile"
          manageLabel="Extracurricular Activities in Profile"
          onToggle={(id) => onToggleRecord('includedActivityIds', id)}
          selectedIds={selections.includedActivityIds}
          title="Extracurricular Activities"
          {...activitySources}
        />
      </div>
    </SectionCard>
  )
}
