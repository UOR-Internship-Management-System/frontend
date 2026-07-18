import { Button } from '../../../shared/components/ui/Button'

export function CvActionBar({
  configurationDirty,
  downloadPending,
  expired,
  hasPreview,
  hasSavedCv,
  previewPending,
  savePending,
  onDownload,
  onGenerate,
  onSave,
}: {
  configurationDirty: boolean
  expired: boolean
  hasPreview: boolean
  hasSavedCv: boolean
  previewPending: boolean
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
      <Button isLoading={previewPending} onClick={onGenerate}>
        {generateLabel}
      </Button>
      <Button
        disabled={!hasPreview || configurationDirty || expired || previewPending}
        isLoading={savePending}
        onClick={onSave}
        variant="secondary"
      >
        {hasSavedCv ? 'Update Saved CV' : 'Save CV'}
      </Button>
      <Button
        disabled={!hasSavedCv}
        isLoading={downloadPending}
        onClick={onDownload}
        variant="secondary"
      >
        Download Saved PDF
      </Button>
      <span aria-live="polite" className="visually-hidden">
        {savePending ? 'Saving active CV' : null}
        {downloadPending ? 'Downloading CV PDF' : null}
      </span>
    </section>
  )
}
