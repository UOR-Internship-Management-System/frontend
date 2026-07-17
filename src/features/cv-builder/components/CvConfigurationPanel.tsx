import { Button } from '../../../shared/components/ui/Button'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import type { StudentProject } from '../../student-projects/types/studentProjectTypes'
import { cvSectionLabels, defaultCvSectionOrder } from '../mappers/cvMapper'
import type { CvSection } from '../types/cvBuilderTypes'

export type CvConfigurationPanelProps = {
  sectionOrder: CvSection[]
  selectedProjectIds: string[]
  projects?: StudentProject[]
  projectsLoading: boolean
  projectsError?: { message: string; correlationId?: string } | null
  onMoveSection: (section: CvSection, direction: -1 | 1) => void
  onToggleSection: (section: CvSection) => void
  onToggleProject: (projectId: string) => void
  onRetryProjects: () => void
}

export function CvConfigurationPanel({
  onMoveSection,
  onRetryProjects,
  onToggleProject,
  onToggleSection,
  projects,
  projectsError,
  projectsLoading,
  sectionOrder,
  selectedProjectIds,
}: CvConfigurationPanelProps) {
  const projectsEnabled = sectionOrder.includes('PROJECTS')
  const orderedSections = [
    ...sectionOrder,
    ...defaultCvSectionOrder.filter((section) => !sectionOrder.includes(section)),
  ]

  return (
    <SectionCard aria-labelledby="cv-configuration-title" className="s5-cv-configuration">
      <div className="s5-section-heading">
        <div>
          <h2 id="cv-configuration-title">CV configuration</h2>
          <p>Choose and order optional content before generating a server-confirmed preview.</p>
        </div>
      </div>

      <div className="s5-cv-identity-note">
        <strong>Identity and contact details are always included.</strong>
        <span>They are generated from your profile and are not part of the section order.</span>
      </div>

      <fieldset className="s5-cv-section-fieldset">
        <legend>Included sections and order</legend>
        <ol className="s5-cv-section-list">
          {orderedSections.map((section) => {
            const enabled = sectionOrder.includes(section)
            const enabledIndex = sectionOrder.indexOf(section)
            return (
              <li className={enabled ? '' : 'is-disabled'} key={section}>
                <label>
                  <input
                    checked={enabled}
                    disabled={enabled && sectionOrder.length === 1}
                    onChange={() => onToggleSection(section)}
                    type="checkbox"
                  />
                  <span>{cvSectionLabels[section]}</span>
                </label>
                {enabled ? (
                  <span className="s5-cv-order-actions">
                    <Button
                      aria-label={`Move ${cvSectionLabels[section]} up`}
                      disabled={enabledIndex === 0}
                      onClick={() => onMoveSection(section, -1)}
                      variant="secondary"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined">
                        arrow_upward
                      </span>
                    </Button>
                    <Button
                      aria-label={`Move ${cvSectionLabels[section]} down`}
                      disabled={enabledIndex === sectionOrder.length - 1}
                      onClick={() => onMoveSection(section, 1)}
                      variant="secondary"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined">
                        arrow_downward
                      </span>
                    </Button>
                  </span>
                ) : null}
              </li>
            )
          })}
        </ol>
      </fieldset>

      <fieldset className="s5-cv-project-fieldset">
        <legend>Projects to include</legend>
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
    </SectionCard>
  )
}
