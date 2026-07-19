import { SkeletonBlock } from '../components/feedback/SkeletonBlock'
import { SkeletonPageHeader, SkeletonShape, SkeletonStatusRegion } from './SkeletonPrimitives'

export function StudentDeepDiveSkeleton() {
  return (
    <SkeletonStatusRegion className="content-stack" label="Loading Student Deep-Dive">
      <SkeletonPageHeader />
      <section aria-hidden="true" className="section-card skeleton-stack">
        <SkeletonShape height={28} width={260} />
        <SkeletonBlock decorative lineWidths={['92%', '80%']} lines={2} variant="inline" />
        <SkeletonShape height={42} radius="pill" width={190} />
      </section>
    </SkeletonStatusRegion>
  )
}
