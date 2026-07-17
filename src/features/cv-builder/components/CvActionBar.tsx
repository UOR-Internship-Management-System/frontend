import { Button } from '../../../shared/components/ui/Button'

export function CvActionBar({
  configurationDirty,
  downloadPending,
  expired,
  hasPreview,
  hasSavedVersion,
  previewPending,
  savePending,
  onDownloadLatest,
  onGenerate,
  onSave,
}: {
  configurationDirty: boolean
  expired: boolean
  hasPreview: boolean
  hasSavedVersion: boolean
  previewPending: boolean
  savePending: boolean
  downloadPending: boolean
  onGenerate: () => void
  onSave: () => void
  onDownloadLatest: () => void
}) {
  const generateLabel = !hasPreview
    ? 'Generate Preview'
    : configurationDirty
      ? 'Update Preview'
      : expired
        ? 'Regenerate Preview'
        : 'Regenerate Preview'

  return (
    <section aria-label="CV actions" className="s5-cv-action-bar">
      <Button isLoading={previewPending} onClick={onGenerate}>
        {generateLabel}
      </Button>
      <Button
        disabled={!hasPreview || configurationDirty || expired || previewPending}
        isLoading={savePending}
        onClick={onSave}
        variant="secondary"
      >
        Save Current CV Version
      </Button>
      <Button
        disabled={!hasSavedVersion}
        isLoading={downloadPending}
        onClick={onDownloadLatest}
        variant="secondary"
      >
        Download Latest PDF
      </Button>
      <span aria-live="polite" className="visually-hidden">
        {savePending ? 'Saving current CV version' : null}
        {downloadPending ? 'Downloading CV PDF' : null}
      </span>
    </section>
  )
}
