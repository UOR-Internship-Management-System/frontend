import { SkeletonBlock } from '../components/feedback/SkeletonBlock'
import { SkeletonShape, SkeletonStatusRegion } from './SkeletonPrimitives'

export function GatewaySkeleton() {
  return (
    <SkeletonStatusRegion className="gateway-page" label="Loading access gateway">
      <section aria-hidden="true" className="gateway-hero skeleton-stack">
        <SkeletonShape height={18} radius="pill" width={190} />
        <SkeletonShape height={52} width="min(600px, 90%)" />
        <SkeletonBlock
          decorative
          lineWidths={['min(720px, 94%)', 'min(520px, 78%)']}
          lines={2}
          variant="inline"
        />
      </section>
      <section aria-hidden="true" className="gateway-access skeleton-stack">
        <div className="gateway-access-header skeleton-stack">
          <SkeletonShape height={30} width={210} />
          <SkeletonShape height={12} radius="pill" width={420} />
        </div>
        <div className="gateway-split-panel">
          {[2, 1].map((actions, index) => (
            <article className="gateway-card skeleton-card-stack" key={index}>
              <SkeletonShape height={52} radius="circle" width={52} />
              <SkeletonShape height={26} width={120} />
              <SkeletonBlock decorative lineWidths={['90%', '72%']} lines={2} variant="inline" />
              <div className="gateway-actions">
                {Array.from({ length: actions }, (_, action) => (
                  <SkeletonShape height={42} radius="pill" width={120} key={action} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </SkeletonStatusRegion>
  )
}
