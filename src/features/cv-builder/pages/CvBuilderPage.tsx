import { useEffect, useMemo, useRef, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { CvBuilderSkeleton } from '../../../shared/skeletons/CvBuilderSkeleton'
import { CvActionBar } from '../components/CvActionBar'
import { CvConfigurationPanel } from '../components/CvConfigurationPanel'
import type { CvSelectionItem } from '../components/CvRecordSelectionGroup'
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
  cvSelectionKeys,
  emptyCvRecordSelections,
  mapCvFreshness,
  mapCvPreviewRequest,
  type CvRecordSelections,
} from '../mappers/cvMapper'
import type { CvPreview } from '../types/cvBuilderTypes'

type SelectionSources = Record<keyof CvRecordSelections, CvSelectionItem[] | undefined>

export function CvBuilderPage() {
  const [selections, setSelections] = useState<CvRecordSelections>(() =>
    cloneSelections(emptyCvRecordSelections),
  )
  const [configurationDirty, setConfigurationDirty] = useState(false)
  const [selectionWarning, setSelectionWarning] = useState<string | null>(null)
  const [preview, setPreview] = useState<CvPreview | null>(null)
  const [previewExpired, setPreviewExpired] = useState(false)
  const initializedConfiguration = useRef(false)
  const freshness = useCvFreshness()
  const currentCvEnabled = freshness.isSuccess && freshness.data.status !== 'NOT_SAVED'
  const currentCv = useCurrentCv(currentCvEnabled)
  const experienceSources = useCvExperienceSources()
  const certificateSources = useCvCertificateSources()
  const awardSources = useCvAwardSources()
  const activitySources = useCvActivitySources()
  const projectOptions = useCvProjectOptions()
  const projectItems = useMemo<CvSelectionItem[] | undefined>(
    () =>
      projectOptions.data?.map((project) => ({
        id: project.projectId,
        label: project.title,
        defaultSelected: project.includeInCv,
      })),
    [projectOptions.data],
  )
  const sources: SelectionSources = useMemo(
    () => ({
      includedExperienceIds: experienceSources.data,
      includedProjectIds: projectItems,
      includedCertificateIds: certificateSources.data,
      includedAwardIds: awardSources.data,
      includedActivityIds: activitySources.data,
    }),
    [
      activitySources.data,
      awardSources.data,
      certificateSources.data,
      experienceSources.data,
      projectItems,
    ],
  )
  const sourceQueries = [
    experienceSources,
    projectOptions,
    certificateSources,
    awardSources,
    activitySources,
  ]
  const allSourcesLoaded = cvSelectionKeys.every((key) => sources[key] !== undefined)
  const sourceHasError = sourceQueries.some((query) => query.error !== null)
  const savedConfigurationReady = !currentCvEnabled || currentCv.isSuccess
  const configurationReady =
    freshness.isSuccess && allSourcesLoaded && !sourceHasError && savedConfigurationReady
  const sourceIdentity = cvSelectionKeys
    .map(
      (key) =>
        `${key}:${
          sources[key]
            ?.map((item) => item.id)
            .sort()
            .join(',') ?? 'loading'
        }`,
    )
    .join('|')

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
    if (initializedConfiguration.current || !configurationReady) return
    initializedConfiguration.current = true

    if (currentCv.data) {
      const reconciled = reconcileSelections(currentCv.data.configuration, sources)
      setSelections(reconciled.selections)
      if (reconciled.removedCount > 0) {
        setConfigurationDirty(true)
        setSelectionWarning(
          `${reconciled.removedCount} previously selected record${reconciled.removedCount === 1 ? ' is' : 's are'} no longer available. Generate a new preview before saving.`,
        )
      }
      return
    }

    setSelections(defaultSelections(sources))
  }, [configurationReady, currentCv.data, sources])

  useEffect(() => {
    if (!initializedConfiguration.current || !allSourcesLoaded) return
    setSelections((current) => {
      const reconciled = reconcileSelections(current, sources)
      if (reconciled.removedCount === 0) return current
      setConfigurationDirty(true)
      setSelectionWarning(
        `${reconciled.removedCount} selected record${reconciled.removedCount === 1 ? ' was' : 's were'} removed because the source data is no longer available.`,
      )
      return reconciled.selections
    })
  }, [allSourcesLoaded, sourceIdentity, sources])

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
  const currentCvError = currentCv.error ? mapApiError(currentCv.error, 'protected') : null
  const previewError = previewMutation.error
    ? mapApiError(previewMutation.error, 'protected')
    : null
  const hasSavedCv =
    currentCv.data !== undefined ||
    (freshness.data?.status !== undefined && freshness.data.status !== 'NOT_SAVED')

  const toggleRecord = (selection: keyof CvRecordSelections, recordId: string) => {
    setSelections((current) => {
      const selected = current[selection]
      if (!selected.includes(recordId) && selected.length >= 100) return current
      return {
        ...current,
        [selection]: selected.includes(recordId)
          ? selected.filter((id) => id !== recordId)
          : [...selected, recordId],
      }
    })
    setSelectionWarning(null)
    setConfigurationDirty(true)
  }

  const generatePreview = () => {
    if (!configurationReady) return
    previewMutation.mutate(mapCvPreviewRequest(selections))
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

  if (freshness.isPending && sourceQueries.every((query) => query.isPending)) {
    return <CvBuilderSkeleton />
  }

  return (
    <main className="content-stack s5-cv-builder-page">
      <PageHeader
        description="Select individual source records, confirm a generated preview, and save your active CV."
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
      {currentCvError ? (
        <ErrorState
          correlationId={currentCvError.correlationId}
          message={currentCvError.message}
          onAction={() => void currentCv.refetch()}
          title="Saved CV configuration unavailable"
        />
      ) : null}
      {selectionWarning ? (
        <p className="s5-cv-selection-warning" role="alert">
          {selectionWarning}
        </p>
      ) : null}

      <CvConfigurationPanel
        activitySources={mapSourceQuery(activitySources)}
        awardSources={mapSourceQuery(awardSources)}
        certificateSources={mapSourceQuery(certificateSources)}
        experienceSources={mapSourceQuery(experienceSources)}
        onToggleRecord={toggleRecord}
        projectSources={mapSourceQuery(projectOptions, projectItems)}
        selections={selections}
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
        configurationReady={configurationReady}
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

function mapSourceQuery<
  TQuery extends { isPending: boolean; error: unknown; refetch: () => unknown },
>(query: TQuery, items?: CvSelectionItem[]) {
  const queryItems = 'data' in query ? (query.data as CvSelectionItem[] | undefined) : undefined
  return {
    items: items ?? queryItems,
    isPending: query.isPending,
    error: query.error ? mapApiError(query.error, 'protected') : null,
    onRetry: () => void query.refetch(),
  }
}

function defaultSelections(sources: SelectionSources): CvRecordSelections {
  return Object.fromEntries(
    cvSelectionKeys.map((key) => [
      key,
      (sources[key] ?? [])
        .filter((item) => item.defaultSelected)
        .map((item) => item.id)
        .slice(0, 100)
        .sort(),
    ]),
  ) as CvRecordSelections
}

function reconcileSelections(
  selections: CvRecordSelections,
  sources: SelectionSources,
): { selections: CvRecordSelections; removedCount: number } {
  let removedCount = 0
  const reconciled = Object.fromEntries(
    cvSelectionKeys.map((key) => {
      const accessible = new Set((sources[key] ?? []).map((item) => item.id))
      const retained = selections[key].filter((id) => accessible.has(id)).sort()
      removedCount += selections[key].length - retained.length
      return [key, retained]
    }),
  ) as CvRecordSelections
  return { selections: reconciled, removedCount }
}

function cloneSelections(selections: CvRecordSelections): CvRecordSelections {
  return Object.fromEntries(
    cvSelectionKeys.map((key) => [key, [...selections[key]]]),
  ) as CvRecordSelections
}
