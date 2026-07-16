import { SkeletonBlock } from '../components/feedback/SkeletonBlock'

export function StudentProjectsSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading Projects" className="content-stack" role="status">
      <span className="visually-hidden">Loading Projects</span>
      <header aria-hidden="true" className="page-header">
        <SkeletonBlock lines={2} />
      </header>
      <section aria-hidden="true" className="section-card">
        <SkeletonBlock lines={7} />
      </section>
    </main>
  )
}
