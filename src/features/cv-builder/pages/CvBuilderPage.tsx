import { useEffect, useMemo, useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { WorkspaceSkeleton } from '../../../shared/skeletons/WorkspaceSkeleton'
import { CvActionBar } from '../components/CvActionBar'
import { CvConfigurationPanel } from '../components/CvConfigurationPanel'
import { CvPreviewPanel } from '../components/CvPreviewPanel'
import { CvSourceFreshnessNotice } from '../components/CvSourceFreshnessNotice'
import { useCvFreshness } from '../hooks/useCvFreshness'
import { useCurrentCv } from '../hooks/useCurrentCv'
import {
  useCvActivitySources,
  useCvAwardSources,
  useCvCertificateSources,
  useCvExperienceSources,
} from '../hooks/useCvProfileSources'
import { useCvPreview } from '../hooks/useCvPreview'
import { useCvProjectOptions } from '../hooks/useCvProjectOptions'
import { useDownloadCv } from '../hooks/useDownloadCv'
import { useSaveCv } from '../hooks/useSaveCvVersion'
import {
  defaultCvOptionalSections,
  mapCvFreshness,
  mapCvPreviewRequest,
  type CvOptionalSections,
} from '../mappers/cvMapper'
import type { CvPreview } from '../types/cvBuilderTypes'

export function CvBuilderPage() {
  const [optionalSections, setOptionalSections] = useState<CvOptionalSections>(() => ({
    ...defaultCvOptionalSections,
  }))
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [configurationDirty, setConfigurationDirty] = useState(false)
  const [preview, setPreview] = useState<CvPreview | null>(null)
  const [previewExpired, setPreviewExpired] = useState(false)
  const initializedProjects = useRef(false)
  const initializedSavedConfiguration = useRef(false)
  const freshness = useCvFreshness()
  const currentCv = useCurrentCv(freshness.data?.status !== 'NOT_SAVED' && freshness.isSuccess)
  const experienceSources = useCvExperienceSources()
  const certificateSources = useCvCertificateSources()
  const awardSources = useCvAwardSources()
  const activitySources = useCvActivitySources()
  const projectOptions = useCvProjectOptions()
  const previewMutation = useCvPreview({
    onSuccess: (confirmedPreview) => {
      setPreview(confirmedPreview)
      setConfigurationDirty(false)
      setPreviewExpired(Date.parse(confirmedPreview.expiresAt) <= Date.now())
    },
  })
  const saveMutation = useSaveCv()
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
    if (initializedSavedConfiguration.current || !currentCv.data || configurationDirty || preview) {
      return
    }
    initializedSavedConfiguration.current = true
    setOptionalSections(currentCv.data.configuration.optionalSections)
    setSelectedProjectIds(currentCv.data.configuration.includedProjectIds)
  }, [configurationDirty, currentCv.data, preview])

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
  const hasSavedCv =
    currentCv.data !== undefined ||
    (freshness.data?.status !== undefined && freshness.data.status !== 'NOT_SAVED')

  const markConfigurationChanged = () => setConfigurationDirty(true)

  const toggleOptionalSection = (section: keyof CvOptionalSections) => {
    setOptionalSections((current) => ({ ...current, [section]: !current[section] }))
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
    previewMutation.mutate(mapCvPreviewRequest(optionalSections, selectedProjectIds))
  }

  const savePreview = () => {
    if (!preview || configurationDirty || previewExpired) return
    if (Date.parse(preview.expiresAt) <= Date.now()) {
      setPreviewExpired(true)
      return
    }
    saveMutation.mutate(
      { previewId: preview.previewId, revision: currentCv.data?.revision ?? null },
      {
        onError: (error) => {
          if (mapApiError(error, 'protected').code === 'CV_PREVIEW_EXPIRED') {
            setPreviewExpired(true)
          }
        },
      },
    )
  }

  if (freshness.isPending && projectOptions.isPending) {
    return <WorkspaceSkeleton variant="cv-builder" />
  }

  return (
    <main className="content-stack s5-cv-builder-page">
      <PageHeader
        description="Configure structured source data, confirm a generated preview, and save your active CV."
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
        activitySources={mapSourceQuery(activitySources)}
        awardSources={mapSourceQuery(awardSources)}
        certificateSources={mapSourceQuery(certificateSources)}
        experienceSources={mapSourceQuery(experienceSources)}
        onRetryProjects={() => void projectOptions.refetch()}
        onToggleProject={toggleProject}
        onToggleOptionalSection={toggleOptionalSection}
        optionalSections={optionalSections}
        projects={projectOptions.data}
        projectsError={projectError}
        projectsLoading={projectOptions.isPending}
        selectedProjectIds={selectedProjectIds}
      />

      <CvPreviewPanel
        dirty={configurationDirty}
        error={previewError}
        expired={previewExpired}
        isPending={previewMutation.isPending}
        onRetry={generatePreview}
        preview={preview}
      />

      <CvActionBar
        configurationDirty={configurationDirty}
        downloadPending={downloadMutation.pendingTargetKey === 'current'}
        expired={previewExpired}
        hasPreview={preview !== null}
        hasSavedCv={hasSavedCv}
        onDownload={() => downloadMutation.mutate({ kind: 'current' })}
        onGenerate={generatePreview}
        onSave={savePreview}
        previewPending={previewMutation.isPending}
        savePending={saveMutation.isPending}
      />
    </main>
  )
}

function mapSourceQuery<T extends { id: string; label: string; cvInclude: boolean }>(query: {
  data?: T[]
  isPending: boolean
  error: Error | null
  refetch: () => unknown
}) {
  return {
    items: query.data,
    isPending: query.isPending,
    error: query.error ? mapApiError(query.error, 'protected') : null,
    onRetry: () => void query.refetch(),
  }
}
