import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { StudentProject } from '../types/studentProjectTypes'
import { ProjectSkillChips } from './ProjectSkillChips'

export function ProjectDetailsModal({
  onClose,
  onDelete,
  onEdit,
  project,
}: {
  project: StudentProject
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Modal
      description="Read-only mode. Select Edit to update this project."
      onClose={onClose}
      size="wide"
      title="Project Details"
    >
      <div className="s4-projects-details">
        <div className="s4-projects-details-status">
          <StatusBadge tone="neutral">{getProjectStatus(project)}</StatusBadge>
          <StatusBadge tone={project.includeInCv ? 'success' : 'neutral'}>
            {project.includeInCv ? 'CV Included' : 'CV Excluded'}
          </StatusBadge>
        </div>

        <dl className="s4-projects-details-grid">
          <div className="s4-projects-details-wide">
            <dt>Title</dt>
            <dd>{project.title}</dd>
          </div>
          <div>
            <dt>Start Date</dt>
            <dd>{formatDate(project.startDate) ?? 'Not provided'}</dd>
          </div>
          <div>
            <dt>End Date</dt>
            <dd>
              {formatDate(project.endDate) ?? (project.startDate ? 'Present' : 'Not provided')}
            </dd>
          </div>
          <div className="s4-projects-details-wide">
            <dt>Project Abstract / High-Level Description</dt>
            <dd>{project.description || 'Not provided'}</dd>
          </div>
        </dl>

        <section
          aria-labelledby="project-details-skills-title"
          className="s4-projects-details-section"
        >
          <h3 id="project-details-skills-title">Skills</h3>
          <ProjectSkillChips skills={project.skills} />
        </section>

        <section
          aria-labelledby="project-details-links-title"
          className="s4-projects-details-section"
        >
          <h3 id="project-details-links-title">Project Links</h3>
          {project.repositoryUrl || project.demoUrl ? (
            <div className="s4-projects-links">
              {project.repositoryUrl ? (
                <a href={project.repositoryUrl} rel="noreferrer noopener" target="_blank">
                  Open Repository
                </a>
              ) : null}
              {project.demoUrl ? (
                <a href={project.demoUrl} rel="noreferrer noopener" target="_blank">
                  Open Demo
                </a>
              ) : null}
            </div>
          ) : (
            <p className="s4-projects-no-links">No project links provided.</p>
          )}
        </section>

        <div className="s4-projects-details-actions">
          <Button className="s4-projects-danger-button" onClick={onDelete} variant="secondary">
            Remove Project
          </Button>
          <div>
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
            <Button onClick={onEdit}>Edit</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function getProjectStatus(project: StudentProject) {
  if (project.startDate && !project.endDate) return 'Under Development'
  if (project.endDate) return 'Completed'
  return 'Timeline Not Set'
}

function formatDate(value: string | null) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00Z`)
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
