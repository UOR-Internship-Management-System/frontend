import { SkeletonStatusRegion } from './SkeletonPrimitives'

export function GatewaySkeleton() {
  return (
    <SkeletonStatusRegion className="gateway-v2-preload" label="Loading access gateway">
      <div aria-hidden="true" className="gateway-v2-preload-bg" />
    </SkeletonStatusRegion>
  )
}
