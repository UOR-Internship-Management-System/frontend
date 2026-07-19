import { SkeletonBlock } from '../components/feedback/SkeletonBlock'
import { SkeletonPageHeader, SkeletonShape, SkeletonStatusRegion } from './SkeletonPrimitives'

export function CvConfigurationSkeleton({ announce = true }: { announce?: boolean }) {
  const content = (
    <div className="skeleton-stack">
      <div aria-hidden="true" className="skeleton-section-heading">
        <div className="skeleton-stack">
          <SkeletonShape height={28} width={270} />
          <SkeletonShape height={12} radius="pill" width={420} />
        </div>
      </div>
      <div aria-hidden="true" className="skeleton-card skeleton-stack">
        <SkeletonShape height={16} width="58%" />
        <SkeletonShape height={12} radius="pill" width="72%" />
      </div>
      <div aria-hidden="true" className="skeleton-cv-source-grid" data-testid="cv-selection-groups">
        {Array.from({ length: 5 }, (_, group) => (
          <fieldset className="skeleton-selection-group" data-skeleton-selection-group key={group}>
            <SkeletonShape height={18} width="52%" />
            {Array.from({ length: group % 2 === 0 ? 3 : 2 }, (_, option) => (
              <div className="skeleton-section-heading" key={option}>
                <SkeletonShape height={20} radius="sm" width={20} />
                <SkeletonBlock decorative lineWidths={['82%', '58%']} lines={2} variant="inline" />
              </div>
            ))}
            <SkeletonShape height={36} radius="pill" width={150} />
          </fieldset>
        ))}
      </div>
    </div>
  )
  return announce ? (
    <SkeletonStatusRegion label="Loading CV configuration">{content}</SkeletonStatusRegion>
  ) : (
    content
  )
}

export function CvPreviewPaperSkeleton({ announce = true }: { announce?: boolean }) {
  const content = (
    <div
      aria-hidden="true"
      className="skeleton-cv-paper"
      data-testid="cv-preview-paper-skeleton"
      style={{ minHeight: 680 }}
    >
      <SkeletonShape height={30} width="62%" />
      <SkeletonBlock
        decorative
        lineWidths={['82%', '92%', '76%', '88%', '66%']}
        lines={5}
        variant="inline"
      />
      <SkeletonShape height={1} radius="none" />
      <SkeletonBlock
        decorative
        lineWidths={['72%', '84%', '58%', '76%', '64%', '52%']}
        lines={6}
        variant="inline"
      />
      <SkeletonShape height={1} radius="none" />
      <SkeletonBlock
        decorative
        lineWidths={['88%', '80%', '70%', '62%']}
        lines={4}
        variant="inline"
      />
    </div>
  )
  return announce ? (
    <SkeletonStatusRegion label="Generating CV preview">{content}</SkeletonStatusRegion>
  ) : (
    content
  )
}

export function CvActionBarSkeleton() {
  return (
    <div aria-hidden="true" className="s5-cv-action-bar" data-testid="cv-action-buttons">
      <SkeletonShape height={42} radius="pill" width={160} />
      <SkeletonShape height={42} radius="pill" width={150} />
      <SkeletonShape height={42} radius="pill" width={190} />
    </div>
  )
}

export function CvBuilderSkeleton() {
  return (
    <SkeletonStatusRegion className="content-stack" label="Loading CV Builder">
      <SkeletonPageHeader />
      <div aria-hidden="true" className="skeleton-card skeleton-stack">
        <SkeletonShape height={18} width={280} />
        <SkeletonShape height={12} radius="pill" width="74%" />
      </div>
      <section aria-hidden="true" className="section-card">
        <CvConfigurationSkeleton announce={false} />
      </section>
      <section aria-hidden="true" className="section-card skeleton-stack">
        <SkeletonShape height={28} width={220} />
        <CvPreviewPaperSkeleton announce={false} />
      </section>
      <CvActionBarSkeleton />
    </SkeletonStatusRegion>
  )
}
