import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { StudentProject } from '../types/studentProjectTypes'
import { ProjectSkillChips } from './ProjectSkillChips'

export function ProjectCard({
  onSelect,
  project,
}: {
  project: StudentProject
  onSelect: (projectId: string) => void
}) {
  const status = getProjectStatus(project)

  return (
    <Card
      aria-label={`Project ${project.title}`}
      className="s4-projects-card"
      interactive
      onClick={() => onSelect(project.projectId)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(project.projectId)
        }
      }}
      role="button"
      tabIndex={0}
      variant="outlined"
    >
      <CardHeader className="s4-projects-card-heading">
        <CardTitle>{project.title}</CardTitle>
        <div className="s4-projects-card-badges">
          <StatusBadge tone="neutral">{status}</StatusBadge>
          <StatusBadge tone={project.includeInCv ? 'success' : 'neutral'}>
            {project.includeInCv ? 'CV included' : 'CV excluded'}
          </StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="s4-projects-card-content">
        <p className="s4-projects-card-timeline">{formatTimeline(project)}</p>
        <p className="s4-projects-card-description">
          {project.description || 'No project description provided.'}
        </p>
        <ProjectSkillChips skills={project.skills} />
        <span aria-hidden="true" className="s4-projects-card-affordance">
          View details
          <span className="material-symbols-outlined">chevron_right</span>
        </span>
      </CardContent>
    </Card>
  )
}

export function getProjectStatus(project: StudentProject) {
  if (project.startDate && !project.endDate) return 'Under Development'
  if (project.endDate) return 'Completed'
  return 'Timeline Not Set'
}

export function formatTimeline(project: StudentProject) {
  if (!project.startDate && !project.endDate) return 'Timeline not provided'
  return `${formatDate(project.startDate) ?? 'Start date not set'} – ${
    formatDate(project.endDate) ?? 'Present'
  }`
}

export function formatDate(value: string | null) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00Z`)
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
