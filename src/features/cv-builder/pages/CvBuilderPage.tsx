import { useEffect, useMemo, useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { WorkspaceSkeleton } from '../../../shared/skeletons/WorkspaceSkeleton'
import { CvActionBar } from '../components/CvActionBar'
import { CvConfigurationPanel } from '../components/CvConfigurationPanel'
import { CvPreviewPanel } from '../components/CvPreviewPanel'
import { CvSourceFreshnessNotice } from '../components/CvSourceFreshnessNotice'
import { CvVersionList } from '../components/CvVersionList'
import { LatexOutputPanel } from '../components/LatexOutputPanel'
import { useCvFreshness } from '../hooks/useCvFreshness'
import { useCvPreview } from '../hooks/useCvPreview'
import { useCvProjectOptions } from '../hooks/useCvProjectOptions'
import { useCvVersions } from '../hooks/useCvVersions'
import { useDownloadCv } from '../hooks/useDownloadCv'
import { useSaveCvVersion } from '../hooks/useSaveCvVersion'
import { defaultCvSectionOrder, mapCvFreshness, mapCvPreviewRequest } from '../mappers/cvMapper'
import type { CvPreview, CvSection } from '../types/cvBuilderTypes'

const versionPageSize = 5

export function CvBuilderPage() {
  const [sectionOrder, setSectionOrder] = useState<CvSection[]>(() => [...defaultCvSectionOrder])
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [configurationDirty, setConfigurationDirty] = useState(false)
  const [preview, setPreview] = useState<CvPreview | null>(null)
  const [previewExpired, setPreviewExpired] = useState(false)
  const [versionPage, setVersionPage] = useState(0)
  const initializedProjects = useRef(false)
  const freshness = useCvFreshness()
  const projectOptions = useCvProjectOptions()
  const versions = useCvVersions({ page: versionPage, size: versionPageSize, sort: 'savedAt,desc' })
  const previewMutation = useCvPreview({
    onSuccess: (confirmedPreview) => {
      setPreview(confirmedPreview)
      setConfigurationDirty(false)
      setPreviewExpired(Date.parse(confirmedPreview.expiresAt) <= Date.now())
    },
  })
  const saveMutation = useSaveCvVersion()
  const downloadMutation = useDownloadCv()

  useEffect(() => {
    if (initializedProjects.current || !projectOptions.data) return
    initializedProjects.current = true
    setSelectedProjectIds(
      projectOptions.data
        .filter((project) => project.includeInCv)
        .map((project) => project.projectId),
    )
  }, [projectOptions.data])

  useEffect(() => {
    if (!preview) return undefined
    const remaining = Date.parse(preview.expiresAt) - Date.now()
    if (remaining <= 0) {
      setPreviewExpired(true)
      return undefined
    }
    const timeout = window.setTimeout(
      () => setPreviewExpired(true),
      Math.min(remaining, 2_147_483_647),
    )
    return () => window.clearTimeout(timeout)
  }, [preview])

  const freshnessView = useMemo(
    () => (freshness.data ? mapCvFreshness(freshness.data) : null),
    [freshness.data],
  )
  const freshnessError = freshness.error ? mapApiError(freshness.error, 'protected') : null
  const projectError = projectOptions.error ? mapApiError(projectOptions.error, 'protected') : null
  const previewError = previewMutation.error
    ? mapApiError(previewMutation.error, 'protected')
    : null
  const versionsError = versions.error ? mapApiError(versions.error, 'protected') : null
  const hasSavedVersion = (versions.data?.page.totalElements ?? 0) > 0

  const markConfigurationChanged = () => setConfigurationDirty(true)

  const toggleSection = (section: CvSection) => {
    setSectionOrder((current) =>
      current.includes(section)
        ? current.length === 1
          ? current
          : current.filter((item) => item !== section)
        : [...current, section],
    )
    markConfigurationChanged()
  }

  const moveSection = (section: CvSection, direction: -1 | 1) => {
    setSectionOrder((current) => {
      const from = current.indexOf(section)
      const to = from + direction
      if (from < 0 || to < 0 || to >= current.length) return current
      const next = [...current]
      ;[next[from], next[to]] = [next[to], next[from]]
      return next
    })
    markConfigurationChanged()
  }

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((current) =>
      current.includes(projectId)
        ? current.filter((item) => item !== projectId)
        : [...current, projectId],
    )
    markConfigurationChanged()
  }

  const generatePreview = () => {
    previewMutation.mutate(mapCvPreviewRequest(sectionOrder, selectedProjectIds))
  }

  const savePreview = () => {
    if (!preview || configurationDirty || previewExpired) return
    if (Date.parse(preview.expiresAt) <= Date.now()) {
      setPreviewExpired(true)
      return
    }
    saveMutation.mutate(preview.previewId, {
      onError: (error) => {
        if (mapApiError(error, 'protected').code === 'CV_PREVIEW_EXPIRED') {
          setPreviewExpired(true)
        }
      },
    })
  }

  if (freshness.isPending && projectOptions.isPending) {
    return <WorkspaceSkeleton variant="cv-builder" />
  }

  return (
    <main className="content-stack s5-cv-builder-page">
      <PageHeader
        description="Configure structured source data, confirm a generated preview, and save an immutable PDF version."
        eyebrow="Student workspace · Sprint 5"
        title="CV Builder"
      />

      {freshnessView ? <CvSourceFreshnessNotice freshness={freshnessView} /> : null}
      {freshnessError ? (
        <ErrorState
          correlationId={freshnessError.correlationId}
          message={freshnessError.message}
          onAction={() => void freshness.refetch()}
          title="CV freshness unavailable"
        />
      ) : null}

      <CvConfigurationPanel
        onMoveSection={moveSection}
        onRetryProjects={() => void projectOptions.refetch()}
        onToggleProject={toggleProject}
        onToggleSection={toggleSection}
        projects={projectOptions.data}
        projectsError={projectError}
        projectsLoading={projectOptions.isPending}
        sectionOrder={sectionOrder}
        selectedProjectIds={selectedProjectIds}
      />

      <div className="s5-cv-workspace">
        <CvPreviewPanel
          dirty={configurationDirty}
          error={previewError}
          expired={previewExpired}
          isPending={previewMutation.isPending}
          onRetry={generatePreview}
          preview={preview}
        />
        <LatexOutputPanel latexSource={preview?.latexSource} />
      </div>

      <CvActionBar
        configurationDirty={configurationDirty}
        downloadPending={downloadMutation.pendingTargetKey === 'latest'}
        expired={previewExpired}
        hasPreview={preview !== null}
        hasSavedVersion={hasSavedVersion}
        onDownloadLatest={() => downloadMutation.mutate({ kind: 'latest' })}
        onGenerate={generatePreview}
        onSave={savePreview}
        previewPending={previewMutation.isPending}
        savePending={saveMutation.isPending}
      />

      <CvVersionList
        data={versions.data}
        error={versionsError}
        isPending={versions.isPending}
        onDownload={(cvVersionId) => downloadMutation.mutate({ kind: 'version', cvVersionId })}
        onPageChange={setVersionPage}
        onRetry={() => void versions.refetch()}
        pendingTargetKey={downloadMutation.pendingTargetKey}
      />
    </main>
  )
}
