import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import type { StudentProject } from '../../student-projects/types/studentProjectTypes'
import type { CvOptionalSections } from '../mappers/cvMapper'
import { CvProfileSourceGroup, type CvProfileSourceGroupState } from './CvProfileSourceGroup'

export type CvConfigurationPanelProps = {
  optionalSections: CvOptionalSections
  selectedProjectIds: string[]
  projects?: StudentProject[]
  projectsLoading: boolean
  projectsError?: { message: string; correlationId?: string } | null
  experienceSources: CvProfileSourceGroupState
  certificateSources: CvProfileSourceGroupState
  awardSources: CvProfileSourceGroupState
  activitySources: CvProfileSourceGroupState
  onToggleOptionalSection: (section: keyof CvOptionalSections) => void
  onToggleProject: (projectId: string) => void
  onRetryProjects: () => void
}

export function CvConfigurationPanel({
  activitySources,
  awardSources,
  certificateSources,
  experienceSources,
  onRetryProjects,
  onToggleProject,
  onToggleOptionalSection,
  optionalSections,
  projects,
  projectsError,
  projectsLoading,
  selectedProjectIds,
}: CvConfigurationPanelProps) {
  const projectsEnabled = optionalSections.projects

  return (
    <SectionCard aria-labelledby="cv-configuration-title" className="s5-cv-configuration">
      <div className="s5-section-heading">
        <div>
          <h2 id="cv-configuration-title">CV configuration</h2>
          <p>Choose optional content before generating a server-confirmed preview.</p>
        </div>
      </div>

      <div className="s5-cv-identity-note">
        <strong>Identity and contact details are always included.</strong>
        <span>The CV always uses the approved default section order.</span>
      </div>

      <CvProfileSourceGroup
        enabled={optionalSections.experience}
        manageLabel="Work Experience"
        onToggle={() => onToggleOptionalSection('experience')}
        title="Work Experience"
        {...experienceSources}
      />

      <fieldset className="s5-cv-project-fieldset">
        <legend>
          <label>
            <input
              checked={projectsEnabled}
              onChange={() => onToggleOptionalSection('projects')}
              type="checkbox"
            />
            <span>Projects</span>
          </label>
        </legend>
        {!projectsEnabled ? (
          <p className="s5-inline-guidance">
            Project selections are retained locally, but no project IDs are sent while Projects is
            excluded.
          </p>
        ) : null}
        {projectsLoading ? (
          <div aria-label="Loading CV project options" role="status">
            <SkeletonBlock lines={4} />
          </div>
        ) : null}
        {projectsError ? (
          <ErrorState
            correlationId={projectsError.correlationId}
            message={projectsError.message}
            onAction={onRetryProjects}
            title="Project options unavailable"
          />
        ) : null}
        {!projectsLoading && !projectsError && projects?.length === 0 ? (
          <p className="s5-inline-guidance">No portfolio projects are available yet.</p>
        ) : null}
        {!projectsLoading && !projectsError && projects?.length ? (
          <div className="s5-cv-project-options">
            {projects.map((project) => (
              <label key={project.projectId}>
                <input
                  checked={selectedProjectIds.includes(project.projectId)}
                  disabled={!projectsEnabled}
                  onChange={() => onToggleProject(project.projectId)}
                  type="checkbox"
                />
                <span>
                  <strong>{project.title}</strong>
                  <small>
                    {project.includeInCv ? 'Included by project preference' : 'Optional'}
                  </small>
                </span>
              </label>
            ))}
          </div>
        ) : null}
      </fieldset>

      <CvProfileSourceGroup
        enabled={optionalSections.certificates}
        manageLabel="Certificates"
        onToggle={() => onToggleOptionalSection('certificates')}
        title="Certificates"
        {...certificateSources}
      />
      <CvProfileSourceGroup
        enabled={optionalSections.awards}
        manageLabel="Awards and Honors"
        onToggle={() => onToggleOptionalSection('awards')}
        title="Awards and Honors"
        {...awardSources}
      />
      <CvProfileSourceGroup
        enabled={optionalSections.activities}
        manageLabel="Extracurricular Activities"
        onToggle={() => onToggleOptionalSection('activities')}
        title="Extracurricular Activities"
        {...activitySources}
      />
    </SectionCard>
  )
}
