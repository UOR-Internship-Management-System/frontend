import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { StudentProject } from '../types/studentProjectTypes'
import { formatDate, getProjectStatus } from './ProjectCard'
import { ProjectSkillChips } from './ProjectSkillChips'

function ProjectLinkButton({ children, href }: { children: string; href: string }) {
  return (
    <a
      className="button m3-button button-outlined m3-button--outlined m3-button--size-md"
      href={href}
      rel="noreferrer noopener"
      target="_blank"
    >
      <span className="button-content">
        {children}
        <span aria-hidden="true" className="button-icon-trailing material-symbols-outlined">
          open_in_new
        </span>
      </span>
    </a>
  )
}

export function ProjectDetailsPanel({
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
    <div className="s4-projects-details">
      <div className="s4-projects-details-status">
        <h3 className="s4-projects-details-title">{project.title}</h3>
        <StatusBadge tone="neutral">{getProjectStatus(project)}</StatusBadge>
        <StatusBadge tone={project.includeInCv ? 'success' : 'neutral'}>
          {project.includeInCv ? 'CV included' : 'CV excluded'}
        </StatusBadge>
      </div>

      <dl className="s4-projects-details-grid">
        <div>
          <dt>Start date</dt>
          <dd>{formatDate(project.startDate) ?? 'Not provided'}</dd>
        </div>
        <div>
          <dt>End date</dt>
          <dd>{formatDate(project.endDate) ?? (project.startDate ? 'Present' : 'Not provided')}</dd>
        </div>
      </dl>

      <section
        aria-labelledby="project-details-description-title"
        className="s4-projects-details-section"
      >
        <h3 id="project-details-description-title">Project abstract</h3>
        <p className="s4-projects-details-description">{project.description || 'Not provided'}</p>
      </section>

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
        <h3 id="project-details-links-title">Project links</h3>
        {project.repositoryUrl || project.demoUrl ? (
          <div className="s4-projects-links">
            {project.repositoryUrl ? (
              <ProjectLinkButton href={project.repositoryUrl}>Open repository</ProjectLinkButton>
            ) : null}
            {project.demoUrl ? (
              <ProjectLinkButton href={project.demoUrl}>Open demo</ProjectLinkButton>
            ) : null}
          </div>
        ) : (
          <p className="s4-projects-no-links">No project links provided.</p>
        )}
      </section>

      <div className="s4-projects-details-actions">
        <Button onClick={onDelete} variant="text">
          Remove project
        </Button>
        <div>
          <Button onClick={onClose} variant="text">
            Close
          </Button>
          <Button onClick={onEdit}>Edit</Button>
        </div>
      </div>
    </div>
  )
}
