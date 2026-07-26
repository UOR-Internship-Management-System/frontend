import { routePaths } from '../../../app/config/routePaths'
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

const alwaysIncludedContent = [
  'Identity and contact details',
  'Professional summary',
  'Declared skills',
  'Academic summary',
] as const

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
        <strong>Always included</strong>
        <div className="s5-cv-always-included-list">
          {alwaysIncludedContent.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <small>Optional records follow the approved default section order.</small>
      </div>

      <div className="s5-cv-source-grid">
        <CvRecordSelectionGroup
          manageHref={routePaths.studentProfile}
          manageLabel="Work Experience in Profile"
          onToggle={(id) => onToggleRecord('includedExperienceIds', id)}
          selectedIds={selections.includedExperienceIds}
          title="Work Experience"
          {...experienceSources}
        />
        <CvRecordSelectionGroup
          manageHref={routePaths.studentProjects}
          manageLabel="Projects"
          onToggle={(id) => onToggleRecord('includedProjectIds', id)}
          selectedIds={selections.includedProjectIds}
          title="Projects"
          {...projectSources}
        />
        <CvRecordSelectionGroup
          manageHref={routePaths.studentProfile}
          manageLabel="Certificates in Profile"
          onToggle={(id) => onToggleRecord('includedCertificateIds', id)}
          selectedIds={selections.includedCertificateIds}
          title="Certificates"
          {...certificateSources}
        />
        <CvRecordSelectionGroup
          manageHref={routePaths.studentProfile}
          manageLabel="Awards and Honors in Profile"
          onToggle={(id) => onToggleRecord('includedAwardIds', id)}
          selectedIds={selections.includedAwardIds}
          title="Awards and Honors"
          {...awardSources}
        />
        <CvRecordSelectionGroup
          manageHref={routePaths.studentProfile}
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
