import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import type {
  ApiActivityResponse,
  ApiAdminStudentCvSupportingDataResponse,
  ApiAwardResponse,
  ApiCertificateResponse,
  ApiExperienceResponse,
  ApiProjectResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { useStudentDeepDive } from '../hooks/useStudentDeepDive'

type DeepDiveState = ReturnType<typeof useStudentDeepDive>
type AllowedPageSize = 20 | 50 | 100
const pageSizes = [20, 50, 100] as const

export function StudentDeepDiveSections({
  supportingData,
  deepDive,
}: {
  supportingData: ApiAdminStudentCvSupportingDataResponse
  deepDive: DeepDiveState
}) {
  return (
    <>
      <DeclaredSkillsSection state={deepDive.declaredSkills} />
      <ProjectsSection state={deepDive.projects} />
      <AcademicRecordsSection state={deepDive.academicRecords} />
      <ExperienceSection items={supportingData.experiences} />
      <CertificateSection items={supportingData.certificates} />
      <AwardSection items={supportingData.awards} />
      <ActivitySection items={supportingData.activities} />
    </>
  )
}

function DeclaredSkillsSection({ state }: { state: DeepDiveState['declaredSkills'] }) {
  const { data } = state.result
  return (
    <DeepDiveSection count={data?.page.totalElements} id="declared-skills" title="Declared skills">
      <CollectionSearch
        label="Search declared skills"
        onSearch={(search) => state.updateQuery({ search })}
        value={state.query.search}
      />
      <SectionQueryState
        empty={data?.items.length === 0}
        emptyMessage="This Student has not declared any skills."
        error={state.result.error}
        isError={state.result.isError}
        isPending={state.result.isPending}
        onRetry={() => void state.result.refetch()}
      >
        <div className="deep-dive-skill-grid">
          {data?.items.map((skill) => (
            <article className="deep-dive-skill-card" key={skill.declaredSkillId}>
              <strong>{skill.skillName}</strong>
              <span>{formatEnum(skill.competencyLevel)} competency</span>
              <StatusBadge tone="neutral">Declared skill</StatusBadge>
            </article>
          ))}
        </div>
        <CollectionPagination
          label="Declared skills pagination"
          onPageChange={(page) => state.updateQuery({ page })}
          onPageSizeChange={(size) => state.updateQuery({ size })}
          page={state.query.page}
          pageSize={state.query.size}
          totalElements={data?.page.totalElements}
          totalPages={data?.page.totalPages ?? 0}
        />
      </SectionQueryState>
    </DeepDiveSection>
  )
}

function ProjectsSection({ state }: { state: DeepDiveState['projects'] }) {
  const { data } = state.result
  return (
    <DeepDiveSection count={data?.page.totalElements} id="projects" title="Project portfolio">
      <CollectionSearch
        label="Search project portfolio"
        onSearch={(search) => state.updateQuery({ search })}
        value={state.query.search}
      />
      <SectionQueryState
        empty={data?.items.length === 0}
        emptyMessage="This Student has not added any projects."
        error={state.result.error}
        isError={state.result.isError}
        isPending={state.result.isPending}
        onRetry={() => void state.result.refetch()}
      >
        <div className="deep-dive-record-list">
          {data?.items.map((project) => (
            <ProjectCard key={project.projectId} project={project} />
          ))}
        </div>
        <CollectionPagination
          label="Projects pagination"
          onPageChange={(page) => state.updateQuery({ page })}
          onPageSizeChange={(size) => state.updateQuery({ size })}
          page={state.query.page}
          pageSize={state.query.size}
          totalElements={data?.page.totalElements}
          totalPages={data?.page.totalPages ?? 0}
        />
      </SectionQueryState>
    </DeepDiveSection>
  )
}

function ProjectCard({ project }: { project: ApiProjectResponse }) {
  return (
    <article className="deep-dive-record-card">
      <div className="deep-dive-record-heading">
        <div>
          <h3>{project.title}</h3>
          <p>{formatDateRange(project.startDate, project.endDate)}</p>
        </div>
        {project.includeInCv ? <StatusBadge tone="neutral">Included in CV</StatusBadge> : null}
      </div>
      <p>{project.description || 'No project description provided.'}</p>
      {project.skills.length > 0 ? (
        <ul aria-label={`${project.title} skills`} className="deep-dive-chip-list">
          {project.skills.map((skill) => (
            <li key={skill.skillId}>{skill.name}</li>
          ))}
        </ul>
      ) : null}
      {project.repositoryUrl || project.demoUrl ? (
        <div className="deep-dive-link-row">
          {project.repositoryUrl ? (
            <SafeExternalLink href={project.repositoryUrl}>Repository</SafeExternalLink>
          ) : null}
          {project.demoUrl ? (
            <SafeExternalLink href={project.demoUrl}>Live demonstration</SafeExternalLink>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function AcademicRecordsSection({ state }: { state: DeepDiveState['academicRecords'] }) {
  const { data } = state.result
  return (
    <DeepDiveSection
      count={data?.page.totalElements}
      id="academic-results"
      title="Academic results"
    >
      <CollectionSearch
        label="Search academic records"
        onSearch={(search) => state.updateQuery({ search })}
        value={state.query.search}
      />
      <SectionQueryState
        empty={data?.items.length === 0}
        emptyMessage="No committed academic records are available for this Student."
        error={state.result.error}
        isError={state.result.isError}
        isPending={state.result.isPending}
        onRetry={() => void state.result.refetch()}
      >
        <div className="table-responsive deep-dive-academic-table">
          <table>
            <caption className="visually-hidden">Committed official academic records</caption>
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col">Period</th>
                <th scope="col">Credits</th>
                <th scope="col">Grade</th>
                <th scope="col">Grade point</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((record) => (
                <tr key={record.academicRecordId}>
                  <td data-label="Course">
                    <strong>{record.courseCode}</strong>
                    <span>{record.courseTitle}</span>
                  </td>
                  <td data-label="Period">{record.periodLabel}</td>
                  <td data-label="Credits">{record.creditsLabel}</td>
                  <td data-label="Grade">{record.letterGrade}</td>
                  <td data-label="Grade point">{record.gradePointLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CollectionPagination
          label="Academic records pagination"
          onPageChange={(page) => state.updateQuery({ page })}
          onPageSizeChange={(size) => state.updateQuery({ size })}
          page={state.query.page}
          pageSize={state.query.size}
          totalElements={data?.page.totalElements}
          totalPages={data?.page.totalPages ?? 0}
        />
      </SectionQueryState>
    </DeepDiveSection>
  )
}

function ExperienceSection({ items }: { items: ApiExperienceResponse[] }) {
  return (
    <SupportingSection
      emptyMessage="No work experience has been added."
      id="experience"
      items={items}
      title="Work experience"
    >
      {(experience) => (
        <article className="deep-dive-record-card" key={experience.id}>
          <div className="deep-dive-record-heading">
            <div>
              <h3>{experience.positionTitle}</h3>
              <p>
                {experience.organization}
                {experience.location ? ` · ${experience.location}` : ''}
              </p>
            </div>
            {experience.currentRole ? <StatusBadge tone="success">Current role</StatusBadge> : null}
          </div>
          <p className="deep-dive-record-period">
            {formatDateRange(experience.startDate, experience.endDate, experience.currentRole)}
          </p>
          {experience.description ? <p>{experience.description}</p> : null}
        </article>
      )}
    </SupportingSection>
  )
}

function CertificateSection({ items }: { items: ApiCertificateResponse[] }) {
  return (
    <SupportingSection
      emptyMessage="No certificates have been added."
      id="certificates"
      items={items}
      title="Credentials and certifications"
    >
      {(certificate) => (
        <article className="deep-dive-record-card" key={certificate.id}>
          <div className="deep-dive-record-heading">
            <div>
              <h3>{certificate.title}</h3>
              <p>
                {certificate.issuer} · {formatDate(certificate.issueDate)}
              </p>
            </div>
          </div>
          <div className="deep-dive-link-row">
            {certificate.credentialUrl ? (
              <SafeExternalLink href={certificate.credentialUrl}>
                Credential reference
              </SafeExternalLink>
            ) : null}
            {certificate.evidence ? (
              <SafeExternalLink href={certificate.evidence.url}>
                Attached evidence: {certificate.evidence.fileName}
              </SafeExternalLink>
            ) : null}
          </div>
        </article>
      )}
    </SupportingSection>
  )
}

function AwardSection({ items }: { items: ApiAwardResponse[] }) {
  return (
    <SupportingSection
      emptyMessage="No awards have been added."
      id="awards"
      items={items}
      title="Awards and achievements"
    >
      {(award) => (
        <article className="deep-dive-record-card" key={award.id}>
          <div className="deep-dive-record-heading">
            <div>
              <h3>{award.title}</h3>
              <p>
                {award.issuer} · {formatDate(award.awardDate)}
              </p>
            </div>
          </div>
          {award.description ? <p>{award.description}</p> : null}
        </article>
      )}
    </SupportingSection>
  )
}

function ActivitySection({ items }: { items: ApiActivityResponse[] }) {
  return (
    <SupportingSection
      emptyMessage="No extracurricular activities have been added."
      id="activities"
      items={items}
      title="Extracurricular activities"
    >
      {(activity) => (
        <article className="deep-dive-record-card" key={activity.id}>
          <div className="deep-dive-record-heading">
            <div>
              <h3>{activity.activityName}</h3>
              <p>
                {activity.roleTitle} · {formatDateRange(activity.startDate, activity.endDate)}
              </p>
            </div>
          </div>
          {activity.description ? <p>{activity.description}</p> : null}
        </article>
      )}
    </SupportingSection>
  )
}

function SupportingSection<T>({
  children,
  emptyMessage,
  id,
  items,
  title,
}: {
  children: (item: T) => ReactNode
  emptyMessage: string
  id: string
  items: T[]
  title: string
}) {
  return (
    <DeepDiveSection count={items.length} id={id} title={title}>
      {items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="deep-dive-record-list">{items.map(children)}</div>
      )}
    </DeepDiveSection>
  )
}

function DeepDiveSection({
  children,
  count,
  id,
  title,
}: {
  children: ReactNode
  count?: number
  id: string
  title: string
}) {
  return (
    <SectionCard aria-labelledby={`${id}-title`} className="deep-dive-section" id={id}>
      <header className="deep-dive-section-heading">
        <div>
          <p className="section-eyebrow">Administrative inspection</p>
          <h2 id={`${id}-title`}>{title}</h2>
        </div>
        {count !== undefined ? (
          <span className="deep-dive-count">
            {count} {count === 1 ? 'record' : 'records'}
          </span>
        ) : (
          <span className="read-only-indicator">Read only</span>
        )}
      </header>
      {children}
    </SectionCard>
  )
}

function SectionQueryState({
  children,
  empty,
  emptyMessage,
  error,
  isError,
  isPending,
  onRetry,
}: {
  children: ReactNode
  empty: boolean
  emptyMessage: string
  error: unknown
  isError: boolean
  isPending: boolean
  onRetry: () => void
}) {
  if (isPending) return <SkeletonBlock label="Loading section" lines={3} variant="card" />
  if (isError) {
    const mapped = mapApiError(error, 'protected')
    return (
      <div className="deep-dive-section-error" role="alert">
        <strong>Unable to load this section</strong>
        <p>{mapped.message}</p>
        <button className="button button-secondary" onClick={onRetry} type="button">
          Try again
        </button>
      </div>
    )
  }
  if (empty) return <EmptyState message={emptyMessage} />
  return children
}

function CollectionSearch({
  label,
  onSearch,
  value,
}: {
  label: string
  onSearch: (value: string) => void
  value: string
}) {
  const [input, setInput] = useState(value)
  useEffect(() => setInput(value), [value])
  function submit(event: FormEvent) {
    event.preventDefault()
    onSearch(input.trim().slice(0, 120))
  }
  return (
    <form className="deep-dive-search" onSubmit={submit}>
      <SearchInput
        aria-label={label}
        onChange={(event) => setInput(event.target.value)}
        placeholder={label}
        value={input}
      />
      <button className="button button-secondary" type="submit">
        Search
      </button>
      {value ? (
        <button
          className="button button-secondary"
          onClick={() => {
            setInput('')
            onSearch('')
          }}
          type="button"
        >
          Clear
        </button>
      ) : null}
    </form>
  )
}

function CollectionPagination({
  label,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  totalElements,
  totalPages,
}: {
  label: string
  onPageChange: (page: number) => void
  onPageSizeChange: (size: AllowedPageSize) => void
  page: number
  pageSize: AllowedPageSize
  totalElements?: number
  totalPages: number
}) {
  return (
    <PaginationBar
      label={label}
      onPageChange={onPageChange}
      onPageSizeChange={(size) => onPageSizeChange(size as AllowedPageSize)}
      page={page}
      pageSizeOptions={pageSizes}
      size={pageSize}
      totalElements={totalElements}
      totalPages={totalPages}
    />
  )
}

function SafeExternalLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      {children}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, (letter) => letter.toUpperCase())
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(`${value}T00:00:00Z`),
  )
}
function formatDateRange(start: string | null, end: string | null, current = false) {
  if (!start && !end) return 'Dates not provided'
  return `${start ? formatDate(start) : 'Start not provided'} – ${current ? 'Present' : end ? formatDate(end) : 'End not provided'}`
}
