import { Button } from '../../../shared/components/ui/Button'

export function CvActionBar({
  configurationDirty,
  configurationReady,
  downloadPending,
  expired,
  hasPreview,
  hasSavedCv,
  previewPending,
  previewSaved,
  savePending,
  onDownload,
  onGenerate,
  onSave,
}: {
  configurationDirty: boolean
  configurationReady: boolean
  expired: boolean
  hasPreview: boolean
  hasSavedCv: boolean
  previewPending: boolean
  previewSaved: boolean
  savePending: boolean
  downloadPending: boolean
  onGenerate: () => void
  onSave: () => void
  onDownload: () => void
}) {
  const generateLabel = !hasPreview
    ? 'Generate Preview'
    : configurationDirty
      ? 'Update Preview'
      : 'Regenerate Preview'

  return (
    <section aria-label="CV actions" className="s5-cv-action-bar">
      <Button
        disabled={!configurationReady || savePending}
        icon={
          <span aria-hidden="true" className="material-symbols-outlined">
            preview
          </span>
        }
        isLoading={previewPending}
        onClick={onGenerate}
      >
        {generateLabel}
      </Button>
      <Button
        disabled={!hasPreview || configurationDirty || expired || previewPending || previewSaved}
        icon={
          <span aria-hidden="true" className="material-symbols-outlined">
            save
          </span>
        }
        isLoading={savePending}
        onClick={onSave}
        variant="secondary"
      >
        Save Current CV Version
      </Button>
      <Button
        disabled={!hasSavedCv || savePending}
        icon={
          <span aria-hidden="true" className="material-symbols-outlined">
            download
          </span>
        }
        isLoading={downloadPending}
        onClick={onDownload}
        variant="secondary"
      >
        Download Current CV PDF
      </Button>
      <span aria-live="polite" className="visually-hidden">
        {savePending ? 'Saving current CV version' : null}
        {downloadPending ? 'Downloading CV PDF' : null}
      </span>
    </section>
  )
}
