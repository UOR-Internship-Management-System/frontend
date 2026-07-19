import {
  SkeletonPageHeader,
  SkeletonPagination,
  SkeletonShape,
  SkeletonStatusRegion,
  SkeletonTableGrid,
} from './SkeletonPrimitives'

const declaredColumns =
  'minmax(150px,1fr) minmax(170px,1.1fr) minmax(170px,1.1fr) minmax(120px,.8fr) minmax(150px,.9fr) minmax(150px,.9fr)'

export function AddSkillOptionsSkeleton({ announce = true }: { announce?: boolean }) {
  const content = (
    <div aria-hidden="true" className="s4-skills-add-fields">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="skeleton-field" key={index}>
          <SkeletonShape height={12} radius="pill" width={index === 0 ? 96 : 132} />
          <SkeletonShape height={48} radius="md" />
        </div>
      ))}
      <SkeletonShape height={42} radius="pill" width={132} />
    </div>
  )
  return announce ? (
    <SkeletonStatusRegion label="Loading Add Skill options">{content}</SkeletonStatusRegion>
  ) : (
    content
  )
}

export function TaxonomyResultsSkeleton({ announce = true }: { announce?: boolean }) {
  const content = (
    <div className="skeleton-stack">
      <div aria-hidden="true" className="s4-skills-results">
        {Array.from({ length: 6 }, (_, index) => (
          <article className="s4-skills-result skeleton-skill-result" key={index}>
            <span className="skeleton-stack skeleton-skill-result__copy">
              <SkeletonShape height={16} width={index % 2 === 0 ? '48%' : '58%'} />
              <SkeletonShape height={12} radius="pill" width="82%" />
            </span>
            <SkeletonShape height={12} radius="pill" width={index === 1 ? 112 : 52} />
          </article>
        ))}
      </div>
      <SkeletonPagination />
    </div>
  )
  return announce ? (
    <SkeletonStatusRegion label="Loading available skills">{content}</SkeletonStatusRegion>
  ) : (
    content
  )
}

export function DeclaredSkillsListSkeleton({
  announce = true,
  includeToolbar = true,
}: {
  announce?: boolean
  includeToolbar?: boolean
}) {
  const content = (
    <div className="skeleton-stack">
      {includeToolbar ? (
        <div aria-hidden="true" className="skeleton-controls-grid">
          <SkeletonShape height={48} radius="md" />
          <SkeletonShape height={48} radius="md" />
        </div>
      ) : null}
      <SkeletonTableGrid
        columns={6}
        gridTemplateColumns={declaredColumns}
        rows={5}
        testId="declared-skills-table-skeleton"
      />
      <SkeletonPagination />
    </div>
  )
  return announce ? (
    <SkeletonStatusRegion label="Loading declared skills">{content}</SkeletonStatusRegion>
  ) : (
    content
  )
}

export function StudentSkillsSkeleton() {
  return (
    <SkeletonStatusRegion className="content-stack" label="Loading Skills workspace">
      <SkeletonPageHeader />
      <section aria-hidden="true" className="section-card skeleton-stack">
        <SkeletonShape height={28} width={170} />
        <AddSkillOptionsSkeleton announce={false} />
      </section>
      <section aria-hidden="true" className="section-card skeleton-stack">
        <SkeletonShape height={28} width={260} />
        <div className="s4-skills-taxonomy-filters">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonShape height={48} radius="md" key={index} />
          ))}
        </div>
        <TaxonomyResultsSkeleton announce={false} />
      </section>
      <section aria-hidden="true" className="section-card skeleton-stack">
        <div className="skeleton-section-heading">
          <SkeletonShape height={28} width={230} />
          <SkeletonShape height={32} radius="pill" width={120} />
        </div>
        <DeclaredSkillsListSkeleton announce={false} />
      </section>
    </SkeletonStatusRegion>
  )
}
