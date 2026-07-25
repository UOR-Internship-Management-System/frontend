import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import type { CvView } from '../types/cvBuilderTypes'
import { CvActionBar } from './CvActionBar'

export type CvOutputPanelProps = {
  currentCv?: CvView
  savedCvPending: boolean
  savedCvUnavailable: boolean
  previewSaved: boolean
  configurationDirty: boolean
  configurationReady: boolean
  downloadPending: boolean
  expired: boolean
  hasPreview: boolean
  hasSavedCv: boolean
  previewPending: boolean
  savePending: boolean
  onDownload: () => void
  onGenerate: () => void
  onSave: () => void
}

export function CvOutputPanel({
  configurationDirty,
  configurationReady,
  currentCv,
  downloadPending,
  expired,
  hasPreview,
  hasSavedCv,
  onDownload,
  onGenerate,
  onSave,
  previewPending,
  previewSaved,
  savedCvPending,
  savedCvUnavailable,
  savePending,
}: CvOutputPanelProps) {
  return (
    <SectionCard aria-labelledby="cv-output-title" className="s5-cv-output-panel">
      <div className="s5-section-heading">
        <div>
          <h2 id="cv-output-title">CV output and actions</h2>
          <p>Generate, save, and download the Student-owned ATS-compliant CV.</p>
        </div>
      </div>

      {savedCvPending ? (
        <div aria-label="Loading saved CV details" className="s5-cv-output-summary" role="status">
          <SkeletonBlock lines={4} />
        </div>
      ) : currentCv ? (
        <dl className="s5-cv-output-meta">
          <div>
            <dt>Saved PDF</dt>
            <dd>{currentCv.pdfFile.fileName}</dd>
          </div>
          <div>
            <dt>File size</dt>
            <dd>{currentCv.fileSizeLabel}</dd>
          </div>
          <div>
            <dt>Generated</dt>
            <dd>{currentCv.generatedAtLabel}</dd>
          </div>
          <div>
            <dt>Last saved</dt>
            <dd>{currentCv.savedAtLabel}</dd>
          </div>
        </dl>
      ) : (
        <div className="s5-cv-output-summary" role="status">
          <span aria-hidden="true" className="material-symbols-outlined">
            {savedCvUnavailable ? 'cloud_off' : 'draft'}
          </span>
          <div>
            <strong>{savedCvUnavailable ? 'Saved CV details unavailable' : 'No saved CV yet'}</strong>
            <span>
              {savedCvUnavailable
                ? 'Retry the saved CV request before replacing the current version.'
                : 'Generate a preview, review it, and save the current CV version.'}
            </span>
          </div>
        </div>
      )}

      {previewSaved ? (
        <p className="s5-cv-saved-preview-note" role="status">
          The displayed preview is saved as the current CV version.
        </p>
      ) : null}

      <CvActionBar
        configurationDirty={configurationDirty}
        configurationReady={configurationReady}
        downloadPending={downloadPending}
        expired={expired}
        hasPreview={hasPreview}
        hasSavedCv={hasSavedCv}
        onDownload={onDownload}
        onGenerate={onGenerate}
        onSave={onSave}
        previewPending={previewPending}
        previewSaved={previewSaved}
        savePending={savePending}
      />

      <p className="s5-cv-source-privacy-note">
        The backend keeps the LaTeX source private. This page exposes only the sanitized ATS preview
        and the saved PDF.
      </p>
    </SectionCard>
  )
}
