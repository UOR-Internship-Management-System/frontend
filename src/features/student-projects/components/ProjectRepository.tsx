import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { PageMetadata } from '../../../shared/types/pagination'
import type { StudentProject } from '../types/studentProjectTypes'
import { ProjectSkillChips } from './ProjectSkillChips'

export function ProjectRepository({
  items,
  onAdd,
  onPageChange,
  onSearchChange,
  onSelect,
  page,
  search,
}: {
  items: StudentProject[]
  page: PageMetadata
  search: string
  onAdd: () => void
  onPageChange: (page: number) => void
  onSearchChange: (search: string) => void
  onSelect: (projectId: string) => void
}) {
  return (
    <>
      <div className="s4-projects-toolbar">
        <SearchInput
          aria-label="Search saved projects"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search saved projects"
          value={search}
        />
        <span aria-live="polite" className="s4-projects-count-pill">
          {page.totalElements} {page.totalElements === 1 ? 'project' : 'projects'}
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState
          action={search ? undefined : <Button onClick={onAdd}>Add Project</Button>}
          message={
            search
              ? `No projects match “${search}”.`
              : 'Add your first portfolio project and choose whether it appears in your CV.'
          }
          title={search ? 'No matching projects' : 'No projects yet'}
        />
      ) : (
        <>
          <div aria-label="Saved projects" className="s4-projects-list" role="list">
            {items.map((project) => {
              const status = getProjectStatus(project)
              return (
                <article
                  aria-label={`Project ${project.title}`}
                  className="s4-projects-item"
                  key={project.projectId}
                  role="listitem"
                >
                  <div className="s4-projects-item-content">
                    <div className="s4-projects-title-line">
                      <h3>{project.title}</h3>
                      <StatusBadge tone="neutral">{status}</StatusBadge>
                      <StatusBadge tone={project.includeInCv ? 'success' : 'neutral'}>
                        {project.includeInCv ? 'CV Included' : 'CV Excluded'}
                      </StatusBadge>
                    </div>

                    <div className="s4-projects-meta">
                      <span>{formatTimeline(project)}</span>
                    </div>

                    <p className="s4-projects-description">
                      {project.description || 'No project description provided.'}
                    </p>

                    <ProjectSkillChips skills={project.skills} />
                  </div>

                  <div className="s4-projects-item-action">
                    <Button onClick={() => onSelect(project.projectId)} variant="secondary">
                      Details
                      <span className="visually-hidden"> for {project.title}</span>
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>

          <PaginationBar
            label="Projects pagination"
            onPageChange={onPageChange}
            page={page.page}
            size={page.size}
            totalElements={page.totalElements}
            totalPages={page.totalPages}
          />
        </>
      )}
    </>
  )
}

function getProjectStatus(project: StudentProject) {
  if (project.startDate && !project.endDate) return 'Under Development'
  if (project.endDate) return 'Completed'
  return 'Timeline Not Set'
}

function formatTimeline(project: StudentProject) {
  if (!project.startDate && !project.endDate) return 'Timeline not provided'
  return `${formatDate(project.startDate) ?? 'Start date not set'} – ${
    formatDate(project.endDate) ?? 'Present'
  }`
}

function formatDate(value: string | null) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00Z`)
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
