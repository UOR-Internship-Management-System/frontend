import { Button } from '../../../shared/components/ui/Button'
import { Modal } from '../../../shared/components/overlays/Modal'
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
    <Modal onClose={onClose} title={project.title} description="Portfolio project details">
      <div className="s4-projects-details">
        <dl>
          <div>
            <dt>Description</dt>
            <dd>{project.description || 'Not provided'}</dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd>
              {project.startDate || 'No start date'} – {project.endDate || 'Ongoing'}
            </dd>
          </div>
          <div>
            <dt>CV inclusion</dt>
            <dd>
              {project.includeInCv ? 'Included in generated CV' : 'Not included in generated CV'}
            </dd>
          </div>
        </dl>
        <div>
          <h3>Skills</h3>
          <ProjectSkillChips skills={project.skills} />
        </div>
        {project.repositoryUrl || project.demoUrl ? (
          <div className="s4-projects-links">
            {project.repositoryUrl ? (
              <a href={project.repositoryUrl} rel="noreferrer noopener" target="_blank">
                Open repository
              </a>
            ) : null}
            {project.demoUrl ? (
              <a href={project.demoUrl} rel="noreferrer noopener" target="_blank">
                Open demo
              </a>
            ) : null}
          </div>
        ) : null}
        <div className="modal-actions">
          <Button onClick={onDelete} variant="secondary">
            Delete project
          </Button>
          <Button onClick={onEdit}>Edit project</Button>
        </div>
      </div>
    </Modal>
  )
}
