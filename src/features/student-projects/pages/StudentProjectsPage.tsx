import { useEffect, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { clampPage } from '../../../shared/utils/clampPage'
import { ProjectDeleteDialog } from '../components/ProjectDeleteDialog'
import { ProjectDetailsModal } from '../components/ProjectDetailsModal'
import { ProjectForm } from '../components/ProjectForm'
import { ProjectRepository } from '../components/ProjectRepository'
import { useProject } from '../hooks/useProject'
import { useCreateProject, useDeleteProject, useUpdateProject } from '../hooks/useProjectMutations'
import { useStudentProjects } from '../hooks/useStudentProjects'
import {
  mapStudentProjectCreateRequest,
  mapStudentProjectToForm,
  mapStudentProjectUpdateRequest,
} from '../mappers/studentProjectMapper'
import type { StudentProjectFormValues } from '../types/studentProjectTypes'

const pageSize = 5
type ProjectOverlay = 'create' | 'details' | 'edit' | 'delete' | null

export function StudentProjectsPage() {
  const { notify } = useNotifications()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('updatedAt,desc')
  const [page, setPage] = useState(0)
  const [overlay, setOverlay] = useState<ProjectOverlay>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [conflictMessage, setConflictMessage] = useState<string>()
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const projects = useStudentProjects({
    page,
    size: pageSize,
    sort,
    search: debouncedSearch || undefined,
  })
  const selected = useProject(overlay && overlay !== 'create' ? selectedProjectId : null)
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const deleteMutation = useDeleteProject()

  useEffect(() => {
    if (!projects.data) return
    setPage((current) => clampPage(current, projects.data.page.totalElements, pageSize))
  }, [projects.data])

  const closeOverlay = () => {
    setOverlay(null)
    setSelectedProjectId(null)
  }

  const createProject = async (values: StudentProjectFormValues) => {
    const created = await createMutation.mutateAsync(mapStudentProjectCreateRequest(values))
    notify({
      tone: 'success',
      title: 'Project created',
      message: `${created.title} was added to your portfolio.`,
    })
    setConflictMessage(undefined)
    closeOverlay()
  }

  const handleMissingProject = async () => {
    closeOverlay()
    await projects.refetch()
    notify({
      tone: 'info',
      title: 'Project no longer available',
      message: 'The portfolio list was refreshed.',
    })
  }

  const updateProject = async (values: StudentProjectFormValues) => {
    const current = selected.data
    if (!current) throw new TypeError('Load the project before updating it.')
    try {
      const saved = await updateMutation.mutateAsync({
        projectId: current.projectId,
        request: mapStudentProjectUpdateRequest(values, mapStudentProjectToForm(current)),
        version: current.version,
      })
      notify({
        tone: 'success',
        title: 'Project updated',
        message: `${saved.title} was updated.`,
      })
      setConflictMessage(undefined)
      closeOverlay()
    } catch (reason) {
      const error = mapApiError(reason, 'protected')
      if (error.status === 412 || error.status === 428) {
        setConflictMessage(
          'This project changed after it was loaded. Your draft is preserved against the refreshed version.',
        )
        await Promise.all([selected.refetch(), projects.refetch()])
      } else if (error.status === 404) {
        await handleMissingProject()
        return
      }
      throw reason
    }
  }

  const deleteProject = async () => {
    const current = selected.data
    if (!current) throw new TypeError('Load the project before deleting it.')
    try {
      await deleteMutation.mutateAsync({ projectId: current.projectId, version: current.version })
      const nextTotal = Math.max(0, (projects.data?.page.totalElements ?? 1) - 1)
      setPage((currentPage) => clampPage(currentPage, nextTotal, pageSize))
      notify({
        tone: 'success',
        title: 'Project deleted',
        message: `${current.title} was removed from your portfolio.`,
      })
      setConflictMessage(undefined)
      closeOverlay()
    } catch (reason) {
      const error = mapApiError(reason, 'protected')
      if (error.status === 412 || error.status === 428) {
        setConflictMessage('The project changed. Review the refreshed details before retrying.')
        await Promise.all([selected.refetch(), projects.refetch()])
      } else if (error.status === 404) {
        await handleMissingProject()
        return
      }
      throw reason
    }
  }

  const mappedError = projects.error ? mapApiError(projects.error, 'protected') : null

  return (
    <main className="content-stack s4-projects-page">
      <PageHeader
        actions={<Button onClick={() => setOverlay('create')}>Add project</Button>}
        description="Maintain Student-owned portfolio evidence and choose what appears in your generated CV."
        eyebrow="Student workspace"
        title="Projects"
      />

      {conflictMessage ? (
        <div className="s4-projects-conflict" role="alert">
          <strong>Review the latest project</strong>
          <p>{conflictMessage}</p>
        </div>
      ) : null}

      <SectionCard aria-labelledby="project-repository-title" className="s4-projects-repository">
        <div className="s4-projects-section-heading">
          <div>
            <h2 id="project-repository-title">Project repository</h2>
            <p>{projects.data?.page.totalElements ?? 0} projects from server metadata.</p>
          </div>
        </div>

        {projects.isPending ? <ProjectListSkeleton /> : null}
        {mappedError ? (
          <ErrorState
            correlationId={mappedError.correlationId}
            message={mappedError.message}
            onAction={() => void projects.refetch()}
            title="Projects unavailable"
          />
        ) : null}
        {!projects.isPending && !mappedError && projects.data?.items.length === 0 ? (
          <EmptyState
            action={
              search ? undefined : <Button onClick={() => setOverlay('create')}>Add project</Button>
            }
            message={
              search
                ? `No projects match “${search}”.`
                : 'Add portfolio evidence and link canonical taxonomy skills.'
            }
            title={search ? 'No matching projects' : 'No projects yet'}
          />
        ) : null}
        {!projects.isPending && !mappedError && projects.data ? (
          <ProjectRepository
            items={projects.data.items}
            onPageChange={setPage}
            onSearchChange={(value) => {
              setSearch(value)
              setPage(0)
            }}
            onSelect={(projectId) => {
              setSelectedProjectId(projectId)
              setOverlay('details')
            }}
            onSortChange={(value) => {
              setSort(value)
              setPage(0)
            }}
            page={projects.data.page}
            search={search}
            sort={sort}
          />
        ) : null}
      </SectionCard>

      {overlay === 'create' ? (
        <ProjectForm mode="create" onCancel={closeOverlay} onSubmit={createProject} />
      ) : null}
      {overlay && overlay !== 'create' && selected.isPending ? (
        <Modal onClose={closeOverlay} title="Loading project">
          <div aria-label="Loading project details" role="status">
            <SkeletonBlock lines={5} />
          </div>
        </Modal>
      ) : null}
      {overlay && overlay !== 'create' && selected.error ? (
        <Modal onClose={closeOverlay} title="Project unavailable">
          <ErrorState
            message={mapApiError(selected.error, 'protected').message}
            onAction={() => void selected.refetch()}
            title="Unable to load project details"
          />
        </Modal>
      ) : null}
      {overlay === 'details' && selected.data ? (
        <ProjectDetailsModal
          onClose={closeOverlay}
          onDelete={() => setOverlay('delete')}
          onEdit={() => setOverlay('edit')}
          project={selected.data}
        />
      ) : null}
      {overlay === 'edit' && selected.data ? (
        <ProjectForm
          initialSkills={selected.data.skills}
          initialValues={mapStudentProjectToForm(selected.data)}
          mode="edit"
          onCancel={() => setOverlay('details')}
          onSubmit={updateProject}
        />
      ) : null}
      {overlay === 'delete' && selected.data ? (
        <ProjectDeleteDialog
          onClose={() => setOverlay('details')}
          onConfirm={deleteProject}
          project={selected.data}
        />
      ) : null}
    </main>
  )
}

function ProjectListSkeleton() {
  return (
    <div aria-label="Loading projects" className="s4-projects-list-skeleton" role="status">
      <span className="visually-hidden">Loading projects</span>
      <SkeletonBlock lines={6} />
    </div>
  )
}
