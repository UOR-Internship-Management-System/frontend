import { SkeletonStatusRegion } from './SkeletonPrimitives'

export function GatewaySkeleton() {
  return (
    <SkeletonStatusRegion className="gateway-v2-preload" label="Loading access gateway">
      <div aria-hidden="true" className="gateway-v2-preload-decoration" />
      <div aria-hidden="true" className="gateway-v2-preload-logo-stage">
        <img alt="" className="gateway-v2-preload-logo" src="/logo (2).png" />
      </div>
    </SkeletonStatusRegion>
  )
}
