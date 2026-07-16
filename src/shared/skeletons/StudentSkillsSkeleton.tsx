import { SkeletonBlock } from '../components/feedback/SkeletonBlock'

export function StudentSkillsSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading Declared Skills"
      className="content-stack"
      role="status"
    >
      <span className="visually-hidden">Loading Declared Skills</span>
      <header className="page-header" aria-hidden="true">
        <SkeletonBlock lines={2} />
      </header>
      <section className="section-card" aria-hidden="true">
        <SkeletonBlock lines={6} />
      </section>
      <section className="section-card" aria-hidden="true">
        <SkeletonBlock lines={5} />
      </section>
    </main>
  )
}
