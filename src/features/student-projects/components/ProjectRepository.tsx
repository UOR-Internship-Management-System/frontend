import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { SortSelect } from '../../../shared/components/data/SortSelect'
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
  onSortChange,
  page,
  search,
  sort,
}: {
  items: StudentProject[]
  page: PageMetadata
  search: string
  sort: string
  onAdd: () => void
  onPageChange: (page: number) => void
  onSearchChange: (search: string) => void
  onSortChange: (sort: string) => void
  onSelect: (projectId: string) => void
}) {
  return (
    <>
      <div className="s4-projects-toolbar">
        <SearchInput
          aria-label="Search projects"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search title, description, or skill"
          value={search}
        />
        <SortSelect
          aria-label="Sort projects"
          onChange={(event) => onSortChange(event.target.value)}
          value={sort}
        >
          <option value="updatedAt,desc">Recently updated</option>
          <option value="title,asc">Title A–Z</option>
          <option value="title,desc">Title Z–A</option>
          <option value="startDate,desc">Newest start date</option>
          <option value="startDate,asc">Oldest start date</option>
        </SortSelect>
      </div>

      {items.length === 0 ? (
        <EmptyState
          action={search ? undefined : <Button onClick={onAdd}>Add project</Button>}
          message={
            search
              ? `No projects match “${search}”.`
              : 'Add portfolio evidence and link canonical taxonomy skills.'
          }
          title={search ? 'No matching projects' : 'No projects yet'}
        />
      ) : (
        <>
          <div className="s4-projects-table-wrap">
            <table className="s4-projects-table">
              <thead>
                <tr>
                  <th scope="col">Project</th>
                  <th scope="col">Timeline</th>
                  <th scope="col">Skills</th>
                  <th scope="col">CV</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((project) => (
                  <tr key={project.projectId}>
                    <td>
                      <strong>{project.title}</strong>
                      {project.description ? <p>{project.description}</p> : null}
                      {project.repositoryUrl ? (
                        <a href={project.repositoryUrl} rel="noreferrer noopener" target="_blank">
                          Repository
                        </a>
                      ) : null}
                    </td>
                    <td>{formatTimeline(project)}</td>
                    <td>
                      <ProjectSkillChips skills={project.skills} />
                    </td>
                    <td>
                      <StatusBadge tone={project.includeInCv ? 'success' : 'neutral'}>
                        {project.includeInCv ? 'Included' : 'Excluded'}
                      </StatusBadge>
                    </td>
                    <td>
                      <Button onClick={() => onSelect(project.projectId)} variant="secondary">
                        View details
                        <span className="visually-hidden"> for {project.title}</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div aria-label="Project cards" className="s4-projects-mobile-list">
            {items.map((project) => (
              <article className="s4-projects-mobile-card" key={project.projectId}>
                <div className="s4-projects-card-heading">
                  <h3>{project.title}</h3>
                  <StatusBadge tone={project.includeInCv ? 'success' : 'neutral'}>
                    {project.includeInCv ? 'CV included' : 'CV excluded'}
                  </StatusBadge>
                </div>
                {project.description ? <p>{project.description}</p> : null}
                <p>
                  <strong>Timeline:</strong> {formatTimeline(project)}
                </p>
                <ProjectSkillChips skills={project.skills} />
                <Button onClick={() => onSelect(project.projectId)} variant="secondary">
                  View {project.title}
                </Button>
              </article>
            ))}
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

function formatTimeline(project: StudentProject) {
  if (!project.startDate && !project.endDate) return 'Not provided'
  return `${project.startDate ?? 'Unspecified'} – ${project.endDate ?? 'Ongoing'}`
}
