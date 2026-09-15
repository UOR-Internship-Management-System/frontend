import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { Button } from '../../../shared/components/ui/Button'
import type { PageMetadata } from '../../../shared/types/pagination'
import type { StudentProject } from '../types/studentProjectTypes'
import { ProjectCard } from './ProjectCard'

export function ProjectRepositoryGrid({
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
        <SearchBar
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
          action={search ? undefined : <Button onClick={onAdd}>Add project</Button>}
          message={
            search
              ? `No projects match "${search}".`
              : 'Add your first portfolio project and choose whether it appears in your CV.'
          }
          title={search ? 'No matching projects' : 'No projects yet'}
        />
      ) : (
        <>
          <div aria-label="Saved projects" className="s4-projects-grid">
            {items.map((project) => (
              <ProjectCard key={project.projectId} onSelect={onSelect} project={project} />
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
