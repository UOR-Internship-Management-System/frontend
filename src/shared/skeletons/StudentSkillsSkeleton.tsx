import {
  SkeletonPageHeader,
  SkeletonPagination,
  SkeletonShape,
  SkeletonStatusRegion,
  SkeletonTableGrid,
} from './SkeletonPrimitives'

const declaredColumns =
  'minmax(180px,1.15fr) minmax(180px,1.1fr) minmax(150px,.9fr) minmax(150px,.9fr) minmax(180px,1fr)'

export function AddSkillOptionsSkeleton({ announce = true }: { announce?: boolean }) {
  const content = (
    <div aria-hidden="true" className="s4-skills-declare-form">
      <div className="s4-skills-available-search">
        <SkeletonShape height={48} radius="md" width="100%" />
      </div>
      <div className="s4-skills-add-fields">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="skeleton-field" key={index}>
            <SkeletonShape height={12} radius="pill" width={index === 0 ? 96 : 132} />
            <SkeletonShape height={48} radius="md" />
          </div>
        ))}
      </div>
      <div className="s4-skills-form-actions">
        <SkeletonShape height={44} radius="pill" width={128} />
      </div>
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
        {Array.from({ length: 9 }, (_, index) => (
          <article className="s4-skills-result skeleton-skill-result" key={index}>
            <SkeletonShape height={22} radius="pill" width={index % 2 === 0 ? 112 : 148} />
            <SkeletonShape height={18} width={index % 3 === 0 ? '58%' : '72%'} />
            <div className="s4-skills-result-footer">
              <SkeletonShape height={12} radius="pill" width="40%" />
              <SkeletonShape height={12} radius="pill" width="30%" />
            </div>
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
        <div aria-hidden="true" className="s4-skills-list-toolbar">
          <SkeletonShape height={48} radius="md" width="min(100%, 460px)" />
        </div>
      ) : null}
      <SkeletonTableGrid
        columns={5}
        gridTemplateColumns={declaredColumns}
        rows={6}
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
      <section aria-hidden="true" className="section-card s4-skills-add-card">
        <div className="s4-skills-section-heading">
          <div className="skeleton-stack">
            <SkeletonShape height={28} width={190} />
            <SkeletonShape height={14} width="min(100%, 560px)" />
          </div>
        </div>
        <AddSkillOptionsSkeleton announce={false} />
      </section>
      <section aria-hidden="true" className="section-card s4-skills-available-card">
        <div className="s4-skills-section-heading">
          <div className="skeleton-stack">
            <SkeletonShape height={28} width={260} />
            <SkeletonShape height={14} width="min(100%, 520px)" />
          </div>
          <SkeletonShape height={32} radius="pill" width={106} />
        </div>
        <TaxonomyResultsSkeleton announce={false} />
      </section>
      <section aria-hidden="true" className="section-card s4-skills-list-card">
        <div className="s4-skills-section-heading">
          <div className="skeleton-stack">
            <SkeletonShape height={28} width={210} />
            <SkeletonShape height={14} width="min(100%, 460px)" />
          </div>
        </div>
        <DeclaredSkillsListSkeleton announce={false} />
      </section>
    </SkeletonStatusRegion>
  )
}
