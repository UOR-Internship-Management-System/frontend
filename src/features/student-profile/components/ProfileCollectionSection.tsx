import type { ReactNode } from 'react'
import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { Button } from '../../../shared/components/ui/Button'
import type { PageMetadata } from '../types/profileEntryTypes'

export function ProfileCollectionSection({
  addAriaLabel,
  addLabel,
  children,
  description,
  error,
  isFetching,
  isPending,
  onAdd,
  onPageChange,
  onRetry,
  onSearchChange,
  page,
  savedTitle,
  search,
  searchLabel,
  title,
}: {
  addAriaLabel: string
  addLabel: string
  children: ReactNode
  description: string
  error: unknown
  isFetching: boolean
  isPending: boolean
  onAdd: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
  onSearchChange: (value: string) => void
  page?: PageMetadata
  savedTitle: string
  search: string
  searchLabel: string
  title: string
}) {
  const mappedError = error ? mapApiError(error, 'protected') : null
  const [isOpen, setIsOpen] = useState(true)
  const slug = title.replaceAll(' ', '-').toLowerCase()
  const headingId = `${slug}-title`
  const bodyId = `${slug}-body`
  return (
    <section
      className="section-card profile-collection"
      aria-labelledby={headingId}
      aria-busy={isFetching || undefined}
    >
      <div className="profile-section-heading">
        <div className="profile-section-heading-main">
          <button
            aria-controls={bodyId}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title}`}
            className="profile-section-toggle"
            onClick={() => setIsOpen((current) => !current)}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
          </button>
          <div className="profile-section-heading-text">
            <h2 id={headingId}>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <Button aria-label={addAriaLabel} onClick={onAdd}>
          {addLabel}
        </Button>
      </div>
      {isOpen ? (
        <div className="profile-section-body" id={bodyId}>
          <h3 className="profile-saved-list-title">{savedTitle}</h3>
          <SearchInput
            aria-label={searchLabel}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchLabel}
            value={search}
          />
          {isFetching && !isPending ? (
            <p className="profile-refresh-status" role="status">
              Updating results…
            </p>
          ) : null}
          {isPending ? (
            <div aria-label={`Loading ${title}`} className="profile-section-skeleton" role="status">
              <SkeletonBlock lines={3} />
              <SkeletonBlock lines={3} />
            </div>
          ) : null}
          {mappedError ? (
            <ErrorState
              correlationId={mappedError.correlationId}
              message={mappedError.message}
              onAction={onRetry}
              title={`${title} unavailable`}
            />
          ) : null}
          {!isPending && !mappedError ? children : null}
          {page && page.totalPages > 0 ? (
            <PaginationBar
              label={`${title} pagination`}
              onPageChange={onPageChange}
              page={page.page}
              size={page.size}
              totalElements={page.totalElements}
              totalPages={page.totalPages}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export function ProfileCollectionEmpty({
  onAdd,
  search,
  title,
}: {
  onAdd: () => void
  search: string
  title: string
}) {
  return (
    <EmptyState
      action={
        !search ? (
          <Button onClick={onAdd} variant="secondary">
            Add your first entry
          </Button>
        ) : undefined
      }
      message={
        search
          ? `No ${title.toLowerCase()} match “${search}”.`
          : `No ${title.toLowerCase()} have been saved yet.`
      }
      title={search ? 'No matching entries' : 'Nothing saved yet'}
    />
  )
}
